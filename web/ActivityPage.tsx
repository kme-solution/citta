import {useEffect,useRef,useState} from 'react';
import {GoalInspector} from './GoalInspector.tsx';
import type {RuntimeState} from './types.ts';
const finished=(state:string)=>['completed','cancelled'].includes(state);
const labels:Record<string,string>={active:'In progress',waiting:'Waiting',suspended:'On hold',exhausted:'Needs attention',completed:'Done',cancelled:'Cancelled'};
const stateLabel=(state:string)=>labels[state]||state.replaceAll('_',' ');
function route(){return location.hash.startsWith('#/activity/')?location.hash.slice('#/activity/'.length):'';}
export function ActivityPage({state,busy,onControl}:{state:RuntimeState|null;busy:boolean;onControl:(action:string,goalId:string)=>Promise<void>}) {
  const [page,setPage]=useState(route);
  const [showFinished,setShowFinished]=useState(false);
  const [search,setSearch]=useState('');
  const heading=useRef<HTMLHeadingElement>(null);
  const workspace=useRef<HTMLElement>(null);
  const overviewScroll=useRef(0);
  useEffect(()=>{const navigate=()=>setPage(route());window.addEventListener('hashchange',navigate);return()=>window.removeEventListener('hashchange',navigate);},[]);
  useEffect(()=>{heading.current?.focus({preventScroll:true});if(workspace.current)workspace.current.scrollTop=page?0:overviewScroll.current;},[page]);
  function open(next:string){if(!page)overviewScroll.current=workspace.current?.scrollTop||0;location.hash='/activity'+(next?'/'+next:'');}
  const goals=state?.goals||[];
  const active=goals.filter(g=>!finished(g.state));
  const visible=goals.filter(g=>(showFinished||!finished(g.state))&&`${g.description} ${g.summary} ${g.criterion} ${g.state}`.toLowerCase().includes(search.toLowerCase()));
  const goal=goals.find(g=>g.id===page);
  return <section className="workspace activity-workspace" ref={workspace} aria-label="Activity">
    {page?<>
      <button className="activity-back" onClick={()=>open('')}>← All activity</button>
      <h2 ref={heading} tabIndex={-1} className="activity-title">{page==='events'?'Event history':'Activity detail'}</h2>
      {page==='events'?<><p className="muted">Latest 10 committed events. Expand an entry to inspect its recorded data.</p><div className="event-list">{state?.events.slice().reverse().slice(0,10).map(e=><details key={e.ordinal}><summary><span>{e.kind.replaceAll('_',' ')}</span><time>{new Date(e.created_at).toLocaleString()}</time></summary><pre>{JSON.stringify(e.body,null,2)}</pre></details>)}</div>{state&&!state.events.length&&<p className="empty">No committed events yet.</p>}</>:<>
        <GoalInspector key={page} goalId={page} onClose={()=>open('')}/>
        {goal&&<div className="activity-controls" aria-label="Activity controls">{goal.state==='exhausted'&&<button disabled={busy} onClick={()=>void onControl('extend',goal.id)}>Grant 12 more cycles / 5 min</button>}{!finished(goal.state)&&<button disabled={busy} onClick={()=>void onControl('cancel',goal.id)}>Cancel this goal</button>}</div>}
      </>}
    </>:<>
      <div className="activity-heading"><div><h2 ref={heading} tabIndex={-1} className="activity-title">Ongoing activity</h2><p className="muted">{active.length} ongoing</p></div><label className="activity-toggle"><input type="checkbox" checked={showFinished} onChange={e=>setShowFinished(e.target.checked)}/> Show finished</label></div>
      <p className="muted">Latest 10 matching activities.</p>
      <details className="activity-tools"><summary>Search & history</summary><div className="activity-toolbar"><label className="activity-search"><span className="sr-only">Search activities</span><input type="search" placeholder="Search activities…" value={search} onChange={e=>setSearch(e.target.value)}/></label><button onClick={()=>open('events')}>Event history →</button></div></details>
      {!state?<p role="status">Loading activity…</p>:!visible.length?<div className="empty">{search?'No activities match your search.':!showFinished?'Nothing ongoing. Turn on Show finished to see past activity.':'No activity yet.'}</div>:<ul className="activity-rows">{visible.slice(0,10).map(g=><li key={g.id}><button className="activity-row" onClick={()=>open(g.id)}><span className={'tag '+g.state}>{stateLabel(g.state)}</span><span className="activity-row-copy"><strong>{g.description}</strong></span><span aria-hidden="true">→</span></button></li>)}</ul>}

    </>}
  </section>;
}
