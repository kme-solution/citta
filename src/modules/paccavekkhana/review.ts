import type { Outcome } from '../../contracts/runtime.ts';
export function reviewOutcome(kind: string, outcome: Outcome) {
  if (outcome.unknown) return {criterion:'unknown',state:'exhausted',reason:'The effect may have occurred; redispatch is blocked pending reconciliation.'};
  if (!outcome.ok) return {criterion:'not_met',state:'exhausted',reason:outcome.error || 'The ability failed.'};
  if (kind === 'CONSULT_AI') return {criterion:'unknown',state:'completed',reason:'Advice received as reported speech; its accuracy remains unverified.'};
  return {criterion:'met',state:'completed',reason:'The bounded local operation returned an observed result.'};
}
