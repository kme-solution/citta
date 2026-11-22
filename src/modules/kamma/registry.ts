import type { Ability } from '../../contracts/runtime.ts';
export const capabilities: Record<
  Ability,
  { role: string; repeatPolicy: string; cancelPolicy: string; scope: string }
> = {
  INFER: {
    role: 'configured-provider cognitive proposal',
    repeatPolicy: 'bounded recomputation only before a committed outcome; uncertain usage retained',
    cancelPolicy:
      'abort incomplete provider generation, retain the goal/context and bounded resumption count',
    scope:
      'bounded selected context; explicitly selected local or external provider, no automatic fallback',
  },
  COMPUTER: {
    role: 'physical desktop screenshot and input',
    repeatPolicy: 'stable operation receipts; no blind replay after uncertain effects',
    cancelPolicy: 'stop further dispatch; delivered physical input cannot be undone',
    scope:
      'OS-approved current laptop desktop; screenshot, click, type, key chord or scroll; screenshot feedback after each action',
  },
  READ: {
    role: 'local evidence',
    repeatPolicy: 'read-only; observed content and lineage retained',
    cancelPolicy: 'no new dispatch after stop; a started bounded read may finish',
    scope: 'resolved regular UTF-8 files within the configured evidence root; maximum 32 KB',
  },
  CONSULT_AI: {
    role: 'external advice',
    repeatPolicy: 'no automatic retry after uncertain execution',
    cancelPolicy: 'abort CLI process where supported; late speech cannot revive cancelled work',
    scope:
      'minimized question and configured background, temporary read-only working directory; no application database environment',
  },
};
