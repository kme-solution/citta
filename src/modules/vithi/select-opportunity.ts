export interface OpportunityCandidate {
  id: string;
  kind: 'speech' | 'result' | 'mental';
  createdAt: string;
  dueAt?: string;
  continuation: boolean;
}
export interface OpportunitySnapshot {
  policy: 'opportunity-v1' | 'attention-v2';
  now: string;
  consecutiveUserTurns: number;
  selectedId: string;
  candidates: (OpportunityCandidate & { priority: number; reason: string })[];
  tieBreak: 'priority,arrival,id';
}
/** Engineering queue arbitration. The old wire policy remains readable for historical replay. */
export function selectOpportunity(
  candidates: OpportunityCandidate[],
  consecutiveUserTurns: number,
  now: string,
  policy: OpportunitySnapshot['policy'] = 'opportunity-v1',
): OpportunitySnapshot | null {
  if (!candidates.length) return null;
  const clock = Date.parse(now);
  const ranked = candidates
    .map((candidate) => {
      const due =
        !!candidate.dueAt &&
        Number.isFinite(Date.parse(candidate.dueAt)) &&
        Date.parse(candidate.dueAt) <= clock;
      const obligation =
        candidate.kind === 'result' || candidate.continuation || candidate.kind === 'mental';
      const protectedTurn = consecutiveUserTurns >= 3 && obligation;
      const priority = protectedTurn
        ? 0
        : candidate.kind === 'speech'
          ? 1
          : due
            ? 2
            : obligation
              ? 3
              : 4;
      const reason = protectedTurn
        ? 'Continuation quota after three operator turns'
        : candidate.kind === 'speech'
          ? 'Operator input at the next safe boundary'
          : due
            ? 'Persisted due condition reached'
            : obligation
              ? 'Ready result or continuation'
              : 'Eligible internal candidate';
      return { ...candidate, priority, reason };
    })
    .sort(
      (a, b) =>
        a.priority - b.priority ||
        Date.parse(a.createdAt) - Date.parse(b.createdAt) ||
        (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
    );
  return {
    policy,
    now,
    consecutiveUserTurns,
    selectedId: ranked[0].id,
    candidates: ranked,
    tieBreak: 'priority,arrival,id',
  };
}
