// This module intentionally imports no repositories, clocks, network clients or abilities.
import type { Context, Decision } from '../../contracts/runtime.ts';
import { ENGINE_VERSION, POLICY_VERSION } from '../../contracts/runtime.ts';
import { considerLocal, validateProposal } from '../cetana/consider.ts';
import { reviewOutcome } from '../paccavekkhana/review.ts';
import { selectAttention } from '../manasikara/select.ts';
export interface RecordedDecision {id:string;engine:string;policy:string;snapshot:Context;decision:Decision}
export function replayDecision(record: RecordedDecision) {
  if(record.engine!==ENGINE_VERSION || record.policy!==POLICY_VERSION) return {id:record.id,state:'unsupported',reason:'Engine or policy version differs.'};
  const ctx=record.snapshot;
  if(ctx.attention) {
    const selected=selectAttention(ctx.attention.candidates,ctx.attention.consecutiveUserTurns,ctx.attention.now);
    if(selected?.selectedId!==ctx.attention.selectedId)return {id:record.id,state:'diverged',reason:'Recorded attention choice differs from the pinned policy.'};
  }
  let actual:Decision;
  if(ctx.focusInvalidation){
    actual={action:'REFOCUS',text:'',reason:ctx.focusInvalidation,tone:'undetermined',evidenceIds:[]};
  } else if(ctx.invalidatedEvidenceIds?.length) {
    actual={action:'RECONSIDER',text:'',reason:'Saved context changed while local cognition was pending; reconsider against current scoped evidence.',tone:'undetermined',evidenceIds:ctx.invalidatedEvidenceIds};
  } else if(ctx.reviewedOutcome) {
    const {kind,outcome,observationId}=ctx.reviewedOutcome;
    const review=reviewOutcome(kind,outcome);
    const content=outcome.ok?(kind==='CONSULT_AI'?'Codex advice (unverified):\n\n':kind==='COMPUTER'?'Observed desktop feedback:\n\n':'Observed source content:\n\n')+(outcome.text||''):review.reason;
    actual={action:'REVIEW',text:content,reason:review.reason,tone:outcome.ok?'neutral':'undetermined',evidenceIds:[observationId],uncertainty:review.criterion==='unknown'?review.reason:''};
  } else if(ctx.proposal) {
    try {actual=validateProposal(ctx.proposal,ctx);if(ctx.kind==='mental'&&!['REFLECT','READ','COMPUTER','WAIT','ADOPT_INTEREST','INITIATE','PROPOSE_IMPROVEMENT','CLARIFY'].includes(actual.action))throw Error('Internal turn proposed an ineligible action.');}
    catch(error){const reason=error instanceof Error?error.message:'Invalid local proposal';actual={action:'CLARIFY',reason,tone:'undetermined',text:reason,evidenceIds:[]};}
  } else {
    actual=(ctx.kind==='speech'&&!ctx.continuationTask?considerLocal(ctx):null)||{action:'INFER',text:'',reason:ctx.kind==='mental'?(ctx.focus?'The retained focus needs contextual consideration.':'A fresh internal topic needs contextual local cognition.'):'Input is beyond sufficient local routines; seek a local cognitive proposal.',tone:'undetermined',evidenceIds:[],argument:ctx.text};
  }
  const keys=['action','text','reason','tone','argument','uncertainty','evidenceIds','candidateTendency','chosenTendency','regulationReason','alternatives','improvement','goalReview','focusReview'] as const;
  const mismatches=keys.filter(key=>JSON.stringify(actual[key])!==JSON.stringify(record.decision[key]));
  return {id:record.id,state:mismatches.length?'diverged':'matched',mismatches};
}
