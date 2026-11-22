import type { Context,Evidence } from '../../contracts/runtime.ts';
export const CONTEXT_SELECTION_POLICY='context-v2-bounded-goals';
const LIMIT=10000;
const excerptMarker='\n[Excerpt only; remaining source content was not included.]';
function excerpt(text:string,maxBytes:number) {
  if(Buffer.byteLength(text,'utf8')<=maxBytes)return text;
  let result='',bytes=0;
  const available=Math.max(0,maxBytes-Buffer.byteLength(excerptMarker,'utf8'));
  for(const character of text){const size=Buffer.byteLength(character,'utf8');if(bytes+size>available)break;result+=character;bytes+=size;}
  return result+excerptMarker;
}
/** Select bounded, attributable context. Durable records and the actual request are unchanged. */
export function selectContext(context:Context):Context {
  const selected=structuredClone(context);
  selected.responseLanguage='en';
  selected.preferences=selected.preferences?.filter(p=>p.key!=='response-language'||p.value==='en');
  delete selected.proposal;delete selected.reviewedOutcome;
  delete selected.attention;delete selected.inferenceAttention;delete selected.motiveSnapshot;
  delete selected.invalidatedEvidenceIds;delete selected.inferenceRequestId;
  delete selected.commitState;delete selected.contextSelection;
  const selection={policy:CONTEXT_SELECTION_POLICY,originalBytes:Buffer.byteLength(JSON.stringify(selected),'utf8'),selectedBytes:0,omittedGoals:0,omittedEvidence:0,omittedRecent:0,omittedAppraisals:0,excerptedFields:[] as string[]};
  selected.contextSelection=selection;
  const clip=(text:string,max:number,field:string)=>{const value=excerpt(text,max);if(value!==text&&!selection.excerptedFields.includes(field))selection.excerptedFields.push(field);return value;};
  const goals=selected.eligibleGoals||[];
  selected.eligibleGoals=goals.filter(g=>!['completed','cancelled','exhausted'].includes(g.state)).slice(0,6).map(g=>({...g,description:clip(g.description,400,'eligibleGoals.description')}));
  selection.omittedGoals=goals.length-selected.eligibleGoals.length;
  selected.evidence=selected.evidence.map(e=>({...e,content:clip(e.content,3000,'evidence.content')}));
  const priority=(e:Evidence)=>e.id===selected.observationId?0:e.id===selected.focus?.sourceMemoryId||e.id===selected.focus?.sourceObservationId?1:e.origin==='ability'&&e.kind==='observed'?2:e.kind==='configured'?3:e.kind==='reported'?4:e.kind==='observed'?5:6;
  selected.evidence.sort((a,b)=>priority(a)-priority(b));
  selected.recent=selected.recent.slice(-4).map(m=>({...m,text:clip(m.text,700,'recent.text')}));
  selection.omittedRecent=context.recent.length-selected.recent.length;
  const appraisals=selected.appraisals||[];
  selected.appraisals=appraisals.slice(0,2).map(a=>({...a,cause:clip(a.cause,300,'appraisals.cause'),uncertainty:clip(a.uncertainty,200,'appraisals.uncertainty')}));
  selection.omittedAppraisals=appraisals.length-selected.appraisals.length;
  // Update the recorded size as well: its digits contribute to the same serialized budget.
  const bytes=()=>{for(let i=0;i<3;i++){const size=Buffer.byteLength(JSON.stringify(selected),'utf8');if(selection.selectedBytes===size)return size;selection.selectedBytes=size;}return Buffer.byteLength(JSON.stringify(selected),'utf8');};
  while(bytes()>LIMIT&&selected.appraisals.length){selected.appraisals.pop();selection.omittedAppraisals++;}
  while(bytes()>LIMIT&&selected.recent.length>1){selected.recent.shift();selection.omittedRecent++;}
  while(bytes()>LIMIT&&selected.eligibleGoals.length){selected.eligibleGoals.pop();selection.omittedGoals++;}
  while(bytes()>LIMIT&&selected.evidence.length>1){
    const index=selected.evidence.findLastIndex(e=>priority(e)>1);
    if(index<0)break;
    selected.evidence.splice(index,1);selection.omittedEvidence++;
  }
  while(bytes()>LIMIT&&selected.recent.length){selected.recent.pop();selection.omittedRecent++;}
  if(bytes()>LIMIT)selected.evidence=selected.evidence.map(e=>({...e,content:clip(e.content,500,'evidence.content')}));
  if(bytes()>LIMIT)throw Error(`Citta could not fit the required request, focus and policy context within its inference context budget (${selection.selectedBytes} bytes; limit ${LIMIT}). Optional background was already reduced. This is an application-side context limit; no provider request was sent.`);
  return selected;
}
