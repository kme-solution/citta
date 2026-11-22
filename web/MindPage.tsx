import type {RuntimeState} from './types.ts';
import {ProposalCards} from './ProposalCards.tsx';
export function MindPage({state,onActivity,onReviewed}:{state:RuntimeState|null;onActivity:(id:string)=>void;onReviewed:()=>Promise<void>}) {
  if(!state)return <section className="workspace"><p role="status">Loading recorded mind state…</p></section>;
  const pending=state.actions.filter(a=>['queued','running','unknown'].includes(a.state));
  const thoughts=state.thoughts?.slice(0,10)||[];
  const topics=state.motives.filter(m=>m.last_topic);
  const names:Record<string,string>={INFER:'Considering',CONSULT_AI:'External consultation',READ:'Reading a source'};
  return <section className="workspace mind-workspace">
    <div className="note">Recorded application state, refreshed with runtime updates. Pending operations do not reveal a live inner monologue. Appraisals model feeling; they do not establish human experience.</div>
    <h2>{state.profile.name}’s current activity</h2>
    <div className="mind-status"><span className={'tag '+state.agent.control}>{state.agent.control}</span><span>{state.agent.quiet?'Proactive contact is quiet.':'Proactive contact is allowed, subject to timing and budget.'}</span><small>Runner heartbeat: {state.agent.heartbeat_at?new Date(state.agent.heartbeat_at).toLocaleString():'Not recorded'}</small></div>
    {!pending.length?<p className="empty">Between recorded operations. Recent thoughts remain below; another internal opportunity is scheduled subject to motives and budget.</p>:<ul className="mind-operations">{pending.map(a=>{const goal=state.goals.find(g=>g.id===a.goal_id);return <li key={a.id}><div><span className={'tag '+a.state}>{a.state}</span><strong>{names[a.kind]||a.kind.replaceAll('_',' ')}</strong></div><p>{goal?.description||'Commitment details are not in the current snapshot.'}</p>{a.state==='unknown'&&<p>Outcome is uncertain; this is not confirmed ongoing work.</p>}<button onClick={()=>onActivity(a.goal_id)}>Open activity →</button></li>;})}</ul>}
    <p className="muted">Next internal opportunity: {state.agent.next_internal_at?new Date(state.agent.next_internal_at).toLocaleString():'Not scheduled'}. {state.agent.work_used} work units used this hour. Timing also depends on controls, available motives and pending work.</p>
    <h2>Recent autonomous thoughts</h2><p className="muted">Latest 10 committed internal summaries across conversations, newest first. These stay visible after an operation finishes.</p>
    {!thoughts.length?<p className="muted">No internal decision summary recorded yet.</p>:<div className="mind-topics">{thoughts.map(t=><article key={t.id}><div className="card-top"><span className="tag">{t.action==='REVIEW'?'Operation result':t.action.replaceAll('_',' ').toLowerCase()}</span><time>{new Date(t.created_at).toLocaleString()}</time></div><p>{t.text||'A decision was recorded without a text summary.'}</p><button onClick={()=>onActivity(t.goal_id)}>View activity →</button></article>)}</div>}
    <h2>Last recorded considerations</h2><p className="muted">Topics retained for the selected conversation. These are previous considerations, not a claim about what is happening this instant.</p>
    {!topics.length?<p className="muted">No internal topic has been recorded for this conversation.</p>:<div className="mind-topics">{topics.slice(0,10).map(m=><article key={m.id}><span className="eyebrow">{m.name}</span><p>{m.last_topic}</p></article>)}</div>}
    <h2>Recent modeled feelings</h2><p className="muted">Agent-wide appraisals, newest first. Cause, tendency and uncertainty come from recorded state.</p>
    {!state.appraisals.length&&<p className="muted">No appraisal recorded yet.</p>}{state.appraisals.slice(0,10).map((a,i)=><article className="appraisal" key={a.created_at+i}><span className="tag">{a.tone}</span><p>{a.cause}</p><small>{a.tendency}{a.uncertainty?' · Uncertainty: '+a.uncertainty:''}</small><time className="muted">{new Date(a.created_at).toLocaleString()}</time></article>)}
    <h2>Interests & ambitions</h2><div className="mind-topics">{state.motives.map(m=><article key={m.id}><div className="card-top"><h3>{m.name}</h3><span className="tag">{m.enabled?'Enabled':'Disabled'}</span></div><p>{m.description}</p><small>{m.origin} · {m.turns} internal turns</small></article>)}</div>{!state.motives.length&&<p className="muted">No interests recorded.</p>}
    <h2>Improvement proposals</h2>{!state.proposals.length&&<p className="muted">No proposals recorded. An idea does not grant permission to change code or capabilities.</p>}<ProposalCards proposals={state.proposals.slice(0,10)} onReviewed={onReviewed}/>
  </section>;
}
