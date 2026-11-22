import type { Context, Evidence } from '../../contracts/runtime.ts';

export interface AttentionObject {
  id: string;
  kind:
    'message' | 'feedback' | 'remembered-concern' | 'question' | 'interest' | 'scheduled-concern';
  summary: string;
  sourceKind: Evidence['kind'];
  sourceIds: string[];
  feedbackState?: 'returned' | 'failed' | 'unconfirmed-effect';
}
export interface ObjectAttention {
  policy: 'object-attention-v1';
  object: AttentionObject;
  taskId: string;
  triggerId: string;
  orientation: 'receive' | 'examine' | 'remember' | 'continue' | 'explore' | 'revisit';
  reason: string;
  focusId?: string;
  focusVersion?: number;
}
function synopsis(text: string) {
  return text.length > 320 ? text.slice(0, 320) + '… [excerpt]' : text;
}
/** Object orientation, not work priority and not a certificate of wise attention. */
export function attendToObject(ctx: Context): ObjectAttention {
  const base = {
    policy: 'object-attention-v1' as const,
    taskId: ctx.goalId,
    triggerId: ctx.selectedObservationId || ctx.observationId,
    ...(ctx.focus ? { focusId: ctx.focus.id, focusVersion: ctx.focus.version } : {}),
  };
  if (ctx.reviewedOutcome) {
    const { kind, outcome, observationId } = ctx.reviewedOutcome;
    return {
      ...base,
      object: {
        id: 'source:' + observationId,
        kind: 'feedback',
        summary: synopsis(outcome.text || outcome.error || 'The operation returned no content.'),
        sourceKind: kind === 'CONSULT_AI' ? 'reported' : 'observed',
        sourceIds: [observationId],
        feedbackState: outcome.unknown ? 'unconfirmed-effect' : outcome.ok ? 'returned' : 'failed',
      },
      orientation: 'examine',
      reason: outcome.unknown
        ? 'The current object is an unconfirmed operation result, not proof that the effect succeeded.'
        : 'Actual operation feedback is examined under the retained task; inference success alone is not task completion.',
    };
  }
  if (ctx.attendedSourceId && !ctx.invalidatedEvidenceIds?.includes(ctx.attendedSourceId)) {
    const source = ctx.evidence.find(
      (e) => e.id === ctx.attendedSourceId && e.origin === 'ability',
    );
    if (!source) throw Error('The attended operation source is missing from the current context.');
    return {
      ...base,
      object: {
        id: 'source:' + source.id,
        kind: 'feedback',
        summary: synopsis(source.content),
        sourceKind: source.kind,
        sourceIds: [source.id],
        feedbackState: 'returned',
      },
      orientation: 'examine',
      reason:
        'Continue examining the retained operation source without promoting reported speech to an observed fact.',
    };
  }
  if (
    ctx.focus &&
    ctx.kind === 'mental' &&
    !ctx.focusInvalidation &&
    !ctx.invalidatedEvidenceIds?.some(
      (id) => id === ctx.focus?.sourceMemoryId || id === ctx.focus?.sourceObservationId,
    )
  ) {
    const focus = ctx.focus;
    const sourceId = focus.sourceMemoryId || focus.sourceObservationId;
    const source = sourceId ? ctx.evidence.find((e) => e.id === sourceId) : undefined;
    if (sourceId && !source)
      throw Error('The retained concern has no current attributable source.');
    const remembered = !!focus.sourceMemoryId;
    const starting = !sourceId && focus.turns === 0;
    return {
      ...base,
      object: {
        id: 'focus:' + focus.id,
        kind: remembered ? 'remembered-concern' : starting ? 'interest' : 'question',
        summary: synopsis(focus.topic),
        sourceKind: source?.kind || 'inferred',
        sourceIds: sourceId ? [sourceId] : ctx.motiveSnapshot?.id ? [ctx.motiveSnapshot.id] : [],
      },
      orientation: remembered ? 'remember' : starting ? 'explore' : 'continue',
      reason: starting
        ? 'An enabled interest supplies a starting object; no concrete considered outcome is claimed yet.'
        : 'The retained concern supplies this object across turns and communication contexts; its source status is unchanged.',
    };
  }
  const input = ctx.evidence.find((e) => e.id === ctx.observationId && e.origin === 'observation');
  const scheduled = !!ctx.recallReason;
  return {
    ...base,
    object: {
      id: 'source:' + ctx.observationId,
      kind: scheduled ? 'scheduled-concern' : ctx.kind === 'speech' ? 'message' : 'question',
      summary: synopsis(input?.content || ctx.text),
      sourceKind: input?.kind || (ctx.kind === 'speech' ? 'reported' : 'inferred'),
      sourceIds: [ctx.observationId],
    },
    orientation: scheduled ? 'revisit' : ctx.kind === 'speech' ? 'receive' : 'continue',
    reason: scheduled
      ? 'A recorded due concern is revisited; its condition does not establish an action result.'
      : 'This consideration is oriented to the retained input; its task and source remain distinct from queue arbitration.',
  };
}
