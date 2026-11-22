import type { Outcome } from '../../contracts/runtime.ts';
export function reviewOutcome(kind: string, outcome: Outcome) {
  if (outcome.unknown)
    return {
      criterion: 'unknown',
      state: 'exhausted',
      reason: 'The effect may have occurred; redispatch is blocked pending reconciliation.',
    };
  if (
    !outcome.ok &&
    kind === 'INFER' &&
    /fetch failed|ECONNREFUSED|socket|connect|timeout|timed out|aborted due to timeout/i.test(
      outcome.error || '',
    )
  )
    return {
      criterion: 'not_met',
      state: 'exhausted',
      reason:
        'I could not finish local reasoning because the local model connection failed or timed out. Your message is saved. Check the local model service before retrying.',
    };
  if (!outcome.ok)
    return {
      criterion: 'not_met',
      state: 'exhausted',
      reason: outcome.error || 'The ability failed.',
    };
  if (kind === 'COMPUTER')
    return {
      criterion: 'unknown',
      state: 'waiting',
      reason:
        'Desktop input/screenshot returned. Inspect the resulting screen before judging the task criterion.',
    };
  if (kind === 'CONSULT_AI')
    return {
      criterion: 'unknown',
      state: 'completed',
      reason: 'Advice received as reported speech; its accuracy remains unverified.',
    };
  return {
    criterion: 'met',
    state: 'completed',
    reason: 'The bounded local operation returned an observed result.',
  };
}
