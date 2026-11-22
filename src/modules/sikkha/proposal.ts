import { parseComputerCommand } from '../../infra/computer/desktop.ts';
import type { Context, Decision, Proposal } from '../../contracts/runtime.ts';
import { validPreference } from '../sati/preferences.ts';
import { hasRevisionInstruction, hasCancellationInstruction } from '../vaca/interpret.ts';

export function validateProposal(proposal: Proposal, ctx: Context): Decision {
  if (proposal.attentionObjectId !== ctx.objectAttention?.object.id)
    throw Error('The proposal does not belong to the currently attended object.');
  if (
    ctx.responseLanguage === 'my' &&
    ['RESPOND', 'CLARIFY', 'INITIATE', 'REFLECT', 'PROPOSE_IMPROVEMENT'].includes(
      proposal.action,
    ) &&
    !/[\u1000-\u109f]/u.test(proposal.text)
  )
    throw Error('The local proposal did not use the selected Myanmar response language.');
  if (
    proposal.action === 'RESPOND' &&
    (ctx.eligibleGoals?.some((g) => !['completed', 'cancelled'].includes(g.state)) ||
      (ctx.contextSelection?.omittedGoals || 0) > 0) &&
    /(?:^|[.!?]\s+)(?:I|we)(?:['’]ve| have)?\s+(?:already\s+)?(?:completed|finished|resolved)\s+(?:(?:your|the|our|my)\s+)?(?:earlier|previous|prior|pending)\s+(?:task|work|investigation|request)\b/i.test(
      proposal.text,
    )
  )
    throw Error('A generated reply cannot claim known unfinished commitments are complete.');
  if (
    ctx.kind === 'mental' &&
    ctx.focus &&
    (!proposal.focusReview?.reason.trim() || !proposal.focusReview.nextStep.trim())
  )
    throw Error('A continuing focus needs a progress review and next step.');
  if (proposal.focusReview && (!ctx.focus || ctx.kind !== 'mental'))
    throw Error('A focus review requires a selected internal focus.');
  if (
    proposal.focusReview &&
    ['READ', 'COMPUTER'].includes(proposal.action) &&
    proposal.focusReview.status !== 'continue'
  )
    throw Error('Review actual ability feedback before settling or replacing this focus.');
  const ids = new Set(ctx.evidence.map((e) => e.id));
  ids.add('profile');
  ids.add(ctx.observationId);
  if (proposal.evidenceIds.some((id) => !ids.has(id)))
    throw Error('Local proposal refers to evidence outside its context.');
  if (
    ctx.goalCriterion &&
    proposal.goalReview &&
    proposal.goalReview.criterion !== ctx.goalCriterion
  )
    throw Error('Goal review cannot replace the recorded completion criterion.');
  if (proposal.action === 'RESPOND' && !proposal.goalReview?.criterion.trim())
    throw Error('A generated response needs an explicit review of the actual goal criterion.');
  if (proposal.goalReview?.evidenceIds.some((id) => !ids.has(id)))
    throw Error('Goal review refers to evidence outside its context.');
  if (
    proposal.action === 'SET_PREFERENCE' &&
    (ctx.kind !== 'speech' ||
      !proposal.evidenceIds.includes(ctx.observationId) ||
      !validPreference(proposal.argument, proposal.text))
  )
    throw Error(
      'A scoped preference needs explicit operator provenance and a supported key/value.',
    );
  if (
    proposal.action === 'CONSULT_AI' &&
    (!proposal.argument.trim() || !proposal.uncertainty.trim())
  )
    throw Error('Advice requires a specific question and an explicit local knowledge gap.');
  if (ctx.kind === 'mental' && proposal.action === 'CLARIFY' && (ctx.openQuestions || 0) > 0)
    throw Error(
      'An operator question is already outstanding; continue independent reflection instead.',
    );
  if (proposal.action === 'COMPUTER') {
    if (!ctx.computerAvailable)
      throw Error('Computer session is not available for this consideration.');
    const command = parseComputerCommand(proposal.argument);
    if (command.action !== 'observe' && !ctx.computerScreen)
      throw Error('Observe the desktop before choosing an input action.');
    if (
      command.action === 'click' &&
      ctx.computerScreen &&
      (command.x >= ctx.computerScreen.width || command.y >= ctx.computerScreen.height)
    )
      throw Error('Click is outside the observed screen.');
  }
  if (proposal.action === 'READ' && !proposal.argument.trim())
    throw Error('Read requires a relative source path.');
  if (
    proposal.action === 'CORRECT_MEMORY' &&
    !ctx.evidence.some(
      (e) => e.id === proposal.argument && e.kind === 'reported' && e.origin === 'memory',
    )
  )
    throw Error('Correction requires the exact scoped reported memory ID.');
  if (
    ['CORRECT_MEMORY', 'REMEMBER'].includes(proposal.action) &&
    (!proposal.text.trim() || ctx.kind !== 'speech')
  )
    throw Error('Saving or correcting a reported memory requires operator input.');
  if (
    proposal.action === 'CANCEL_GOAL' &&
    !ctx.eligibleGoals?.some((g) => g.id === proposal.argument)
  )
    throw Error('Cancellation needs an unambiguous eligible goal ID.');
  if (
    proposal.action === 'CANCEL_GOAL' &&
    (ctx.kind !== 'speech' || !hasCancellationInstruction(ctx.text))
  )
    throw Error('Goal cancellation requires an explicit operator instruction.');
  if (proposal.action === 'REVISE_GOAL' && !hasRevisionInstruction(ctx.text))
    throw Error('Goal revision requires an explicit operator task-change instruction.');
  if (
    proposal.action === 'REVISE_GOAL' &&
    (!ctx.eligibleGoals?.some((g) => g.id === proposal.argument) ||
      !proposal.text.trim() ||
      ctx.kind !== 'speech')
  )
    throw Error(
      'Goal revision requires an exact scoped goal and an operator-sourced revised task.',
    );
  if (proposal.action === 'WAIT') {
    const due = Date.parse(proposal.argument),
      now = Date.parse(ctx.recordedAt || '');
    if (!Number.isFinite(due) || !Number.isFinite(now) || due <= now || due - now > 30 * 86400000)
      throw Error('A due recall must specify a future ISO timestamp within 30 days.');
  }
  if (
    ['RESPOND', 'CLARIFY', 'INITIATE', 'REFLECT', 'PROPOSE_IMPROVEMENT'].includes(
      proposal.action,
    ) &&
    !proposal.text.trim()
  )
    throw Error('Proposal contains no usable response.');
  if (ctx.kind !== 'mental' && proposal.action === 'INITIATE')
    throw Error('Proactive contact is limited to an internal turn.');
  if (proposal.action === 'PROPOSE_IMPROVEMENT' && !proposal.evidenceIds.length)
    throw Error('An improvement proposal requires an attributable opportunity or limitation.');
  if (
    proposal.action === 'PROPOSE_IMPROVEMENT' &&
    (!proposal.improvement?.benefit.trim() ||
      !proposal.improvement.criteria.trim() ||
      !proposal.improvement.risks.trim())
  )
    throw Error('An improvement proposal requires specific benefit, criteria, risks and scope.');
  if (
    proposal.action === 'ADOPT_INTEREST' &&
    (!proposal.evidenceIds.length ||
      !proposal.argument.trim() ||
      proposal.argument.length > 100 ||
      !proposal.text.trim())
  )
    throw Error('A candidate interest needs a bounded name, description and attributable origin.');
  const chosen: Decision = { ...proposal };
  if (ctx.modeledAffectEnabled === false) {
    chosen.tone = 'undetermined';
    chosen.candidateTendency = 'undetermined';
    chosen.chosenTendency = 'hold';
    chosen.regulationReason =
      'Modeled affect is disabled; retain task/evidence and independent policy checks.';
  }
  if (
    proposal.goalReview?.status === 'met' &&
    !/^(?:ask|consult codex|codex ကိုမေးပါ)\s/iu.test(ctx.text)
  ) {
    const cited = ctx.evidence.filter((e) => proposal.goalReview!.evidenceIds.includes(e.id));
    const advice = cited.some(
      (e) =>
        e.kind === 'reported' &&
        (e.origin === 'ability' ||
          /^(?:Codex advice \(unverified\)|Unverified Codex advice)/.test(e.content)),
    );
    if (advice && !cited.some((e) => e.kind === 'observed' || e.kind === 'configured')) {
      chosen.goalReview = { ...proposal.goalReview, status: 'unknown' };
      chosen.uncertainty =
        'The cited adviser speech has no independently observed support for this criterion.';
    }
  }
  chosen.evidenceIds = [...new Set(chosen.evidenceIds)];
  if (chosen.goalReview)
    chosen.goalReview = {
      ...chosen.goalReview,
      evidenceIds: [...new Set(chosen.goalReview.evidenceIds)],
    };
  return chosen;
}
