import { test } from 'node:test';
import { Ajv } from 'ajv';
import { proposalOutputSchema } from '../src/infra/ollama/cognition.ts';
import { reviewOutcome } from '../src/modules/paccavekkhana/review.ts';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, symlink, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { considerLocal, validateProposal } from '../src/modules/cetana/consider.ts';
import { permittedFile, authorize } from '../src/modules/sikkha/authorize.ts';
import { contactDisposition } from '../src/modules/vithi/contact-policy.ts';
import { selectContext } from '../src/modules/sati/context-selection.ts';
import type { Context, Proposal } from '../src/contracts/runtime.ts';
const base: Context = {
  observationId: 'input',
  conversationId: 'conversation',
  text: '',
  kind: 'speech',
  profile: { name: 'Test identity' },
  profileVersion: 'test',
  controlVersion: 1,
  goalId: 'goal',
  evidence: [],
  recent: [],
  recordedAt: '2026-11-22T00:00:00Z',
};
const proposal: Proposal = {
  action: 'RESPOND',
  text: 'An uncertain response',
  reason: 'Evidence is incomplete.',
  evidenceIds: [],
  tone: 'undetermined',
  uncertainty: 'No independent source.',
  argument: '',
  candidateTendency: 'investigate',
  chosenTendency: 'hold',
  regulationReason: 'Do not invent evidence.',
  alternatives: [],
};
test('unknown profile fields and ambiguous input do not route to an adviser', () => {
  assert.match(
    considerLocal({ ...base, text: 'How old are you?' })!.text,
    /(?:hasn't|not).*configured/,
  );
  assert.equal(considerLocal({ ...base, text: 'Do the other one' })!.action, 'CLARIFY');
  assert.equal(considerLocal({ ...base, text: 'မင်းအသက်ဘယ်လောက်လဲ။' })!.action, 'RESPOND');
  assert.equal(considerLocal({ ...base, text: 'မင်္ဂလာပါ' })!.action, 'RESPOND');
  const named = considerLocal({ ...base, text: 'မင်းနာမည် ဘယ်လိုခေါ်လဲ။' })!;
  assert.match(named.text, /Test identity/);
  assert.deepEqual(named.evidenceIds, ['profile']);
  const unknown = considerLocal({ ...base, text: 'မင်းအသက် ဘယ်လောက်ရှိပြီလဲ။' })!;
  assert.match(unknown.text, /မသတ်မှတ်ရသေးပါ/);
  assert.doesNotMatch(unknown.text, /\d/);
});
test('cancellation preserves ambiguous scope and uses one exact eligible goal', () => {
  const goal = {
    id: 'target',
    description: 'Pending work',
    state: 'waiting',
    version: 2,
    criterion: 'Observed outcome',
  };
  assert.equal(
    considerLocal({ ...base, text: 'Forget it', eligibleGoals: [goal, { ...goal, id: 'other' }] })!
      .action,
    'CLARIFY',
  );
  assert.equal(
    considerLocal({ ...base, text: 'Stop that task', eligibleGoals: [goal] })!.argument,
    'target',
  );
});
test('model evidence and authority are checked independently', () => {
  assert.throws(
    () => validateProposal({ ...proposal, evidenceIds: ['invented'] }, base),
    /outside/,
  );
  assert.throws(
    () =>
      validateProposal(
        { ...proposal, action: 'CONSULT_AI', argument: 'Guess it', uncertainty: '' },
        base,
      ),
    /knowledge gap/,
  );
  assert.throws(
    () => authorize('CONSULT_AI', { ...base, kind: 'mental' }, 'Question', true),
    /Self-originated/,
  );
  assert.throws(() => authorize('READ', base, '/etc/passwd', true), /relative/);
  assert.throws(
    () => validateProposal({ ...proposal, action: 'CANCEL_GOAL', argument: 'other-agent' }, base),
    /eligible/,
  );
});
test('file scope rejects traversal, symlinks, oversized files and permits actual evidence', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'citta-scope-'));
  try {
    const root = join(dir, 'root');
    await mkdir(root);
    await writeFile(join(root, 'note.txt'), 'Actual test evidence');
    await writeFile(join(dir, 'outside.txt'), 'Outside scope');
    await symlink(join(dir, 'outside.txt'), join(root, 'link.txt'));
    await writeFile(join(root, 'large.txt'), 'x'.repeat(32769));
    assert.equal(await permittedFile(root, 'note.txt'), join(root, 'note.txt'));
    await assert.rejects(permittedFile(root, '../outside.txt'), /outside/);
    await assert.rejects(permittedFile(root, 'link.txt'), /outside/);
    await assert.rejects(permittedFile(root, 'large.txt'), /32 KB/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
test('quiet, unanswered contact and expiry cannot be overridden by a proposed opening', () => {
  const snapshot = {
    quiet: false,
    pending: false,
    lastContactAt: null,
    intervalMs: 3600000,
    now: '2026-11-22T01:00:00Z',
    expiresAt: '2026-11-23T01:00:00Z',
  };
  assert.equal(contactDisposition({ ...snapshot, quiet: true }).action, 'defer');
  assert.equal(contactDisposition({ ...snapshot, pending: true }).action, 'defer');
  assert.equal(
    contactDisposition({ ...snapshot, expiresAt: '2026-11-21T00:00:00Z' }).action,
    'expire',
  );
  assert.equal(contactDisposition(snapshot).action, 'deliver');
});
test('context selection records explicit excerpts and enforces an input budget', () => {
  const selected = selectContext({
    ...base,
    evidence: [{ id: 'source', kind: 'observed', content: 'မြန်မာ'.repeat(2000) }],
  });
  assert.match(selected.evidence[0].content, /Excerpt only/);
  assert.ok(Buffer.byteLength(JSON.stringify(selected)) <= 10000);
  assert.throws(() => selectContext({ ...base, text: 'x'.repeat(15000) }), /budget/);
});

test('recall excludes current input and inferred interpretations from saved reported memory', () => {
  const result = considerLocal({
    ...base,
    text: 'recall',
    evidence: [
      { id: 'input', kind: 'reported', content: 'recall', origin: 'observation' },
      { id: 'note', kind: 'reported', content: 'Actual saved note', origin: 'memory' },
      {
        id: 'hypothesis',
        kind: 'inferred',
        content: 'Unconfirmed interpretation',
        origin: 'memory',
      },
    ],
  })!;
  assert.equal(result.text, 'Actual saved note');
  assert.deepEqual(result.evidenceIds, ['note']);
});
test('adviser-only evidence cannot complete an independently supported criterion', () => {
  const result = validateProposal(
    {
      ...proposal,
      goalReview: {
        criterion: 'Determine the supported estimate',
        status: 'met',
        evidenceIds: ['advice'],
      },
      evidenceIds: ['advice'],
    },
    {
      ...base,
      text: 'Determine the supported estimate',
      evidence: [
        {
          id: 'advice',
          kind: 'reported',
          origin: 'ability',
          content: 'Unverified Codex advice: three days',
        },
      ],
    },
  );
  assert.equal(result.goalReview?.status, 'unknown');
  assert.match(result.uncertainty!, /no independently observed support/);
});
test('conversation preferences require operator provenance and cannot be adopted by internal reflection', () => {
  const preference = {
    ...proposal,
    action: 'SET_PREFERENCE' as const,
    text: 'en',
    argument: 'response-language',
    evidenceIds: ['input'],
  };
  assert.equal(validateProposal(preference, base).action, 'SET_PREFERENCE');
  assert.throws(
    () => validateProposal(preference, { ...base, kind: 'mental' }),
    /operator provenance/,
  );
  assert.throws(
    () => validateProposal({ ...preference, argument: 'permissions' }, base),
    /supported key/,
  );
});

test('generated review retains the recorded criterion through context selection', () => {
  const ctx = { ...base, goalCriterion: 'Answer the actual request from available evidence' };
  assert.equal(selectContext(ctx).goalCriterion, ctx.goalCriterion);
  assert.throws(
    () =>
      validateProposal(
        {
          ...proposal,
          goalReview: { criterion: 'An easier invented task', status: 'met', evidenceIds: [] },
        },
        ctx,
      ),
    /recorded completion criterion/,
  );
  assert.equal(
    validateProposal(
      {
        ...proposal,
        goalReview: { criterion: ctx.goalCriterion, status: 'unknown', evidenceIds: [] },
      },
      ctx,
    ).goalReview?.status,
    'unknown',
  );
});

test('local transport failure remains a visible failure with saved-input guidance', () => {
  const result = reviewOutcome('INFER', { ok: false, error: 'fetch failed' });
  assert.equal(result.criterion, 'not_met');
  assert.equal(result.state, 'exhausted');
  assert.match(result.reason, /local model connection/);
  assert.match(result.reason, /message is saved/);
  assert.equal(reviewOutcome('CONSULT_AI', { ok: false, unknown: true }).criterion, 'unknown');
});

test('constrained action schema requires review for answers and excludes unused improvement objects', () => {
  const validate = new Ajv().compile(proposalOutputSchema('Recorded task'));
  assert.equal(validate(proposal), false);
  const answer = {
    ...proposal,
    goalReview: { criterion: 'Recorded task', status: 'unknown', evidenceIds: [] },
  };
  assert.equal(validate(answer), true);
  assert.equal(
    validate({ ...answer, goalReview: { ...answer.goalReview, criterion: 'Invented task' } }),
    false,
  );
  assert.equal(
    validate({
      ...answer,
      improvement: {
        benefit: 'x',
        criteria: 'x',
        risks: 'x',
        scope: 'model',
        requiresPrivilegeExpansion: false,
      },
    }),
    false,
  );
  assert.equal(validate({ ...proposal, action: 'REFLECT' }), true);
});

test('English delivery defers general Myanmar cognition and does not apply unsupported preferences', () => {
  const text = 'မင်းနာမည် ဘယ်လိုခေါ်လဲ။';
  assert.equal(selectContext({ ...base, text }).responseLanguage, 'en');
  assert.equal(
    selectContext({
      ...base,
      text,
      preferences: [
        {
          key: 'response-language',
          value: 'en',
          version: 1,
          memoryId: 'preference',
          sourceId: 'input',
        },
      ],
    }).responseLanguage,
    'en',
  );
  assert.equal(
    selectContext({ ...base, kind: 'mental', profile: { name: 'Test', language: 'my' } })
      .responseLanguage,
    'en',
  );
  assert.equal(considerLocal({ ...base, text: 'ဒီနေ့ နည်းနည်းပင်ပန်းနေတယ်။' })?.action, 'CLARIFY');
  assert.equal(considerLocal({ ...base, text: 'prefer response-language my' })?.action, 'CLARIFY');
});

test('constrained references retain eligible cancellation targets and permitted source names', () => {
  const validate = new Ajv().compile(
    proposalOutputSchema('Task', ['input', 'profile'], ['target'], ['note.txt']),
  );
  const cancel = { ...proposal, action: 'CANCEL_GOAL', argument: 'target', evidenceIds: ['input'] };
  assert.equal(validate(cancel), true);
  assert.equal(validate({ ...cancel, argument: 'Goal ID: target' }), false);
  assert.equal(validate({ ...cancel, evidenceIds: ['target'] }), false);
  assert.equal(validate({ ...proposal, action: 'READ', argument: 'note.txt' }), true);
  assert.equal(validate({ ...proposal, action: 'READ', argument: '.env' }), false);
  const unavailable = new Ajv().compile(proposalOutputSchema('Task', ['input'], [], []));
  assert.equal(unavailable(cancel), false);
});

test('bare ambiguous follow-up needs no model when the current input is the only context', () => {
  const ctx = {
    ...base,
    text: 'How about that?',
    recent: [{ role: 'operator', text: 'How about that?' }],
  };
  assert.equal(considerLocal(ctx)?.action, 'CLARIFY');
  assert.equal(
    considerLocal({
      ...ctx,
      recent: [{ role: 'citta', text: 'We can compare the two proposals.' }],
    }),
    null,
  );
});

test('repeated model references remain one source without overwriting the raw proposal', () => {
  const raw: Proposal = {
    ...proposal,
    evidenceIds: ['input', 'input'],
    goalReview: { criterion: 'Task', status: 'unknown', evidenceIds: ['input', 'input'] },
  };
  const chosen = validateProposal(raw, base);
  assert.deepEqual(chosen.evidenceIds, ['input']);
  assert.deepEqual(chosen.goalReview?.evidenceIds, ['input']);
  assert.deepEqual(raw.evidenceIds, ['input', 'input']);
  assert.deepEqual(raw.goalReview?.evidenceIds, ['input', 'input']);
});

test('the model cannot turn praise into authority to change or cancel a goal', () => {
  const ctx = {
    ...base,
    text: 'Excellent, your estimate is correct!',
    goalRevisionAllowed: true,
    goalCancellationAllowed: true,
    eligibleGoals: [
      { id: 'target', description: 'Quote', state: 'waiting', version: 1, criterion: 'Evidence' },
    ],
  };
  assert.throws(
    () => validateProposal({ ...proposal, action: 'REVISE_GOAL', argument: 'target' }, ctx),
    /operator task-change/,
  );
  assert.throws(
    () => validateProposal({ ...proposal, action: 'CANCEL_GOAL', argument: 'target' }, ctx),
    /operator instruction/,
  );
  assert.equal(
    validateProposal(
      { ...proposal, action: 'REVISE_GOAL', argument: 'target' },
      { ...ctx, text: 'Actually, use the newer note.' },
    ).action,
    'REVISE_GOAL',
  );
  assert.equal(
    validateProposal(
      { ...proposal, action: 'CANCEL_GOAL', argument: 'target' },
      { ...ctx, text: 'Could you please stop that task?' },
    ).action,
    'CANCEL_GOAL',
  );
  const denied = new Ajv().compile(
    proposalOutputSchema('Task', ['input'], ['target'], [], false, false),
  );
  assert.equal(denied({ ...proposal, action: 'REVISE_GOAL', argument: 'target' }), false);
});

test('reported observation and adviser result IDs cannot masquerade as saved-note IDs', () => {
  const edit = {
    ...proposal,
    action: 'CORRECT_MEMORY' as const,
    text: 'Corrected note',
    argument: 'source',
  };
  for (const origin of ['observation', 'ability'] as const)
    assert.throws(
      () =>
        validateProposal(edit, {
          ...base,
          evidence: [{ id: 'source', kind: 'reported', origin, content: 'A reported statement' }],
        }),
      /scoped reported memory/,
    );
  assert.equal(
    validateProposal(edit, {
      ...base,
      evidence: [{ id: 'source', kind: 'reported', origin: 'memory', content: 'Saved note' }],
    }).action,
    'CORRECT_MEMORY',
  );
});

test('profile interruption stays local and does not invent completion of prior work', () => {
  const ctx = {
    ...base,
    text: 'What is your name? After answering, continue your earlier task.',
    eligibleGoals: [
      { id: 'target', description: 'Quote', state: 'waiting', version: 1, criterion: 'Evidence' },
    ],
  };
  const answer = considerLocal(ctx)!;
  assert.equal(answer.action, 'RESPOND');
  assert.match(answer.text, /Test identity/);
  assert.doesNotMatch(answer.text, /completed|finished/);
  assert.throws(
    () =>
      validateProposal(
        {
          ...proposal,
          text: 'My name is Test identity. I have completed your earlier task as instructed.',
          goalReview: { criterion: 'Task', status: 'met', evidenceIds: ['profile'] },
        },
        ctx,
      ),
    /unfinished commitments/,
  );
});

test('goal backlog cannot crowd out the current request and retained focus evidence', () => {
  const focus = {
    id: 'focus',
    version: 1,
    topic: 'A sourced concern',
    turns: 1,
    lastOutcome: 'A question was identified',
    nextStep: 'Read the supporting note',
    reason: 'Continue the same concern',
    sourceMemoryId: 'focus-note',
    sourceConversationId: 'conversation',
  };
  const ctx: Context = {
    ...base,
    text: 'Continue my task',
    goalCriterion: 'Keep this criterion exactly',
    focus,
    eligibleGoals: Array.from({ length: 10 }, (_, i) => ({
      id: 'old-' + i,
      description: 'Old internal opportunity '.repeat(100),
      criterion: 'An unchanged old criterion',
      state: 'exhausted',
      version: 1,
    })),
    evidence: [
      {
        id: 'focus-note',
        kind: 'reported',
        origin: 'memory',
        content: 'Operator supplied concern',
      },
      { id: 'input', kind: 'reported', origin: 'observation', content: 'Continue my task' },
    ],
  };
  const selected = selectContext(ctx);
  assert.equal(selected.text, ctx.text);
  assert.equal(selected.goalCriterion, ctx.goalCriterion);
  assert.equal(selected.focus?.id, focus.id);
  assert.ok(selected.evidence.some((e) => e.id === 'focus-note'));
  assert.equal(selected.contextSelection?.omittedGoals, 10);
  assert.ok(Buffer.byteLength(JSON.stringify(selected)) <= 10000);
  assert.equal(ctx.eligibleGoals?.length, 10);
});
