import {useState} from 'react';
import {api} from './api.ts';
import type {RuntimeState} from './types.ts';
type Review={requestId:string;proposalId:string;expectedVersion:number;decision:'accepted'|'declined'};
export function ProposalCards({proposals,onReviewed}:{proposals:RuntimeState['proposals'];onReviewed:()=>Promise<void>}) {
  const [pending,setPending]=useState<Review|null>(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  async function submit(request:Review) {
    setPending(request);setBusy(true);setError('');
    try{await api('/api/proposals/review',request);setPending(null);await onReviewed();}
    catch(e){setError(e instanceof Error?e.message:'Proposal review was not confirmed.');}
    finally{setBusy(false);}
  }
  return <div className="cards">{error&&<div role="alert" className="note"><p>{error}</p>{pending&&<button disabled={busy} onClick={()=>void submit(pending)}>Retry the same review</button>}</div>}{proposals.map(p=><article className="card" key={p.id}><div className="card-top"><span className="tag">{p.state}</span><small>{p.scope} · v{p.version}</small></div><h3>{p.description}</h3><p><strong>Expected benefit:</strong> {p.benefit||'Not specified in this older proposal.'}</p><p><strong>Success criteria:</strong> {p.criteria}</p><p><strong>Risks and uncertainty:</strong> {p.risks}</p><small>Proposal review does not authorize code, policy, model or deployment changes.</small>{p.state==='proposed'&&<div className="contact-actions"><button disabled={busy||!!pending} onClick={()=>void submit({requestId:crypto.randomUUID(),proposalId:p.id,expectedVersion:p.version,decision:'accepted'})}>Accept the idea</button><button disabled={busy||!!pending} onClick={()=>void submit({requestId:crypto.randomUUID(),proposalId:p.id,expectedVersion:p.version,decision:'declined'})}>Decline</button></div>}</article>)}</div>;
}
