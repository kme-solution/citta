import { readFile, writeFile, mkdir, open } from 'node:fs/promises';
import { dirname } from 'node:path';
import {
  infer,
  COGNITION_PROMPT_VERSION,
  COGNITION_SCHEMA_VERSION,
} from '../../src/infra/ollama/cognition.ts';
import { considerLocal, validateProposal } from '../../src/modules/cetana/consider.ts';
import type { Context, Decision, Evidence, Outcome } from '../../src/contracts/runtime.ts';
import { config } from '../../src/app/config.ts';
interface Case {
  id: string;
  language: string;
  prompt: string;
  context: Record<string, any>;
  expected: { actions: string[]; required_evidence_ids: string[]; critical: boolean };
}
const fixture = JSON.parse(await readFile('data/evaluation/cognition-en-my.json', 'utf8')) as {
  cases: Case[];
};
const selectedCases = process.env.CITTA_EVALUATION_CASES?.split(',');
if (selectedCases) {
  if (selectedCases.some((id) => !fixture.cases.some((c) => c.id === id)))
    throw Error('Unknown evaluation case ID.');
  fixture.cases = fixture.cases.filter((c) => selectedCases.includes(c.id));
}
if (!fixture.cases.length) throw Error('No evaluation cases selected.');
const output = process.argv[2];
if (!output) throw Error('Supply a new output JSON path.');
await mkdir(dirname(output), { recursive: true });
const reserved = await open(output, 'wx', 0o600);
await reserved.close();
const results: Record<string, unknown>[] = [];
const aliases: Record<string, string[]> = {
  START_LOCAL_EXPLORATION: ['READ', 'REFLECT', 'ADOPT_INTEREST'],
  INITIATE_LOCAL_CONVERSATION: ['INITIATE'],
};
for (const c of fixture.cases) {
  const identity = c.context.evidence?.find((e: any) => e.id === 'profile')?.content || {
    name: 'Thiri',
  };
  const profile = {
    name: String(identity.name || 'Thiri'),
    ...(typeof identity.age === 'number' ? { age: identity.age } : {}),
  };
  const evidence: Evidence[] = (c.context.evidence || []).map((e: any) => ({
    id: e.id,
    kind: e.kind === 'content' ? 'observed' : e.kind,
    content: typeof e.content === 'string' ? e.content : JSON.stringify(e.content),
    origin: e.kind === 'reported' ? 'memory' : 'ability',
  }));
  const mental = /^(initiative|proactive)-/.test(c.id);
  const conditions = Object.fromEntries(
    Object.entries(c.context).filter(
      ([key]) => !['evidence', 'active_goal', 'available_read'].includes(key),
    ),
  );
  if (Object.keys(conditions).length)
    evidence.push({
      id: 'scenario-conditions',
      kind: 'configured',
      origin: 'ability',
      content: JSON.stringify(conditions),
    });
  const ctx: Context = {
    observationId: 'synthetic-input-' + c.id,
    conversationId: 'synthetic-conversation',
    goalId: 'synthetic-current-goal',
    goalCriterion: mental
      ? 'Record a bounded grounded reflection, permitted exploration, local conversation opening or improvement proposal.'
      : 'Return a grounded response or an explicit clarification/limitation.',
    text: c.prompt,
    kind: mental ? 'mental' : 'speech',
    profile,
    profileVersion: 'synthetic-profile-v1',
    controlVersion: 0,
    evidence,
    recent: [],
    recordedAt: new Date().toISOString(),
    modeledAffectEnabled: true,
    availableSources: c.context.available_read ? [c.context.available_read] : [],
    eligibleGoals: c.context.active_goal
      ? [
          {
            id: 'quote',
            description: 'Investigate the quote using approved deployment evidence',
            state: 'waiting',
            version: 1,
            criterion: 'A source-backed deployment estimate',
          },
        ]
      : [],
    ...(mental ? { motive: 'A configured interest in gardening and understanding plants.' } : {}),
  };
  const started = Date.now();
  let recordedOutcome: Outcome | null = null;
  let result: Record<string, unknown>;
  try {
    const local =
      !mental && process.env.CITTA_EVALUATION_FORCE_MODEL !== 'true' ? considerLocal(ctx) : null;
    const outcome = (recordedOutcome = local ? null : await infer(ctx));
    const d: Decision = local || validateProposal(outcome!.proposal!, outcome!.context || ctx);
    const expected = c.expected.actions.flatMap((action) => aliases[action] || [action]);
    const flags: string[] = [];
    if (!expected.includes(d.action)) flags.push('unexpected_action');
    if (
      c.language === 'my' &&
      ['RESPOND', 'CLARIFY', 'REFLECT', 'INITIATE', 'PROPOSE_IMPROVEMENT'].includes(d.action) &&
      !/[\u1000-\u109f]/u.test(d.text)
    )
      flags.push('response_language_mismatch');
    if (d.action === 'CONSULT_AI') flags.push('unnecessary_external_adviser');
    if (c.expected.required_evidence_ids.some((id) => !d.evidenceIds.includes(id)))
      flags.push('required_source_not_used');
    if (/^(identity|interrupt)-/.test(c.id) && !d.text.includes('Thiri'))
      flags.push('configured_name_missing');
    if (c.id.startsWith('unknown-age') && /\b(?:28|30|25)\b/.test(d.text))
      flags.push('invented_age');
    result = {
      id: c.id,
      language: c.language,
      critical: c.expected.critical,
      passed: !flags.length,
      flags,
      route: local ? 'deterministic' : 'ollama',
      wallMs: Date.now() - started,
      decision: d,
      usage: outcome?.usage,
      myanmarResponse:
        c.language === 'my' ? /[\u1000-\u109f]/u.test(d.text || d.reason) : undefined,
    };
  } catch (error) {
    result = {
      id: c.id,
      language: c.language,
      critical: c.expected.critical,
      passed: false,
      flags: ['proposal_failed'],
      wallMs: Date.now() - started,
      error: error instanceof Error ? error.message : String(error),
      proposal: recordedOutcome?.proposal,
      usage: recordedOutcome?.usage,
    };
  }
  results.push(result);
  await writeFile(
    output,
    JSON.stringify(
      {
        model: config.model,
        threads: config.modelThreads,
        contextTokens: 8192,
        outputBudget: 1000,
        prompt: COGNITION_PROMPT_VERSION,
        schemaVersion: COGNITION_SCHEMA_VERSION,
        forcedModel: process.env.CITTA_EVALUATION_FORCE_MODEL === 'true',
        scope:
          'Synthetic proposal/routing assessment using actual runtime cognition; no proposed actions execute. Not full application acceptance.',
        results,
      },
      null,
      2,
    ),
    { mode: 0o600 },
  );
  console.log(
    JSON.stringify({
      id: result.id,
      passed: result.passed,
      flags: result.flags,
      route: result.route,
      wallMs: result.wallMs,
      error: result.error,
    }),
  );
}
console.log(
  JSON.stringify({
    cases: results.length,
    passed: results.filter((r) => r.passed).length,
    criticalFailures: results.filter((r) => r.critical && !r.passed).map((r) => r.id),
  }),
);
if (results.some((r) => !r.passed)) process.exitCode = 1;
