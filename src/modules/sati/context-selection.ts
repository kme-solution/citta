import type { Context } from '../../contracts/runtime.ts';
function excerpt(text:string,maxBytes:number) {
  if(Buffer.byteLength(text,'utf8')<=maxBytes)return text;
  let result='',bytes=0;
  for(const character of text){const size=Buffer.byteLength(character,'utf8');if(bytes+size>maxBytes)break;result+=character;bytes+=size;}
  return result+'\n[Excerpt only; remaining source content was not included.]';
}
/** Select explicit excerpts before inference; the actual selected context is persisted with its outcome. */
export function selectContext(context:Context):Context {
  const selected=structuredClone(context);
  delete selected.proposal;delete selected.reviewedOutcome;
  delete selected.attention;delete selected.inferenceAttention;delete selected.motiveSnapshot;
  delete selected.invalidatedEvidenceIds;delete selected.inferenceRequestId;
  delete selected.commitState;
  selected.evidence=selected.evidence.map(e=>({...e,content:excerpt(e.content,3000)}));
  selected.recent=selected.recent.slice(-4).map(m=>({...m,text:excerpt(m.text,700)}));
  const bytes=()=>Buffer.byteLength(JSON.stringify(selected),'utf8');
  while(bytes()>10000 && selected.recent.length>1)selected.recent.shift();
  while(bytes()>10000 && selected.evidence.length>1)selected.evidence.shift();
  if(bytes()>10000)throw Error('Selected context exceeds the local inference budget. Shorten the request or use a narrower source; no cloud fallback was used.');
  return selected;
}
