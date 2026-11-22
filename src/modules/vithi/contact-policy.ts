export interface ContactSnapshot {
  quiet: boolean;
  pending: boolean;
  lastContactAt: string | null;
  intervalMs: number;
  now: string;
  expiresAt: string;
  policy?: 'contact-v2';
  candidate?: { id: string; conversationId: string; text: string };
}
export function contactDisposition(snapshot: ContactSnapshot) {
  const now = Date.parse(snapshot.now);
  if (Date.parse(snapshot.expiresAt) <= now) return { action: 'expire', reason: 'contact expired' };
  if (snapshot.quiet) return { action: 'defer', reason: 'quiet requested' };
  if (snapshot.pending) return { action: 'defer', reason: 'unanswered initiative' };
  if (snapshot.lastContactAt && now - Date.parse(snapshot.lastContactAt) < snapshot.intervalMs)
    return { action: 'defer', reason: 'contact interval' };
  return { action: 'deliver', reason: 'local inbox permitted' };
}
export function replayContact(record: {
  snapshot: ContactSnapshot;
  choice: { action: string; reason: string };
  effect: unknown;
}) {
  if (record.snapshot.policy !== 'contact-v2' || !record.snapshot.candidate)
    return {
      state: 'unsupported',
      reason: 'Contact replay lacks the pinned policy or original proposed payload.',
    };
  const choice = contactDisposition(record.snapshot);
  const effect =
    choice.action === 'deliver'
      ? {
          kind: 'local_inbox',
          conversationId: record.snapshot.candidate.conversationId,
          text: record.snapshot.candidate.text,
        }
      : null;
  const keys = (value: unknown): unknown =>
    Array.isArray(value)
      ? value.map(keys)
      : value && typeof value === 'object'
        ? Object.fromEntries(
            Object.entries(value)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([key, item]) => [key, keys(item)]),
          )
        : value;
  const matched =
    choice.action === record.choice.action &&
    choice.reason === record.choice.reason &&
    JSON.stringify(keys(effect)) === JSON.stringify(keys(record.effect));
  return {
    state: matched ? 'matched' : 'diverged',
    expectedChoice: choice,
    expectedEffect: effect,
  };
}
