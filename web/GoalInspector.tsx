import {useEffect,useState} from 'react';
interface GoalDetail {
 goal:{description:string;criterion:string;state:string;summary?:string;wait_reason?:string;due_at?:string;version:number;cycles:number;budget_cycles:number;work_ms:string;budget_ms:string;adviser_calls:number;budget_adviser:number};
 frame:{state:string;checkpoint:unknown;parent_goal_id:string|null;continuation_depth:number}|null;
 transitions?:{ordinal:string;previous_state:string|null;state:string;reason:string;created_at:string}[];
 steps?:{id:string;module:string;operation:string;outcome:string;createdAt:string}[];
}
export function GoalInspector({goalId,onClose}:{goalId:string;onClose:()=>void}) {
 const [detail,setDetail]=useState<GoalDetail|null>(null);
 const [error,setError]=useState('');
 const [reply,setReply]=useState('');
 const [replyRequest,setReplyRequest]=useState<{requestId:string;expectedVersion:number;text:string}|null>(null);
 const [replyBusy,setReplyBusy]=useState(false);
 const [replyError,setReplyError]=useState('');
 const [replyNotice,setReplyNotice]=useState('');
 useEffect(()=>{
  const abort=new AbortController();let active=true;
  async function load(){try{const response=await fetch('/api/goals/'+goalId,{cache:'no-store',signal:abort.signal});const data=await response.json();if(!response.ok)throw Error(data.error||'Could not load activity.');if(active){setDetail(data);setError('');}}catch(e){if(active&&!abort.signal.aborted)setError(e instanceof Error?e.message:'Activity unavailable.');}}
  setDetail(null);setError('');void load();const timer=setInterval(()=>void load(),5000);
  return()=>{active=false;abort.abort();clearInterval(timer);};
 },[goalId]);
 async function sendReply(){
  if(!detail||replyBusy||(!reply.trim()&&!replyRequest))return;
  const request=replyRequest||{requestId:crypto.randomUUID(),expectedVersion:detail.goal.version,text:reply.trim()};
  setReplyRequest(request);setReplyBusy(true);setReplyError('');setReplyNotice('');
  try{
   const response=await fetch('/api/goals/'+goalId+'/reply',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(request)});
   const result=await response.json();
   if(!response.ok){if([400,404,409].includes(response.status))setReplyRequest(null);throw Error(result.error||'Reply was not confirmed. Retry the same reply.');}
   setReply('');setReplyRequest(null);setReplyNotice('Reply saved for this activity. Processing continues when the runner is available.');
   const state=await fetch('/api/goals/'+goalId,{cache:'no-store'});if(state.ok)setDetail(await state.json());
  }catch(e){setReplyError(e instanceof Error?e.message:'Reply not confirmed. Retry the same reply.');}
  finally{setReplyBusy(false);}
 }
 return <section className="card" aria-label="Commitment continuity inspector">
  <div className="card-top"><h2>Processing steps</h2><button onClick={onClose}>Back to activity</button></div>
  {error&&<p role="alert">{error}</p>}{!error&&!detail&&<p role="status">Loading recorded steps…</p>}
  {detail&&<><h3>{detail.goal.description.startsWith('Internal opportunity ')?'Internally initiated consideration':detail.goal.description.length>160?detail.goal.description.slice(0,160)+'…':detail.goal.description}</h3><span className={'tag '+detail.goal.state}>{detail.goal.state}</span>
   {detail.goal.state==='exhausted'&&<section className="activity-wait" role="status"><strong>Stopped before completion</strong><p>{detail.goal.summary||'The recorded steps below contain the reason work stopped.'}</p><p className="muted">This state does not necessarily mean the time allowance was used up. The recorded reason above identifies the blocker.</p></section>}
   {detail.goal.state==='waiting'&&<section className="activity-wait"><strong>{detail.goal.wait_reason==='contact_delivery'?'Question queued for conversation delivery':detail.goal.wait_reason==='operator_input'?'Waiting for your reply':detail.goal.wait_reason==='evidence_or_operator_input'?'Waiting for evidence or your reply':'Waiting for a recorded condition'}</strong><p>{detail.goal.summary||'Open the recorded steps for the waiting reason.'}</p>{detail.goal.due_at&&<p>Due: {new Date(detail.goal.due_at).toLocaleString()}</p>}{['operator_input','evidence_or_operator_input'].includes(detail.goal.wait_reason||'')&&<form onSubmit={e=>{e.preventDefault();void sendReply();}}><label htmlFor="activity-reply">Reply to this activity</label><textarea id="activity-reply" value={replyRequest?.text??reply} maxLength={6000} disabled={replyBusy||!!replyRequest} onChange={e=>setReply(e.target.value)} placeholder="Provide the clarification or evidence needed…"/><button disabled={replyBusy||(!reply.trim()&&!replyRequest)}>{replyBusy?'Saving reply…':replyRequest?'Retry same reply':'Reply & continue'}</button></form>}</section>}
   {replyRequest&&detail.goal.state!=='waiting'&&<button disabled={replyBusy} onClick={()=>void sendReply()}>Check reply receipt</button>}
   {replyNotice&&<p role="status">{replyNotice}</p>}{replyError&&<p role="alert">{replyError}</p>}
   <p className="muted">All recorded steps, oldest to newest. Module involvement is reconstructed from saved records; timestamps belong to those records.</p>
   {!detail.steps?.length?<p>No processing steps recorded yet.</p>:<ol className="processing-steps">{detail.steps.map(step=><li key={step.id}><div className="processing-step-heading"><strong>{step.module}</strong><span>{step.operation}</span><time>{new Date(step.createdAt).toLocaleTimeString()}</time></div><p>{step.outcome}</p></li>)}</ol>}
   {!!detail.transitions?.length&&<details><summary>All state changes ({detail.transitions.length})</summary><ol className="processing-steps">{detail.transitions.slice().reverse().map(t=><li key={t.ordinal}><div className="processing-step-heading"><strong>{t.previous_state||'New'} → {t.state}</strong><time>{new Date(t.created_at).toLocaleString()}</time></div><p>{t.reason}</p></li>)}</ol></details>}
   <details><summary>Commitment & budget</summary><p>{detail.goal.description}</p><p>Success criterion: {detail.goal.criterion}</p><p>State: {detail.goal.state} · version {detail.goal.version} · continuation {detail.frame?.state||'unavailable'}</p><p>{detail.goal.cycles}/{detail.goal.budget_cycles} cycles · {Math.round(Number(detail.goal.work_ms)/1000)}/{Math.round(Number(detail.goal.budget_ms)/1000)} active seconds · {detail.goal.adviser_calls}/{detail.goal.budget_adviser} adviser requests</p></details>
  </>}
 </section>;
}
