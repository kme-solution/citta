import type { Decision } from '../../contracts/runtime.ts';
/** A contextual application appraisal; it neither establishes facts nor grants execution authority. */
export function appraise(decision: Decision, enabled = true) {
  if (!enabled)
    return {
      tone: 'undetermined',
      cause: decision.reason,
      uncertainty: decision.uncertainty || '',
      candidate: 'undetermined',
      tendency: 'hold',
      regulation:
        'Modeled affect disabled; task evidence and independent policy remain authoritative.',
    };
  return {
    tone: decision.tone,
    cause: decision.reason,
    uncertainty: decision.uncertainty || '',
    candidate: decision.candidateTendency || 'undetermined',
    tendency:
      decision.chosenTendency ||
      (decision.action === 'CLARIFY'
        ? 'seek clarification'
        : decision.action === 'REFLECT'
          ? 'reflect without contact'
          : 'act within scope'),
    regulation: decision.regulationReason || 'No additional reactive tendency was established.',
  };
}
