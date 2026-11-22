import { randomUUID, createHash } from 'node:crypto';
import { readdir } from 'node:fs/promises';
import { config } from '../../app/config.ts';
import { transaction, lockAgent, event, type Tx } from '../../infra/postgres/database.ts';
import { ENGINE_VERSION, POLICY_VERSION, type Context, type Decision, type Outcome, type Work, type Evidence } from '../../contracts/runtime.ts';
import { considerLocal, validateProposal } from '../cetana/consider.ts';
import { authorize } from '../sikkha/authorize.ts';
import { reviewOutcome } from '../paccavekkhana/review.ts';
import { contactDisposition } from './contact-policy.ts';
import { appraise } from '../vedana/appraise.ts';
import { selectAttention, type AttentionSnapshot } from '../manasikara/select.ts';
import { nextMotiveEligibility } from '../chanda/eligibility.ts';
import { renderSpeech } from '../cetana/speech-policy.ts';

type Row = Record<string, any>;
async function message(tx: Tx, conversationId: string, text: string, goalId: string, observationId: string, source='local', initiative=false) {
  await tx.query("INSERT INTO citta.messages(id,agent_id,conversation_id,role,text,observation_id,goal_id,source,initiative,contact_state) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
    [randomUUID(),config.agentId,conversationId,source==='codex'?'adviser':'citta',text,observationId,goalId,source,initiative,initiative?'created':null]);
  await event(tx,'message',{conversationId,goalId,source,initiative});
}
async function closeGoal(tx: Tx, goalId: string, state='completed', summary='') {
  await tx.query('UPDATE citta.goals SET state=$2,summary=$3,updated_at=now() WHERE id=$1 AND agent_id=$4',[goalId,state,summary.slice(0,2000),config.agentId]);
  await tx.query("UPDATE citta.frames SET state='closed',version=version+1,updated_at=now() WHERE goal_id=$1 AND agent_id=$2",[goalId,config.agentId]);
}
async function recordDecision(tx: Tx, ctx: Context, d: Decision, operationKey: string) {
  const id = randomUUID();
  const affect=appraise(d,ctx.modeledAffectEnabled!==false);
  const {rows:[owner]}=await tx.query('UPDATE citta.agents SET decision_sequence=decision_sequence+1 WHERE id=$1 RETURNING decision_sequence,generation,control_version',[config.agentId]);
  const {rows:[goal]}=await tx.query('SELECT version,state,criterion,cycles,adviser_calls,work_ms FROM citta.goals WHERE id=$1 AND agent_id=$2',[ctx.goalId,config.agentId]);
  ctx.commitState={sequence:String(owner.decision_sequence),goalVersion:goal.version,goalState:goal.state,criterion:goal.criterion,cycles:goal.cycles,adviserCalls:goal.adviser_calls,workMs:String(goal.work_ms),generation:String(owner.generation),controlVersion:owner.control_version};
  await tx.query('INSERT INTO citta.decisions(id,agent_id,observation_id,goal_id,operation_key,engine,policy,snapshot,decision,sequence) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
    [id,config.agentId,ctx.selectedObservationId||ctx.observationId,ctx.goalId,operationKey,ENGINE_VERSION,POLICY_VERSION,JSON.stringify(ctx),JSON.stringify(d),owner.decision_sequence]);
  await tx.query('INSERT INTO citta.appraisals(id,agent_id,decision_id,tone,cause,uncertainty,tendency,candidate,regulation) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)',
    [randomUUID(),config.agentId,id,affect.tone,affect.cause,affect.uncertainty,affect.tendency,affect.candidate,affect.regulation]);
  await tx.query('UPDATE citta.goals SET cycles=cycles+1,evidence_ids=$2,updated_at=now() WHERE id=$1',[ctx.goalId,JSON.stringify(d.evidenceIds)]);
  await event(tx,'decision',{decisionId:id,goalId:ctx.goalId,action:d.action,reason:d.reason,tone:d.tone,evidenceIds:d.evidenceIds});
}
async function queue(tx: Tx, agent: Row, ctx: Context, kind: Work['kind'], argument: string) {
  authorize(kind,ctx,argument,config.adviserEnabled);
  if(kind==='INFER'&&!config.cognitionEnabled)throw Error('Local cognition is not enabled. Evaluate the configured model, then set CITTA_COGNITION_ENABLED=true. No external fallback was used.');
  const {rows:[goal]} = await tx.query('SELECT * FROM citta.goals WHERE id=$1 AND agent_id=$2',[ctx.goalId,config.agentId]);
  if (!goal || ['cancelled','completed','exhausted'].includes(goal.state)) throw Error('Goal is not eligible.');
  if (goal.cycles >= goal.budget_cycles || (kind === 'CONSULT_AI' && goal.adviser_calls >= goal.budget_adviser)) throw Error('Goal work budget exhausted.');
  if (Number(goal.work_ms)>=Number(goal.budget_ms)) throw Error('Goal elapsed-work budget exhausted.');
  const {rows:[uncertain]}=await tx.query("SELECT id FROM citta.actions WHERE goal_id=$1 AND state='unknown' LIMIT 1",[ctx.goalId]);
  if(uncertain)throw Error('This goal has an unknown effect. Reconcile it before dispatching more work.');
  if (agent.work_used >= config.hourlyWorkLimit) throw Error('Global work budget is exhausted for this hour.');
  const id = randomUUID();
  await tx.query('INSERT INTO citta.actions(id,agent_id,goal_id,goal_version,kind,argument,context,generation,control_version) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)',
    [id,config.agentId,ctx.goalId,goal.version,kind,argument,JSON.stringify(ctx),agent.generation,agent.control_version]);
  await tx.query("UPDATE citta.goals SET state='waiting',adviser_calls=adviser_calls+$2 WHERE id=$1",[ctx.goalId,kind==='CONSULT_AI'?1:0]);
  await tx.query("UPDATE citta.frames SET state='waiting',checkpoint=$2,version=version+1,updated_at=now() WHERE goal_id=$1",[ctx.goalId,JSON.stringify({actionId:id,evidenceIds:ctx.evidence.map(e=>e.id),reason:'Waiting for '+kind})]);
  await tx.query('UPDATE citta.agents SET work_used=work_used+1 WHERE id=$1',[config.agentId]);
  agent.work_used++;
  await event(tx,'queued',{actionId:id,kind,goalId:ctx.goalId});
}
async function applyDecision(tx: Tx, agent: Row, ctx: Context, d: Decision, key: string) {
  await recordDecision(tx,ctx,d,key);
  if(d.goalReview||(ctx.kind==='mental'&&ctx.proposal))await tx.query('UPDATE citta.goals SET criterion=COALESCE($2,criterion),description=COALESCE($3,description) WHERE id=$1',[ctx.goalId,d.goalReview?.criterion||null,ctx.kind==='mental'&&ctx.proposal?(d.text||d.reason).slice(0,1000):null]);
  if (['READ','CONSULT_AI','INFER'].includes(d.action)) {
    try { await queue(tx,agent,ctx,d.action as Work['kind'],d.argument||ctx.text); }
    catch (error) {
      const reason = error instanceof Error?error.message:'Action was denied.';
      if(ctx.kind!=='mental')await message(tx,ctx.conversationId,reason,ctx.goalId,ctx.observationId);
      await closeGoal(tx,ctx.goalId,'exhausted',reason);
      await event(tx,'denied',{goalId:ctx.goalId,reason});
    }
    return;
  }
  if(d.action==='SET_PREFERENCE') {
    const {rows:[old]}=await tx.query('SELECT memory_id FROM citta.preferences WHERE agent_id=$1 AND conversation_id=$2 AND key=$3',[config.agentId,ctx.conversationId,d.argument]);
    if(old)await tx.query('UPDATE citta.memories SET valid=false WHERE id=$1 AND agent_id=$2',[old.memory_id,config.agentId]);
    const memoryId=randomUUID();
    await tx.query("INSERT INTO citta.memories(id,agent_id,conversation_id,kind,content,source_id,supersedes) VALUES($1,$2,$3,'reported',$4,$5,$6)",[memoryId,config.agentId,ctx.conversationId,`Conversation preference ${d.argument}: ${d.text}`,ctx.observationId,old?.memory_id||null]);
    await tx.query('INSERT INTO citta.preferences(agent_id,conversation_id,key,value,memory_id,source_id) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(agent_id,conversation_id,key) DO UPDATE SET value=EXCLUDED.value,memory_id=EXCLUDED.memory_id,source_id=EXCLUDED.source_id,version=citta.preferences.version+1,updated_at=now()',[config.agentId,ctx.conversationId,d.argument,d.text,memoryId,ctx.observationId]);
    await message(tx,ctx.conversationId,`Saved for this conversation: ${d.argument} = ${d.text}. My configured identity and permissions are unchanged.`,ctx.goalId,ctx.observationId);
    await event(tx,'preference_changed',{conversationId:ctx.conversationId,key:d.argument,memoryId,sourceId:ctx.observationId});
  } else if (d.action === 'REMEMBER' || d.action === 'CORRECT_MEMORY') {
    if (d.action==='CORRECT_MEMORY') {
      const {rows:[preference]}=await tx.query('SELECT key FROM citta.preferences WHERE agent_id=$1 AND conversation_id=$2 AND memory_id=$3',[config.agentId,ctx.conversationId,d.argument]);
      if(preference){await message(tx,ctx.conversationId,`This note records a validated preference. Use prefer ${preference.key} <value> to change it.`,ctx.goalId,ctx.observationId);await closeGoal(tx,ctx.goalId,'completed','Explain the scoped preference correction boundary.');return;}
      const {rowCount}=await tx.query('UPDATE citta.memories SET valid=false WHERE id=$1 AND agent_id=$2 AND conversation_id=$3 AND valid',[d.argument,config.agentId,ctx.conversationId]);
      if(!rowCount){await message(tx,ctx.conversationId,'That note changed before the correction was applied. Please select its current version.',ctx.goalId,ctx.observationId);await closeGoal(tx,ctx.goalId,'exhausted','Stale memory correction');return;}
    }
    await tx.query("INSERT INTO citta.memories(id,agent_id,conversation_id,kind,content,source_id,supersedes) VALUES($1,$2,$3,'reported',$4,$5,$6)",[randomUUID(),config.agentId,ctx.conversationId,d.text,ctx.observationId,d.action==='CORRECT_MEMORY'?d.argument:null]);
    await message(tx,ctx.conversationId,/[\u1000-\u109f]/u.test(ctx.text)?'သင့်ပြောဆိုချက်အဖြစ် ဒီစကားဝိုင်းအတွက် မှတ်ထားပါပြီ။':'Saved as your reported note in this conversation.',ctx.goalId,ctx.observationId);
  } else if (d.action === 'CANCEL_GOAL') {
    const expected=ctx.eligibleGoals?.find(g=>g.id===d.argument)?.version;
    const {rowCount}=await tx.query("UPDATE citta.goals SET state='cancelled',version=version+1,updated_at=now() WHERE id=$1 AND agent_id=$2 AND conversation_id=$3 AND version=$4 AND state NOT IN ('completed','cancelled')",[d.argument,config.agentId,ctx.conversationId,expected]);
    if (rowCount) {
      await tx.query("UPDATE citta.frames SET state='closed',version=version+1 WHERE goal_id=$1 AND agent_id=$2",[d.argument,config.agentId]);
      await tx.query("UPDATE citta.actions SET state='cancelled',finished_at=now() WHERE goal_id=$1 AND agent_id=$2 AND state='queued'",[d.argument,config.agentId]);
    }
    await message(tx,ctx.conversationId,rowCount?'The selected goal is cancelled. An already-started effect may still finish; its result cannot revive the goal.':'That goal is no longer eligible.',ctx.goalId,ctx.observationId);
  } else if(d.action==='REVISE_GOAL') {
    const expected=ctx.eligibleGoals?.find(g=>g.id===d.argument)?.version;
    const {rows:[target]}=await tx.query("UPDATE citta.goals SET version=version+1,state='active',description=$4,criterion=$4,wait_reason=NULL,due_at=NULL,updated_at=now() WHERE id=$1 AND agent_id=$2 AND conversation_id=$3 AND version=$5 AND state NOT IN ('completed','cancelled') RETURNING *",[d.argument,config.agentId,ctx.conversationId,d.text,expected]);
    if(!target) {
      await message(tx,ctx.conversationId,'The selected commitment changed before this correction was applied. Please clarify the current target.',ctx.goalId,ctx.observationId);
    } else {
      await tx.query("UPDATE citta.actions SET state='cancelled',finished_at=now() WHERE goal_id=$1 AND state='queued'",[target.id]);
      await tx.query("UPDATE citta.frames SET state='suspended',version=version+1,checkpoint=$2 WHERE goal_id=$1",[target.id,JSON.stringify({correctionObservation:ctx.observationId,previousVersion:expected})]);
      const {rows:[prior]}=await tx.query('SELECT context FROM citta.actions WHERE goal_id=$1 ORDER BY created_at DESC LIMIT 1',[target.id]);
      const revised:Context={...ctx,goalId:target.id,text:d.text,kind:'speech',evidence:[...(prior?.context?.evidence||ctx.evidence),{id:ctx.observationId,kind:'reported',content:ctx.text,origin:'observation'}],eligibleGoals:[]};
      delete revised.proposal;delete revised.reviewedOutcome;
      await message(tx,ctx.conversationId,'I recorded the correction and will reconsider the existing commitment. Earlier in-flight results cannot overwrite it.',ctx.goalId,ctx.observationId);
      try{await queue(tx,agent,revised,'INFER',d.text);}catch(error){const reason=error instanceof Error?error.message:'Reconsideration denied';await closeGoal(tx,target.id,'exhausted',reason);}
      await event(tx,'goal_revised',{goalId:target.id,version:target.version,source:ctx.observationId});
    }
  } else if(d.action==='WAIT') {
    await tx.query("UPDATE citta.goals SET state='waiting',due_at=$2,wait_reason=$3,summary=$3,updated_at=now() WHERE id=$1",[ctx.goalId,d.argument,d.text||d.reason]);
    await tx.query("UPDATE citta.frames SET state='waiting',version=version+1,checkpoint=$2 WHERE goal_id=$1",[ctx.goalId,JSON.stringify({dueAt:d.argument,reason:d.text||d.reason})]);
    if(ctx.kind!=='mental')await message(tx,ctx.conversationId,d.text||`Waiting until ${d.argument}.`,ctx.goalId,ctx.observationId);
    return;
  } else if (d.action === 'PROPOSE_IMPROVEMENT') {
    const details=d.improvement!;
    const state=details.requiresPrivilegeExpansion?'declined':'proposed';
    await tx.query('INSERT INTO citta.proposals(id,agent_id,goal_id,description,evidence_ids,criteria,risks,benefit,scope,state) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
      [randomUUID(),config.agentId,ctx.goalId,d.text,JSON.stringify(d.evidenceIds),details.criteria,details.risks,details.benefit,details.scope,state]);
    await event(tx,'improvement_proposal',{goalId:ctx.goalId,state,scope:details.scope,reason:details.requiresPrivilegeExpansion?'Privilege expansion is outside the permitted boundary.':'Awaiting proposal review; no executable self-change capability exists.'});
    if (ctx.kind !== 'mental') await message(tx,ctx.conversationId,(state==='declined'?'The privilege-expanding proposal was declined.':'Improvement proposal recorded; accepting the idea does not authorize execution.')+'\n\n'+d.text,ctx.goalId,ctx.observationId);
  } else if(d.action==='ADOPT_INTEREST') {
    const {rows:[count]}=await tx.query('SELECT count(*)::integer AS n FROM citta.motives WHERE agent_id=$1 AND enabled',[config.agentId]);
    if(count.n<12) {
      const {rowCount}=await tx.query("INSERT INTO citta.motives(id,agent_id,name,origin,description,conversation_id,source_observation_id,evidence_ids) VALUES($1,$2,$3,'inferred-from-observation',$4,$5,$6,$7) ON CONFLICT(agent_id,name) DO UPDATE SET description=EXCLUDED.description,version=citta.motives.version+1,source_observation_id=EXCLUDED.source_observation_id,evidence_ids=EXCLUDED.evidence_ids WHERE citta.motives.origin='inferred-from-observation' AND citta.motives.conversation_id=EXCLUDED.conversation_id",[randomUUID(),config.agentId,d.argument!.trim(),d.text,ctx.conversationId,ctx.observationId,JSON.stringify(d.evidenceIds)]);
      await event(tx,'interest_candidate',{goalId:ctx.goalId,name:d.argument,adopted:!!rowCount,evidenceIds:d.evidenceIds});
      if(ctx.kind!=='mental')await message(tx,ctx.conversationId,rowCount?'I recorded this as a candidate interest, without changing my identity, values or permissions.':'That interest name cannot be revised in this conversation.',ctx.goalId,ctx.observationId);
    } else {
      await event(tx,'interest_deferred',{goalId:ctx.goalId,reason:'Bounded disposition capacity reached.'});
      if(ctx.kind!=='mental')await message(tx,ctx.conversationId,'I retained the proposal in this decision, but did not add an interest because the disposition limit is reached.',ctx.goalId,ctx.observationId);
    }
  } else if (d.action === 'REFLECT') {
    await tx.query("INSERT INTO citta.memories(id,agent_id,conversation_id,kind,content,source_id) VALUES($1,$2,$3,'inferred',$4,$5)",[randomUUID(),config.agentId,ctx.conversationId,d.text,ctx.observationId]);
    await event(tx,'reflection',{goalId:ctx.goalId,text:d.text,evidenceIds:d.evidenceIds});
  } else if (d.action === 'INITIATE') {
    const topic=createHash('sha256').update((d.argument||d.text).normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim()).digest('hex');
    const speech=renderSpeech(d,ctx);
    const contentKey=createHash('sha256').update(speech.normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim()).digest('hex');
    await tx.query("INSERT INTO citta.contacts(id,agent_id,conversation_id,goal_id,observation_id,topic_key,text,reason,state,expires_at,topic_label,content_key) VALUES($1,$2,$3,$4,$5,$6,$7,$8,'created',now()+interval '24 hours',$9,$10) ON CONFLICT DO NOTHING",[randomUUID(),config.agentId,ctx.conversationId,ctx.goalId,ctx.observationId,topic,speech,d.reason,(d.argument||d.text).slice(0,300),contentKey]);
    await deliverContact(tx,agent);
  } else {
    if(ctx.kind==='mental')await event(tx,'private_consideration',{goalId:ctx.goalId,text:d.text,reason:d.reason});
    else await message(tx,ctx.conversationId,renderSpeech(d,ctx),ctx.goalId,ctx.observationId,d.action==='RECALL'?'memory':ctx.proposal?'local-cognition':'local');
  }
  if((d.action==='CLARIFY'||(d.action==='RESPOND'&&d.goalReview&&d.goalReview.status!=='met'))&&ctx.kind!=='mental') {
    await tx.query("UPDATE citta.goals SET state='waiting',wait_reason=$3,summary=$2,updated_at=now() WHERE id=$1",[ctx.goalId,d.text,d.action==='CLARIFY'?'operator_input':'evidence_or_operator_input']);
    await tx.query("UPDATE citta.frames SET state='waiting',checkpoint=$2,version=version+1 WHERE goal_id=$1",[ctx.goalId,JSON.stringify({trigger:d.action==='CLARIFY'?'operator_input':'evidence_or_operator_input',clarification:d.text,review:d.goalReview})]);
    return;
  }
  await closeGoal(tx,ctx.goalId,'completed',d.text);
}
async function deliverContact(tx:Tx,agent:Row) {
  await tx.query("UPDATE citta.contacts SET state='expired' WHERE agent_id=$1 AND state IN ('created','deferred') AND expires_at<=now()",[config.agentId]);
  const {rows:[candidate]}=await tx.query("SELECT * FROM citta.contacts WHERE agent_id=$1 AND state IN ('created','deferred') AND expires_at>now() ORDER BY created_at LIMIT 1",[config.agentId]);
  if(!candidate)return;
  const {rows:[pending]}=await tx.query("SELECT id FROM citta.messages WHERE agent_id=$1 AND initiative AND contact_state IN ('created','delivered','seen') AND created_at>now()-interval '24 hours' LIMIT 1",[config.agentId]);
  const snapshot={policy:'contact-v2' as const,candidate:{id:candidate.id,conversationId:candidate.conversation_id,text:candidate.text},quiet:!!agent.quiet,pending:!!pending,lastContactAt:agent.last_contact_at?new Date(agent.last_contact_at).toISOString():null,intervalMs:config.contactIntervalMs,now:new Date().toISOString(),expiresAt:new Date(candidate.expires_at).toISOString()};
  const choice=contactDisposition(snapshot);
  if(choice.action!=='deliver') {
    if(candidate.state!=='deferred')await event(tx,'contact_review',{contactId:candidate.id,snapshot,choice,effect:null});
    await tx.query("UPDATE citta.contacts SET state='deferred' WHERE id=$1",[candidate.id]);return;
  }
  await tx.query("INSERT INTO citta.messages(id,agent_id,conversation_id,role,text,goal_id,observation_id,source,initiative,contact_state,contact_id) VALUES($1,$2,$3,'citta',$4,$5,$6,'local-cognition',true,'created',$7)",[randomUUID(),config.agentId,candidate.conversation_id,candidate.text,candidate.goal_id,candidate.observation_id,candidate.id]);
  await tx.query("UPDATE citta.contacts SET state='delivered' WHERE id=$1",[candidate.id]);
  await tx.query('UPDATE citta.agents SET last_contact_at=now() WHERE id=$1',[config.agentId]);agent.last_contact_at=new Date();
  await event(tx,'message',{conversationId:candidate.conversation_id,goalId:candidate.goal_id,contactId:candidate.id,initiative:true});
  await event(tx,'contact_review',{contactId:candidate.id,snapshot,choice,effect:{kind:'local_inbox',conversationId:candidate.conversation_id,text:candidate.text}});
}
async function context(tx: Tx, observation: Row, goalId: string, agent: Row): Promise<Context> {
  const {rows:[profile]} = await tx.query('SELECT body FROM citta.profiles WHERE id=$1 AND agent_id=$2',[agent.profile_id,config.agentId]);
  const {rows:memories} = await tx.query('SELECT id,kind,content FROM citta.memories WHERE agent_id=$1 AND valid AND (conversation_id=$2 OR conversation_id IS NULL) ORDER BY created_at DESC LIMIT 12',[config.agentId,observation.conversation_id]);
  const {rows:recent} = await tx.query('SELECT role,text FROM citta.messages WHERE agent_id=$1 AND conversation_id=$2 ORDER BY created_at DESC LIMIT 8',[config.agentId,observation.conversation_id]);
  const {rows:eligibleGoals}=await tx.query("SELECT id,description,state,version,criterion FROM citta.goals WHERE agent_id=$1 AND conversation_id=$2 AND id<>$3 AND state NOT IN ('completed','cancelled') ORDER BY created_at DESC LIMIT 10",[config.agentId,observation.conversation_id,goalId]);
  const {rows:appraisals}=await tx.query('SELECT a.tone,a.cause,a.tendency,a.uncertainty FROM citta.appraisals a JOIN citta.decisions d ON d.id=a.decision_id JOIN citta.goals g ON g.id=d.goal_id WHERE a.agent_id=$1 AND g.conversation_id=$2 ORDER BY a.created_at DESC LIMIT 3',[config.agentId,observation.conversation_id]);
  const {rows:declinedTopics}=await tx.query("SELECT topic_label AS topic,text FROM citta.contacts WHERE agent_id=$1 AND state='declined' ORDER BY created_at DESC LIMIT 12",[config.agentId]);
  const {rows:preferences}=await tx.query('SELECT key,value,version,memory_id AS "memoryId",source_id AS "sourceId" FROM citta.preferences WHERE agent_id=$1 AND conversation_id=$2 ORDER BY key',[config.agentId,observation.conversation_id]);
  const evidence:Evidence[] = memories.map(m=>({id:m.id,kind:m.kind,content:m.content.slice(0,1000),origin:'memory'}));
  const requestedCorrection=/^correct saved note ([0-9a-f-]{36}):/i.exec(observation.text);
  if(requestedCorrection&&!evidence.some(e=>e.id===requestedCorrection[1])) {
    const {rows:[note]}=await tx.query("SELECT id,kind,content FROM citta.memories WHERE id=$1 AND agent_id=$2 AND conversation_id=$3 AND valid AND kind='reported'",[requestedCorrection[1],config.agentId,observation.conversation_id]);
    if(note)evidence.push({id:note.id,kind:note.kind,content:note.content.slice(0,1000),origin:'memory'});
  }
  evidence.push({id:observation.id,kind:observation.kind==='speech'?'reported':'inferred',content:observation.text.slice(0,2000),origin:'observation'});
  return {observationId:observation.id,conversationId:observation.conversation_id,text:observation.text,kind:observation.kind,
    profile:profile.body,profileVersion:agent.profile_id,controlVersion:agent.control_version,goalId,evidence,recent:recent.reverse().map(m=>({role:m.role,text:m.text.slice(0,1200)})),eligibleGoals,appraisals:config.affectEnabled?appraisals:[],declinedTopics,preferences,modeledAffectEnabled:config.affectEnabled,motive:observation.payload?.motive,
    recordedAt:new Date().toISOString(),motiveSnapshot:observation.payload?.motiveSnapshot,versions:{generation:String(agent.generation),domainVersion:String(agent.domain_version),policy:POLICY_VERSION,engine:ENGINE_VERSION,catalog:'not-used'}};
}
async function newGoal(tx: Tx, observation: Row,ctx:Context,transient:boolean) {
  const id=ctx.goalId;
  const {rows:[parent]}=await tx.query("SELECT f.goal_id,f.continuation_depth FROM citta.actions a JOIN citta.frames f ON f.goal_id=a.goal_id JOIN citta.goals g ON g.id=a.goal_id WHERE a.agent_id=$1 AND a.state IN ('running','queued') AND g.state IN ('active','waiting','suspended') ORDER BY CASE WHEN a.state='running' THEN 0 ELSE 1 END,a.created_at DESC,a.id LIMIT 1",[config.agentId]);
  const depth=transient?1:parent?parent.continuation_depth+1:1;
  if(depth>4) {
    await tx.query("UPDATE citta.observations SET not_before=now()+interval '2 seconds',payload=payload||jsonb_build_object('deferredReason','nested continuation limit') WHERE id=$1 AND agent_id=$2",[observation.id,config.agentId]);
    if(observation.payload?.deferredReason!=='nested continuation limit')await event(tx,'input_deferred',{observationId:observation.id,reason:'Four nested continuations are already retained; input remains pending.'});
    return null;
  }
  ctx.interruption={parentGoalId:parent?.goal_id||null,depth,transient};
  await tx.query("UPDATE citta.frames SET state='suspended',version=version+1,updated_at=now() WHERE agent_id=$1 AND state='foreground'",[config.agentId]);
  await tx.query("INSERT INTO citta.goals(id,agent_id,conversation_id,observation_id,description,criterion,state) VALUES($1,$2,$3,$4,$5,$6,'active')",[id,config.agentId,observation.conversation_id,observation.id,observation.text,observation.kind==='mental'?'Record a bounded grounded reflection, permitted exploration, local conversation opening or improvement proposal.':/^(?:ask|consult codex|codex ကိုမေးပါ)\s/iu.test(observation.text)?'Receive attributable external advice, explicitly retaining unverified accuracy.':'Return a grounded response or an explicit clarification/limitation.']);
  await tx.query("INSERT INTO citta.frames(goal_id,agent_id,state,parent_goal_id,continuation_depth,checkpoint) VALUES($1,$2,'foreground',$3,$4,$5)",[id,config.agentId,transient?null:parent?.goal_id||null,depth,JSON.stringify({interruption:ctx.interruption})]);
  return id;
}
async function internalObservation(tx: Tx, agent: Row, files: string[]) {
  if (!config.cognitionEnabled || agent.work_used >= Math.max(1,Math.floor(config.hourlyWorkLimit/2)) || new Date(agent.next_internal_at).getTime()>Date.now()) return null;
  const {rows:[pending]}=await tx.query("SELECT id FROM citta.observations WHERE agent_id=$1 AND state='pending' AND kind='mental' AND NOT(payload ? 'recallGoalId') LIMIT 1",[config.agentId]);
  if(pending)return null;
  let {rows:[conversation]} = await tx.query('SELECT id FROM citta.conversations WHERE agent_id=$1 ORDER BY created_at DESC LIMIT 1',[config.agentId]);
  if (!conversation) {
    conversation = {id:randomUUID()};
    await tx.query("INSERT INTO citta.conversations(id,agent_id,title) VALUES($1,$2,'Local inbox')",[conversation.id,config.agentId]);
  }
  const {rows:[motive]} = await tx.query('SELECT m.*,c.last_topic AS scoped_last_topic,c.last_context_signature,COALESCE(c.unchanged_turns,0) AS unchanged_turns FROM citta.motives m LEFT JOIN citta.motive_contexts c ON c.agent_id=m.agent_id AND c.motive_id=m.id AND c.conversation_id=$2 WHERE m.agent_id=$1 AND (m.conversation_id=$2 OR m.conversation_id IS NULL) AND m.enabled AND COALESCE(c.next_eligible_at,now())<=now() ORDER BY COALESCE(c.turns,0),m.turns,m.created_at,m.id LIMIT 1',[config.agentId,conversation.id]);
  if (!motive) return null;
  const {rows:grounded}=await tx.query("SELECT id,kind,content FROM citta.memories WHERE agent_id=$1 AND (conversation_id=$2 OR conversation_id IS NULL) AND valid AND kind IN ('configured','reported','observed','commitment') ORDER BY created_at DESC LIMIT 20",[config.agentId,conversation.id]);
  const groundedHashes=[...new Set(grounded.map(m=>createHash('sha256').update(m.kind+'\n'+m.content).digest('hex')))].sort();
  const signature=createHash('sha256').update(JSON.stringify({profile:agent.profile_id,motive:{name:motive.name,description:motive.description,origin:motive.origin},grounded:groundedHashes,files:[...files].sort()})).digest('hex');
  const eligibility=nextMotiveEligibility({sameContext:signature===motive.last_context_signature,unchangedTurns:motive.unchanged_turns,intervalMs:config.internalIntervalMs,now:new Date().toISOString()});
  const motiveSnapshot={id:motive.id,name:motive.name,origin:motive.origin,description:motive.description,version:motive.version,contextSignature:signature,nextEligibleAt:eligibility.nextEligibleAt,unchangedTurns:eligibility.unchangedTurns,memoryIds:grounded.map(m=>m.id)};
  const id = randomUUID();
  const text = `Internal opportunity ${agent.internal_count+1}. Motive: ${motive.description}. Previous topic: ${motive.scoped_last_topic||'none'}. Choose a fresh bounded topic, not a pending task. Available source names: ${files.join(', ')||'none'}. Quiet contact: ${agent.quiet}. Your interest can lead to reflection without speaking. Do not invent experiences.`;
  const payload={motive:motive.name,motiveId:motive.id,previousTopic:motive.scoped_last_topic,motiveSnapshot};
  const {rows:[stored]}=await tx.query("INSERT INTO citta.observations(id,agent_id,conversation_id,source_key,kind,text,payload) VALUES($1,$2,$3,$4,'mental',$5,$6) RETURNING created_at",[id,config.agentId,conversation.id,'internal:'+agent.internal_count,text,JSON.stringify(payload)]);
  await tx.query('UPDATE citta.agents SET internal_count=internal_count+1,next_internal_at=now()+$2::double precision*interval \'1 millisecond\' WHERE id=$1',[config.agentId,config.internalIntervalMs]);
  await tx.query('UPDATE citta.motives SET turns=turns+1,version=version+1 WHERE id=$1 AND agent_id=$2',[motive.id,config.agentId]);
  await tx.query('INSERT INTO citta.motive_contexts(agent_id,motive_id,conversation_id,last_context_signature,unchanged_turns,turns,next_eligible_at) VALUES($1,$2,$3,$4,$5,1,$6) ON CONFLICT(agent_id,motive_id,conversation_id) DO UPDATE SET last_context_signature=EXCLUDED.last_context_signature,unchanged_turns=EXCLUDED.unchanged_turns,turns=citta.motive_contexts.turns+1,next_eligible_at=EXCLUDED.next_eligible_at',[config.agentId,motive.id,conversation.id,signature,eligibility.unchangedTurns,eligibility.nextEligibleAt]);
  await event(tx,'internal_opportunity',{observationId:id,motiveId:motive.id,contextSignature:signature,nextEligibleAt:eligibility.nextEligibleAt,unchangedTurns:eligibility.unchangedTurns});
  return {id,conversation_id:conversation.id,text,kind:'mental',payload,created_at:stored.created_at};
}
export async function cycle(operationId: string, generation: string) {
  let files: string[] = [];
  try { files = (await readdir(config.readRoot,{withFileTypes:true})).filter(f=>f.isFile()).map(f=>f.name).slice(0,30); } catch { /* Missing evidence directory is not fabricated evidence. READ reports actual errors. */ }
  return transaction(async tx=> {
    const agent = await lockAgent(tx);
    if(String(agent.generation)!==generation)return {work:[],waiting:true,fenced:true};
    const {rows:[existing]} = await tx.query('SELECT result FROM citta.operations WHERE id=$1 AND agent_id=$2',[operationId,config.agentId]);
    if (existing) return existing.result as {work:{id:string;kind:Work['kind']}[];waiting:boolean;fenced?:boolean};
    await tx.query('UPDATE citta.agents SET heartbeat_at=now() WHERE id=$1',[config.agentId]);
    if (new Date(agent.budget_hour).getTime()<new Date(agent.current_budget_hour).getTime()) {
      await tx.query("UPDATE citta.agents SET budget_hour=date_trunc('hour',now()),work_used=0 WHERE id=$1",[config.agentId]); agent.work_used=0;
    }
    await tx.query("UPDATE citta.messages SET contact_state='expired' WHERE agent_id=$1 AND initiative AND contact_state IN ('created','delivered','seen') AND created_at<now()-interval '24 hours'",[config.agentId]);
    // A lost unsafe external effect is never blindly redispatched. Repeat-safe reads/model attempts are also made explicit failures here.
    const {rows:lost} = await tx.query("UPDATE citta.actions SET state=CASE WHEN kind='CONSULT_AI' THEN 'unknown' ELSE 'failed' END,result=jsonb_build_object('ok',false,'unknown',kind='CONSULT_AI','error','Worker heartbeat expired; a new explicit request is required.'),finished_at=now() WHERE agent_id=$1 AND state='running' AND heartbeat_at<now()-interval '45 seconds' RETURNING id,goal_id,claim_token,started_at,state",[config.agentId]);
    for (const a of lost) {
      await tx.query('UPDATE citta.goals SET work_ms=work_ms+GREATEST(0,EXTRACT(epoch FROM (now()-$2::timestamptz))*1000)::bigint WHERE id=$1',[a.goal_id,a.started_at]);
      await tx.query('UPDATE citta.attempts SET state=$3,finished_at=now(),usage=$4 WHERE action_id=$1 AND claim_token=$2',[a.id,a.claim_token,a.state,JSON.stringify({usageUnknown:true})]);
      await resultObservation(tx,a.id,a.goal_id);
    }
    if (agent.control === 'running') {
      await deliverContact(tx,agent);
      const {rows:due}=await tx.query("SELECT g.*,o.kind AS origin_kind FROM citta.goals g JOIN citta.observations o ON o.id=g.observation_id WHERE g.agent_id=$1 AND g.state='waiting' AND g.due_at<=now() ORDER BY g.due_at LIMIT 10",[config.agentId]);
      for(const g of due) {
        await tx.query("INSERT INTO citta.observations(id,agent_id,conversation_id,source_key,kind,text,payload) VALUES($1,$2,$3,$4,'mental',$5,$6) ON CONFLICT(agent_id,source_key) DO NOTHING",[randomUUID(),config.agentId,g.conversation_id,`recall:${g.id}:${g.version}:${new Date(g.due_at).toISOString()}`,g.description,JSON.stringify({recallGoalId:g.id,version:g.version,originKind:g.origin_kind,dueAt:new Date(g.due_at).toISOString(),reminder:/^remind at /i.test(g.description)?g.summary:undefined})]);
        await tx.query('UPDATE citta.goals SET due_at=NULL WHERE id=$1',[g.id]);
      }
      // Include bounded heads of each class so a speech backlog cannot hide eligible continuations.
      const {rows:candidates}=await tx.query("SELECT candidate.* FROM (VALUES ('speech'),('result'),('recall'),('mental')) AS class(kind) CROSS JOIN LATERAL (SELECT * FROM citta.observations WHERE agent_id=$1 AND state='pending' AND not_before<=now() AND (CASE WHEN kind='speech' THEN 'speech' WHEN kind='result' THEN 'result' WHEN payload ? 'recallGoalId' THEN 'recall' ELSE 'mental' END)=class.kind ORDER BY created_at,id LIMIT 8) candidate",[config.agentId]);
      if(!candidates.length||agent.consecutive_user_turns>=3) {
        const internal=await internalObservation(tx,agent,files);
        if(internal)candidates.push(internal);
      }
      const attention=selectAttention(candidates.map(o=>({id:o.id,kind:o.kind,createdAt:new Date(o.created_at).toISOString(),dueAt:o.payload?.dueAt,continuation:o.kind==='result'||!!o.payload?.recallGoalId})),agent.consecutive_user_turns,new Date().toISOString());
      const selected=attention?candidates.find(o=>o.id===attention.selectedId):undefined;
      if (selected) {
        await event(tx,'attention',attention);
        if (selected.kind === 'result') await reviewResult(tx,agent,selected,attention||undefined);
        else {
          let goalId=randomUUID();
          if(selected.payload?.recallGoalId) {
            const {rows:[eligible]}=await tx.query("SELECT id FROM citta.goals WHERE id=$1 AND agent_id=$2 AND version=$3 AND state='waiting'",[selected.payload.recallGoalId,config.agentId,selected.payload.version]);
            if(!eligible) {
              await tx.query("UPDATE citta.observations SET state='consumed',consumed_at=now() WHERE id=$1",[selected.id]);
              await event(tx,'recall_noop',{observationId:selected.id,reason:'Commitment no longer eligible.'});
              await tx.query('INSERT INTO citta.operations(id,agent_id,result) VALUES($1,$2,$3)',[operationId,config.agentId,JSON.stringify({work:[],waiting:true})]);
              return {work:[],waiting:true};
            }
            goalId=eligible.id;
            await tx.query("UPDATE citta.goals SET state='active',wait_reason=NULL WHERE id=$1",[goalId]);
            await tx.query("UPDATE citta.frames SET state='suspended',version=version+1 WHERE agent_id=$1 AND state='foreground'",[config.agentId]);
            await tx.query("UPDATE citta.frames SET state='foreground',version=version+1 WHERE goal_id=$1",[goalId]);
          }
          const ctx = await context(tx,selected,goalId,agent);
          ctx.attention=attention||undefined;
          if(selected.payload?.recallGoalId)ctx.kind=selected.payload.originKind;
          if(selected.payload?.reminder)ctx.recallReason=selected.payload.reminder;
          ctx.availableSources=files;
          const local = ctx.kind === 'speech' ? considerLocal(ctx) : null;
          if(!selected.payload?.recallGoalId) {
            const transient=!!local&&!['READ','CONSULT_AI','WAIT','CLARIFY'].includes(local.action);
            const adopted=await newGoal(tx,selected,ctx,transient);
            if(!adopted) {
              await tx.query('INSERT INTO citta.operations(id,agent_id,result) VALUES($1,$2,$3)',[operationId,config.agentId,JSON.stringify({work:[],waiting:true})]);
              return {work:[],waiting:true};
            }
          }
          await applyDecision(tx,agent,ctx,local||{action:'INFER',text:'',reason:ctx.kind==='mental'?'A fresh internal topic needs contextual local cognition.':'Input is beyond sufficient local routines; seek a local cognitive proposal.',tone:'undetermined',evidenceIds:[],argument:ctx.text},'observation:'+selected.id);
          if (selected.payload?.motiveId) await tx.query('UPDATE citta.motive_contexts SET last_topic=$4 WHERE agent_id=$1 AND motive_id=$2 AND conversation_id=$3',[config.agentId,selected.payload.motiveId,selected.conversation_id,selected.text.slice(0,500)]);
        }
        await tx.query("UPDATE citta.observations SET state='consumed',consumed_at=now() WHERE id=$1 AND agent_id=$2",[selected.id,config.agentId]);
        await tx.query('UPDATE citta.agents SET domain_version=domain_version+1,consecutive_user_turns=$2 WHERE id=$1',[config.agentId,selected.kind==='speech'?agent.consecutive_user_turns+1:0]);
      }
    }
    const {rows:work} = agent.control === 'running' ? await tx.query("SELECT DISTINCT ON (a.kind) a.id,a.kind FROM citta.actions a JOIN citta.goals g ON g.id=a.goal_id WHERE a.agent_id=$1 AND a.state='queued' AND g.state NOT IN ('cancelled','completed','exhausted') AND NOT EXISTS(SELECT 1 FROM citta.actions busy WHERE busy.agent_id=a.agent_id AND busy.kind=a.kind AND busy.state='running') ORDER BY a.kind,CASE WHEN a.yields>=3 OR a.created_at<=now()-interval '1 minute' THEN 0 WHEN a.context->>'kind'='speech' THEN 1 ELSE 2 END,CASE WHEN a.yields>=3 OR a.created_at<=now()-interval '1 minute' THEN a.created_at END ASC,a.created_at DESC,a.id",[config.agentId]) : {rows:[]};
    const result = {work,waiting:!work.length};
    await tx.query('INSERT INTO citta.operations(id,agent_id,result) VALUES($1,$2,$3)',[operationId,config.agentId,JSON.stringify(result)]);
    return result as {work:{id:string;kind:Work['kind']}[];waiting:boolean;fenced?:boolean};
  });
}
async function resultObservation(tx: Tx, actionId: string, goalId: string) {
  const {rows:[goal]} = await tx.query('SELECT conversation_id FROM citta.goals WHERE id=$1 AND agent_id=$2',[goalId,config.agentId]);
  await tx.query("INSERT INTO citta.observations(id,agent_id,conversation_id,source_key,kind,text,payload) VALUES($1,$2,$3,$4,'result','Ability result available',$5) ON CONFLICT(agent_id,source_key) DO NOTHING",[randomUUID(),config.agentId,goal.conversation_id,'result:'+actionId,JSON.stringify({actionId})]);
}
export { resultObservation };
async function reviewResult(tx: Tx, agent: Row, observation: Row,attention?:AttentionSnapshot) {
  const {rows:[action]} = await tx.query('SELECT a.*,g.state AS goal_state,g.version AS current_goal_version,g.cycles FROM citta.actions a JOIN citta.goals g ON g.id=a.goal_id WHERE a.id=$1 AND a.agent_id=$2',[observation.payload.actionId,config.agentId]);
  if (!action || action.reviewed) return;
  await tx.query('UPDATE citta.actions SET reviewed=true WHERE id=$1',[action.id]);
  const outcome = action.result as Outcome;
  const ctx = (outcome.context||action.context) as Context;
  if(action.kind==='INFER'){ctx.inferenceAttention=(action.context as Context).attention;ctx.motiveSnapshot=(action.context as Context).motiveSnapshot;ctx.inferenceRequestId=action.id;}
  ctx.selectedObservationId=observation.id;
  ctx.attention=attention;
  if (['cancelled','completed','exhausted'].includes(action.goal_state) || action.goal_version!==action.current_goal_version || String(action.generation)!==String(agent.generation)) {
    await event(tx,'late_result',{actionId:action.id,goalId:action.goal_id,applied:false}); return;
  }
  await tx.query("UPDATE citta.frames SET state='suspended',version=version+1 WHERE agent_id=$1 AND state='foreground'",[config.agentId]);
  await tx.query("UPDATE citta.frames SET state='foreground',version=version+1 WHERE goal_id=$1",[action.goal_id]);
  await tx.query("UPDATE citta.goals SET state='active',wait_reason=NULL,updated_at=now() WHERE id=$1",[action.goal_id]);
  if (action.kind==='INFER' && outcome.ok && outcome.proposal) {
    ctx.proposal=outcome.proposal;
    const memoryIds=[...new Set([...ctx.evidence.filter(e=>e.origin==='memory').map(e=>e.id),...(ctx.preferences||[]).map(p=>p.memoryId)])];
    if(memoryIds.length) {
      const {rows:valid}=await tx.query('SELECT id FROM citta.memories WHERE agent_id=$1 AND (conversation_id=$2 OR conversation_id IS NULL) AND valid AND id=ANY($3::uuid[])',[config.agentId,ctx.conversationId,memoryIds]);
      const current=new Set(valid.map(m=>m.id));
      const invalid=memoryIds.filter(id=>!current.has(id)).sort();
      if(invalid.length) {
        ctx.invalidatedEvidenceIds=invalid;
        const reason='Saved context changed while local cognition was pending; reconsider against current scoped evidence.';
        await recordDecision(tx,ctx,{action:'RECONSIDER',text:'',reason,tone:'undetermined',evidenceIds:invalid},'result:'+action.id);
        const fresh=await context(tx,{id:ctx.observationId,conversation_id:ctx.conversationId,text:ctx.text,kind:ctx.kind,payload:{motive:ctx.motive,motiveSnapshot:ctx.motiveSnapshot}},ctx.goalId,agent);
        fresh.profile=ctx.profile;fresh.profileVersion=ctx.profileVersion;fresh.attention=attention;fresh.availableSources=ctx.availableSources;
        fresh.selectedObservationId=observation.id;
        fresh.evidence=[...new Map([...fresh.evidence,...ctx.evidence.filter(e=>e.origin==='ability')].map(e=>[e.id,e])).values()];
        try{await queue(tx,agent,fresh,'INFER',fresh.text);}catch(error){const failure=error instanceof Error?error.message:'Reconsideration could not continue.';if(ctx.kind!=='mental')await message(tx,ctx.conversationId,failure,ctx.goalId,ctx.observationId);await closeGoal(tx,ctx.goalId,'exhausted',failure);}
        await event(tx,'stale_context',{actionId:action.id,goalId:ctx.goalId,invalidatedEvidenceIds:invalid});return;
      }
    }
    let d: Decision;
    try {
      d = validateProposal(outcome.proposal,ctx);
      if (ctx.kind==='mental' && !['REFLECT','READ','WAIT','ADOPT_INTEREST','INITIATE','PROPOSE_IMPROVEMENT','CLARIFY'].includes(d.action)) throw Error('Internal turn proposed an ineligible action.');
    } catch (error) {
      const reason = error instanceof Error?error.message:'Invalid local proposal';
      await recordDecision(tx,ctx,{action:'CLARIFY',reason,tone:'undetermined',text:reason,evidenceIds:[]},'result:'+action.id);
      if (ctx.kind!=='mental') await message(tx,ctx.conversationId,'I could not safely apply the local proposal: '+reason,ctx.goalId,ctx.observationId);
      await closeGoal(tx,ctx.goalId,'exhausted',reason);
      return;
    }
    await applyDecision(tx,agent,ctx,d,'result:'+action.id);
    if (ctx.kind==='mental') await tx.query('UPDATE citta.motive_contexts c SET last_topic=$4 FROM citta.motives m WHERE c.agent_id=$1 AND c.conversation_id=$2 AND c.motive_id=m.id AND m.agent_id=c.agent_id AND m.name=$3',[config.agentId,ctx.conversationId,ctx.motive,(d.text||d.argument||d.reason).slice(0,500)]);
  } else {
    const review = reviewOutcome(action.kind,outcome);
    const content = outcome.ok ? (action.kind==='CONSULT_AI'?'Codex advice (unverified):\n\n':'Observed source content:\n\n')+(outcome.text||'') : review.reason;
    const source = action.kind==='CONSULT_AI'?'codex':action.kind==='READ'?'file':'local-cognition';
    if (outcome.ok) await tx.query('INSERT INTO citta.memories(id,agent_id,conversation_id,kind,content,source_id) VALUES($1,$2,$3,$4,$5,$6)',[randomUUID(),config.agentId,ctx.conversationId,action.kind==='CONSULT_AI'?'reported':'observed',(action.kind==='CONSULT_AI'?'Codex advice (unverified):\n\n':'Source '+action.argument+':\n\n')+(outcome.text||'').slice(0,16000),observation.id]);
    ctx.reviewedOutcome={kind:action.kind,outcome,observationId:observation.id};
    delete ctx.proposal;
    await recordDecision(tx,ctx,{action:'REVIEW',text:content,reason:review.reason,tone:outcome.ok?'neutral':'undetermined',evidenceIds:[observation.id],uncertainty:review.criterion==='unknown'?review.reason:''},'result:'+action.id);
    if (outcome.ok && ((action.kind==='READ' && !/^(?:read file|ဖိုင်ဖတ်ပါ)\s/iu.test(ctx.text)) || (action.kind==='CONSULT_AI' && !/^(?:ask|consult codex|codex ကိုမေးပါ)\s/iu.test(ctx.text)))) {
      ctx.evidence=[...ctx.evidence,{id:observation.id,kind:action.kind==='CONSULT_AI'?'reported' as const:'observed' as const,origin:'ability' as const,content:(action.kind==='CONSULT_AI'?'Unverified Codex advice: ':'Source '+action.argument+': ')+(outcome.text||'').slice(0,16000)}].slice(-16);
      delete ctx.reviewedOutcome;
      try {await queue(tx,agent,ctx,'INFER',ctx.text);} catch(error) {
        const reason=error instanceof Error?error.message:'Continuation was denied.';
        if(ctx.kind!=='mental')await message(tx,ctx.conversationId,'The source was read, but further interpretation stopped: '+reason,ctx.goalId,ctx.observationId);
        await closeGoal(tx,ctx.goalId,'exhausted',reason);
      }
      await event(tx,'continuation',{goalId:ctx.goalId,sourceId:observation.id});
      return;
    }
    if (ctx.kind!=='mental' || action.kind==='CONSULT_AI') await message(tx,ctx.conversationId,content,ctx.goalId,ctx.observationId,source);
    else await event(tx,'exploration_result',{goalId:ctx.goalId,text:content.slice(0,4000),source});
    await closeGoal(tx,ctx.goalId,review.state,review.reason);
  }
  await event(tx,'reviewed',{actionId:action.id,goalId:action.goal_id});
}
