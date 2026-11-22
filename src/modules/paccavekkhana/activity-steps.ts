interface RecordedDecision {
 id:string;created_at:string;sequence?:string;
 snapshot:{motiveSnapshot?:{name?:string};attention?:unknown;evidence?:unknown[];recent?:unknown[]};
 decision:{action:string;text?:string;tone?:string};
}
interface RecordedAction {
 id:string;kind:string;state:string;created_at:string;started_at?:string;finished_at?:string;reviewed:boolean;
 result?:{ok?:boolean;error?:string;unknown?:boolean;usage?:{provider?:string}};
}
export interface ActivityStep {id:string;module:string;operation:string;outcome:string;createdAt:string}
/** Summaries of retained records, not independently measured module spans. */
export function activitySteps(decisions:RecordedDecision[],actions:RecordedAction[]):ActivityStep[] {
 const steps:ActivityStep[]=[];
 for(const d of [...decisions].reverse()){
  const add=(module:string,operation:string,outcome:string)=>steps.push({id:d.id+':'+module,module,operation,outcome,createdAt:d.created_at});
  if(d.snapshot.motiveSnapshot)add('chanda','Select an interest',d.snapshot.motiveSnapshot.name||'An internally motivated topic was selected.');
  if(d.snapshot.attention)add('manasikara','Select attention','This input was selected for consideration.');
  add('sati','Gather context',`${d.snapshot.evidence?.length||0} evidence records and ${d.snapshot.recent?.length||0} recent messages retained in the decision context.`);
  add('cetana','Record an intention',d.decision.action.replaceAll('_',' ').toLowerCase()+(d.decision.text?' · '+d.decision.text:''));
  if(d.decision.tone)add('vedana','Record modeled appraisal',d.decision.tone);
 }
 for(const a of actions){
  const add=(suffix:string,module:string,operation:string,outcome:string,createdAt:string)=>steps.push({id:a.id+':'+suffix,module,operation,outcome,createdAt});
  const ability=a.kind==='INFER'?'Consideration':a.kind==='READ'?'Source read':a.kind==='CONSULT_AI'?'External advice':a.kind;
  add('queued','kamma','Queue an operation',ability+' queued.',a.created_at);
  if(a.started_at)add('started','kamma','Start an operation',ability+' started.',a.started_at);
  if(a.finished_at)add('result','kamma','Record operation outcome',a.state==='succeeded'?ability+' returned successfully'+(a.result?.usage?.provider?' via '+a.result.usage.provider:'')+'.':a.state+': '+(a.result?.error||'No further outcome recorded.'),a.finished_at);
  if(a.reviewed)add('review','paccavekkhana','Review an outcome','The runtime recorded this result as reviewed; the decision and commitment state show what followed.',a.finished_at||a.created_at);
 }
 return steps.sort((a,b)=>Date.parse(a.createdAt)-Date.parse(b.createdAt));
}
