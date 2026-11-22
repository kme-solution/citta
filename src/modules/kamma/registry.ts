import type { Ability } from '../../contracts/runtime.ts';
export const capabilities:Record<Ability,{role:string;repeatPolicy:string;cancelPolicy:string;scope:string}>={
  INFER:{role:'local cognitive proposal',repeatPolicy:'bounded recomputation only before a committed outcome; uncertain usage retained',cancelPolicy:'abort incomplete HTTP generation, retain the goal/context and bounded resumption count',scope:'selected local context; no tools or cloud fallback'},
  READ:{role:'local evidence',repeatPolicy:'read-only; observed content and lineage retained',cancelPolicy:'no new dispatch after stop; a started bounded read may finish',scope:'resolved regular UTF-8 files within the configured evidence root; maximum 32 KB'},
  CONSULT_AI:{role:'external advice',repeatPolicy:'no automatic retry after uncertain execution',cancelPolicy:'abort CLI process where supported; late speech cannot revive cancelled work',scope:'minimized question and configured background, temporary read-only working directory; no application database environment'}
};
