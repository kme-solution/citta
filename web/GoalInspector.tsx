import {useEffect,useState} from 'react';
interface GoalDetail {goal:{description:string;criterion:string;state:string;version:number;cycles:number;budget_cycles:number;work_ms:string;budget_ms:string;adviser_calls:number;budget_adviser:number};frame:{state:string;checkpoint:unknown;parent_goal_id:string|null;continuation_depth:number}|null;versions:unknown[];transitions:unknown[];decisions:unknown[];actions:unknown[]}
export function GoalInspector({goalId,onClose}:{goalId:string;onClose:()=>void}) {
  const [detail,setDetail]=useState<GoalDetail|null>(null);
  const [error,setError]=useState('');
  useEffect(()=> {
    const abort=new AbortController();setDetail(null);setError('');
    void fetch('/api/goals/'+goalId,{cache:'no-store',signal:abort.signal}).then(async response=>{const data=await response.json();if(!response.ok)throw Error(data.error||'Could not load the commitment.');return data as GoalDetail;}).then(setDetail).catch(e=>{if(!abort.signal.aborted)setError(e instanceof Error?e.message:'Inspector unavailable.');});
    return ()=>abort.abort();
  },[goalId]);
  return <section className="card" aria-label="Commitment continuity inspector"><div className="card-top"><h2>Commitment continuity</h2><button onClick={onClose}>Close inspector</button></div>{error&&<p role="alert">{error}</p>}{!error&&!detail&&<p role="status">Loading committed state…</p>}{detail&&<><h3>{detail.goal.description}</h3><p>Success criterion: {detail.goal.criterion}</p><p>State: {detail.goal.state} · goal v{detail.goal.version} · frame {detail.frame?.state||'unavailable'} · depth {detail.frame?.continuation_depth||1}/4</p>{detail.frame?.parent_goal_id&&<p>Interrupted commitment: {detail.frame.parent_goal_id}</p>}<p>Used budget: {detail.goal.cycles}/{detail.goal.budget_cycles} cycles · {Math.round(Number(detail.goal.work_ms)/1000)}/{Math.round(Number(detail.goal.budget_ms)/1000)} active seconds · {detail.goal.adviser_calls}/{detail.goal.budget_adviser} adviser requests</p>{([['Saved continuation',detail.frame?.checkpoint],['Versioned criteria and source',detail.versions],['State transitions',detail.transitions],['Consideration context and alternatives',detail.decisions],['Actual action outcomes',detail.actions]] as const).map(([label,value])=><details key={label}><summary>{label}</summary><pre>{JSON.stringify(value,null,2)}</pre></details>)}</>}</section>;
}
