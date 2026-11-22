import {codexAvailability} from '../codex/portal-client.ts';
import {mindStatus} from '../../modules/vithi/mind-status.ts';
import {activitySteps} from '../../modules/paccavekkhana/activity-steps.ts';
import { randomUUID, createHash } from 'node:crypto';
import { config } from '../../app/config.ts';
import { pool, transaction, lockAgent, event, type Tx } from './database.ts';
import {pauseCommitments,resumeCommitments} from './continuations.ts';
export class Conflict extends Error {}
export class Missing extends Error {}
export async function initialize() {
  await transaction(async tx=> {
    const body = JSON.stringify(config.profile);
    const version = createHash('sha256').update(config.agentId+'\n'+body).digest('hex');
    await tx.query('INSERT INTO citta.profiles(id,agent_id,body) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',[version,config.agentId,body]);
    await tx.query('INSERT INTO citta.agents(id,profile_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[config.agentId,version]);
    const agent = await lockAgent(tx);
    if (agent.profile_id !== version) {
      await tx.query('UPDATE citta.agents SET profile_id=$2,domain_version=domain_version+1 WHERE id=$1',[config.agentId,version]);
      await event(tx,'profile_changed',{version});
    }
    const motives = [
      ['understanding','configured-default','Explore permitted sources and understand how things work.'],
      ['reflection','configured-default','Consider grounded experience, alternative interpretations and possible improvements.'],
      ['connection','configured-default','Share an appropriate new idea or question in the local inbox.'],
      ...(config.profile.goals ? [['aspiration','configured-profile',config.profile.goals]] : [])
    ];
    for (const [name,origin,description] of motives) {
      await tx.query("INSERT INTO citta.motives(id,agent_id,name,origin,description) VALUES($1,$2,$3,$4,$5) ON CONFLICT(agent_id,name) DO UPDATE SET description=EXCLUDED.description,version=citta.motives.version+1 WHERE citta.motives.origin='configured-profile' AND EXCLUDED.origin='configured-profile' AND citta.motives.description IS DISTINCT FROM EXCLUDED.description",[randomUUID(),config.agentId,name,origin,description]);
    }
  });
}
async function wake(tx: Tx) { await tx.query('INSERT INTO citta.outbox(id,agent_id) VALUES($1,$2)',[randomUUID(),config.agentId]); }
export async function ingest(conversationId: string, messageId: string, text: string, replyToContactId?:string,continuation?:{goalId:string;version:number},replyToMessageId?:string) {
  return transaction(async tx=> {
    const agent=await lockAgent(tx);
    const {rows:[old]} = await tx.query('SELECT * FROM citta.observations WHERE agent_id=$1 AND source_key=$2',[config.agentId,'operator:'+messageId]);
    const requestHash=createHash('sha256').update(JSON.stringify({conversationId,text,replyToContactId:replyToContactId||null,continuation:continuation?{goalId:continuation.goalId,version:continuation.version}:null,replyToMessageId:replyToMessageId||null})).digest('hex');
    if (old) {
      const same=old.payload.requestHash?old.payload.requestHash===requestHash:
        old.text===text&&old.conversation_id===conversationId&&old.payload.replyToContactId===replyToContactId&&old.payload.continuationGoalId===continuation?.goalId&&old.payload.continuationVersion===continuation?.version&&old.payload.replyToMessageId===replyToMessageId;
      if(!same)throw new Conflict('Message key already belongs to different input.');
      return {observationId:old.id,state:old.state,duplicate:true};
    }
    if(replyToMessageId&&(replyToContactId||continuation))throw new Conflict('Choose one reply target.');
    const {rows:[conversation]} = await tx.query('SELECT agent_id FROM citta.conversations WHERE id=$1',[conversationId]);
    if (conversation && conversation.agent_id !== config.agentId) throw new Missing('Conversation not found.');
    await tx.query('INSERT INTO citta.conversations(id,agent_id,title) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',[conversationId,config.agentId,text.slice(0,70)]);
    const payload:Record<string,unknown>={requestHash,...(replyToContactId?{replyToContactId}:{})};
    let parentMessageId=replyToMessageId;
    if(replyToMessageId){
      const {rows:[parent]}=await tx.query("SELECT m.id,m.role,m.text,m.goal_id,m.contact_id,m.initiative,g.version,g.state,g.wait_reason,NOT EXISTS(SELECT 1 FROM citta.messages n WHERE n.agent_id=m.agent_id AND n.conversation_id=m.conversation_id AND n.goal_id=m.goal_id AND n.role='citta' AND n.ordinal>m.ordinal) AS latest_question FROM citta.messages m LEFT JOIN citta.goals g ON g.id=m.goal_id AND g.agent_id=m.agent_id WHERE m.id=$1 AND m.agent_id=$2 AND m.conversation_id=$3",[replyToMessageId,config.agentId,conversationId]);
      if(!parent)throw new Missing('Reply message not found in this conversation.');
      payload.replyToMessageId=parent.id;
      payload.replyToMessage={id:parent.id,role:parent.role,text:parent.text.slice(0,2000)};
      if(parent.initiative&&parent.contact_id)replyToContactId=parent.contact_id;
      if(parent.role==='citta'&&parent.latest_question&&parent.state==='waiting'&&['operator_input','evidence_or_operator_input'].includes(parent.wait_reason))continuation={goalId:parent.goal_id,version:parent.version};
    }
    if(continuation){
      const {rows:[goal]}=await tx.query('SELECT id,conversation_id,version,state,wait_reason,description FROM citta.goals WHERE id=$1 AND agent_id=$2',[continuation.goalId,config.agentId]);
      if(!goal||goal.conversation_id!==conversationId)throw new Missing('Activity not found in this conversation.');
      if(goal.version!==continuation.version||goal.state!=='waiting'||!['operator_input','evidence_or_operator_input'].includes(goal.wait_reason))throw new Conflict('This activity no longer expects that reply. Refresh its current state.');
      const {rows:[pending]}=await tx.query("SELECT id FROM citta.observations WHERE agent_id=$1 AND state='pending' AND payload->>'continuationGoalId'=$2 LIMIT 1",[config.agentId,goal.id]);
      if(pending)throw new Conflict('A reply for this activity is already waiting to be processed.');
      Object.assign(payload,{continuationGoalId:goal.id,continuationVersion:goal.version,originalTask:goal.description});
      if(!parentMessageId){
        const {rows:[question]}=await tx.query("SELECT id,role,text,initiative,contact_id FROM citta.messages WHERE agent_id=$1 AND conversation_id=$2 AND goal_id=$3 AND role='citta' ORDER BY ordinal DESC LIMIT 1",[config.agentId,conversationId,goal.id]);
        if(question){parentMessageId=question.id;payload.replyToMessage={id:question.id,role:question.role,text:question.text.slice(0,2000)};if(question.initiative&&question.contact_id)replyToContactId=question.contact_id;}
      }
    }
    const id = randomUUID();
    if(replyToContactId)payload.replyToContactId=replyToContactId;
    if(replyToContactId) {
      const {rows:[contact]}=await tx.query('SELECT id FROM citta.contacts WHERE id=$1 AND agent_id=$2 AND conversation_id=$3',[replyToContactId,config.agentId,conversationId]);
      if(!contact)throw new Missing('The referenced contact is outside this conversation.');
    }
    await tx.query("INSERT INTO citta.observations(id,agent_id,conversation_id,source_key,kind,text,payload) VALUES($1,$2,$3,$4,'speech',$5,$6)",[id,config.agentId,conversationId,'operator:'+messageId,text,JSON.stringify(payload)]);
    await tx.query("INSERT INTO citta.messages(id,agent_id,conversation_id,role,text,observation_id,source,reply_to_message_id,goal_id) VALUES($1,$2,$3,'operator',$4,$5,'operator',$6,$7)",[randomUUID(),config.agentId,conversationId,text,id,parentMessageId||null,continuation?.goalId||null]);
    if(replyToContactId) {
      await tx.query("UPDATE citta.messages SET contact_state='answered' WHERE agent_id=$1 AND contact_id=$2 AND initiative AND contact_state IN ('created','delivered','seen')",[config.agentId,replyToContactId]);
      await tx.query("UPDATE citta.contacts SET state='answered' WHERE agent_id=$1 AND id=$2 AND state IN ('delivered','seen')",[config.agentId,replyToContactId]);
    }
    await event(tx,'accepted',{observationId:id,conversationId,messageId}); await wake(tx);
    // Exact operator directives are controls, not model interpretation. They remain usable while paused.
    const directive=/^\/(pause|resume|stop|quiet|unquiet)$/i.exec(text);
    if(directive) {
      const op=directive[1].toLowerCase();
      const mode=op==='pause'?'paused':op==='resume'?'running':op==='stop'?'stopped':agent.control;
      const quiet=op==='quiet'?true:op==='unquiet'?false:agent.quiet;
      if(op==='pause')await pauseCommitments(tx);
      if(op==='resume')await resumeCommitments(tx);
      if(op==='stop') {
        await tx.query("UPDATE citta.goals SET state='cancelled',version=version+1,updated_at=now() WHERE agent_id=$1 AND state NOT IN ('completed','cancelled')",[config.agentId]);
        await tx.query("UPDATE citta.frames SET state='closed',version=version+1 WHERE agent_id=$1 AND state<>'closed'",[config.agentId]);
        await tx.query("UPDATE citta.actions SET state='cancelled',finished_at=now() WHERE agent_id=$1 AND state='queued'",[config.agentId]);
        await tx.query("UPDATE citta.observations SET state='cancelled',consumed_at=now() WHERE agent_id=$1 AND state='pending' AND kind<>'result' AND id<>$2",[config.agentId,id]);
      }
      await tx.query('UPDATE citta.agents SET control=$2,quiet=$3,control_version=control_version+1,domain_version=domain_version+1 WHERE id=$1',[config.agentId,mode,quiet]);
      await tx.query("UPDATE citta.observations SET state='consumed',consumed_at=now() WHERE id=$1",[id]);
      await tx.query("INSERT INTO citta.messages(id,agent_id,conversation_id,role,text,observation_id,source) VALUES($1,$2,$3,'system',$4,$5,'control')",[randomUUID(),config.agentId,conversationId,`Control applied: ${op}. ${op==='stop'?'Existing commitments cancelled; in-flight effects may still finish.':''}`,id]);
      await event(tx,'control',{operation:op,control:mode,quiet,controlVersion:agent.control_version+1});
      return {observationId:id,state:'consumed',duplicate:false};
    }
    return {observationId:id,state:'pending',duplicate:false};
  });
}
export type ControlRequest = {requestId:string;operation:'pause'|'resume'|'stop'|'cancel'|'extend'|'quiet'|'unquiet';goalId?:string;expectedVersion:number};
export async function control(request: ControlRequest) {
  return transaction(async tx=> {
    const agent = await lockAgent(tx);
    const {rows:[old]} = await tx.query('SELECT request,result FROM citta.controls WHERE id=$1 AND agent_id=$2',[request.requestId,config.agentId]);
    if (old) {
      if (JSON.stringify(old.request) !== JSON.stringify(JSON.parse(JSON.stringify(request)))) {
        // JSONB normalizes key order; compare values, not serialization order.
        const same = ['requestId','operation','goalId','expectedVersion'].every(k=>old.request[k] === request[k as keyof ControlRequest]);
        if (!same) throw new Conflict('Control key belongs to different arguments.');
      }
      return old.result;
    }
    if (agent.control_version !== request.expectedVersion) throw new Conflict('Control state changed. Refresh before retrying.');
    const op = request.operation;
    if(op==='pause')await pauseCommitments(tx);
    if(op==='resume')await resumeCommitments(tx);
    if(op==='extend') {
      if(!request.goalId)throw new Conflict('Choose an exhausted goal to extend.');
      const {rows:[unknown]}=await tx.query("SELECT id FROM citta.actions WHERE goal_id=$1 AND agent_id=$2 AND state='unknown' LIMIT 1",[request.goalId,config.agentId]);
      if(unknown)throw new Conflict('An unknown external effect must be reconciled; a budget extension cannot redispatch it.');
      const {rowCount}=await tx.query("UPDATE citta.goals SET budget_cycles=budget_cycles+12,budget_adviser=budget_adviser+2,budget_ms=budget_ms+300000,state='waiting',version=version+1,due_at=now(),wait_reason='explicit budget extension',updated_at=now() WHERE id=$1 AND agent_id=$2 AND state='exhausted'",[request.goalId,config.agentId]);
      if(!rowCount)throw new Conflict('Only an exhausted goal can receive a budget extension.');
      await tx.query("UPDATE citta.frames SET state='waiting',version=version+1 WHERE goal_id=$1 AND agent_id=$2",[request.goalId,config.agentId]);
    }
    if (op === 'cancel') {
      if (!request.goalId) throw new Conflict('Choose the specific goal to cancel.');
      const {rowCount} = await tx.query("UPDATE citta.goals SET state='cancelled',version=version+1,updated_at=now() WHERE agent_id=$1 AND id=$2 AND state NOT IN ('completed','cancelled')",[config.agentId,request.goalId]);
      if (!rowCount) throw new Missing('Eligible goal not found.');
      await tx.query("UPDATE citta.frames SET state='closed',version=version+1,updated_at=now() WHERE agent_id=$1 AND goal_id=$2",[config.agentId,request.goalId]);
      await tx.query("UPDATE citta.actions SET state='cancelled',finished_at=now() WHERE agent_id=$1 AND goal_id=$2 AND state='queued'",[config.agentId,request.goalId]);
    }
    if (op === 'stop') {
      await tx.query("UPDATE citta.goals SET state='cancelled',version=version+1,updated_at=now() WHERE agent_id=$1 AND state NOT IN ('completed','cancelled')",[config.agentId]);
      await tx.query("UPDATE citta.frames SET state='closed',version=version+1 WHERE agent_id=$1 AND state<>'closed'",[config.agentId]);
      await tx.query("UPDATE citta.actions SET state='cancelled',finished_at=now() WHERE agent_id=$1 AND state='queued'",[config.agentId]);
      await tx.query("UPDATE citta.observations SET state='cancelled',consumed_at=now() WHERE agent_id=$1 AND state='pending' AND kind<>'result'",[config.agentId]);
    }
    const mode = op === 'pause' ? 'paused' : op === 'stop' ? 'stopped' : op === 'resume' ? 'running' : agent.control;
    const quiet = op === 'quiet' ? true : op === 'unquiet' ? false : agent.quiet;
    if(mode==='paused'&&op==='extend')await pauseCommitments(tx);
    await tx.query('UPDATE citta.agents SET control=$2,quiet=$3,control_version=control_version+1,domain_version=domain_version+1 WHERE id=$1',[config.agentId,mode,quiet]);
    const result = {operation:op,control:mode,quiet,controlVersion:agent.control_version+1};
    await tx.query('INSERT INTO citta.controls(id,agent_id,request,result) VALUES($1,$2,$3,$4)',[request.requestId,config.agentId,JSON.stringify(request),JSON.stringify(result)]);
    await event(tx,'control',result); await wake(tx); return result;
  });
}
const conversationMessageFields=`m.id,m.ordinal,m.role,m.text,m.source,m.goal_id,m.observation_id,m.initiative,m.contact_state,m.contact_id,m.created_at,m.reply_to_message_id,
 CASE WHEN p.id IS NOT NULL THEN jsonb_build_object('id',p.id,'role',p.role,'text',left(p.text,400)) ELSE NULL END AS reply_to,
 (m.role='citta' AND g.state='waiting' AND g.wait_reason IN ('operator_input','evidence_or_operator_input') AND NOT EXISTS(SELECT 1 FROM citta.messages n WHERE n.agent_id=m.agent_id AND n.conversation_id=m.conversation_id AND n.goal_id=m.goal_id AND n.role='citta' AND n.ordinal>m.ordinal)) AS needs_reply`;
const conversationMessageJoins=`LEFT JOIN citta.messages p ON p.id=m.reply_to_message_id AND p.agent_id=m.agent_id AND p.conversation_id=m.conversation_id LEFT JOIN citta.goals g ON g.id=m.goal_id AND g.agent_id=m.agent_id`;
export async function getState(conversationId?: string) {
  const provider=await codexAvailability();
  const agentId = config.agentId;
  return transaction(async tx=> {
  await tx.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
  const [{rows:[agent]}, {rows:conversations}, {rows:messages}, {rows:goals}, {rows:motives}, {rows:appraisals}, {rows:proposals}, {rows:events}, {rows:actions}, {rows:memories}, {rows:thoughts}, {rows:[pending]}, {rows:[focus]}] = await Promise.all([
    tx.query("SELECT id,profile_id,control,control_version,quiet,domain_version,heartbeat_at,next_internal_at,work_used,budget_hour,now() AS observed_at,date_trunc('hour',now()) AS current_budget_hour FROM citta.agents WHERE id=$1",[agentId]),
    tx.query('SELECT id,title,created_at FROM citta.conversations WHERE agent_id=$1 ORDER BY created_at DESC LIMIT 50',[agentId]),
    tx.query(`SELECT ${conversationMessageFields} FROM (SELECT * FROM citta.messages WHERE agent_id=$1 AND ($2::uuid IS NULL OR conversation_id=$2) ORDER BY ordinal DESC LIMIT 200) m ${conversationMessageJoins} ORDER BY m.ordinal`,[agentId,conversationId||null]),
    tx.query("SELECT * FROM ((SELECT id,conversation_id,description,criterion,state,version,cycles,summary,wait_reason,due_at,created_at FROM citta.goals WHERE agent_id=$1 AND state NOT IN ('completed','cancelled','exhausted') ORDER BY created_at DESC LIMIT 50) UNION ALL (SELECT id,conversation_id,description,criterion,state,version,cycles,summary,wait_reason,due_at,created_at FROM citta.goals WHERE agent_id=$1 AND state IN ('completed','cancelled','exhausted') ORDER BY created_at DESC LIMIT 50)) g ORDER BY created_at DESC",[agentId]),
    tx.query('SELECT m.id,m.name,m.origin,m.description,c.last_topic,m.turns,m.enabled,m.conversation_id,m.source_observation_id,m.evidence_ids,c.next_eligible_at FROM citta.motives m LEFT JOIN citta.motive_contexts c ON c.agent_id=m.agent_id AND c.motive_id=m.id AND c.conversation_id=$2 WHERE m.agent_id=$1 AND ($2::uuid IS NULL OR m.conversation_id=$2 OR m.conversation_id IS NULL) ORDER BY m.name',[agentId,conversationId||null]),
    tx.query('SELECT tone,cause,uncertainty,tendency,candidate,regulation,created_at FROM citta.appraisals WHERE agent_id=$1 ORDER BY created_at DESC LIMIT 10',[agentId]),
    tx.query('SELECT id,description,evidence_ids,benefit,scope,criteria,risks,state,version,created_at FROM citta.proposals WHERE agent_id=$1 ORDER BY created_at DESC LIMIT 20',[agentId]),
    tx.query('SELECT ordinal,kind,body,created_at FROM citta.events WHERE agent_id=$1 ORDER BY ordinal DESC LIMIT 60',[agentId]),
    tx.query("SELECT id,goal_id,kind,state,started_at,finished_at,context->'motiveSnapshot'->>'name' AS motive FROM citta.actions WHERE agent_id=$1 AND (state IN ('queued','running','unknown') OR finished_at>now()-interval '5 minutes') ORDER BY created_at DESC LIMIT 30",[agentId]),
    tx.query('SELECT id,kind,content,source_id,supersedes,valid,created_at FROM citta.memories WHERE agent_id=$1 AND ($2::uuid IS NULL OR conversation_id=$2 OR conversation_id IS NULL) ORDER BY created_at DESC LIMIT 60',[agentId,conversationId||null]),
    tx.query("SELECT id,goal_id,snapshot->>'conversationId' AS conversation_id,decision->>'action' AS action,decision->>'text' AS text,created_at FROM citta.decisions WHERE agent_id=$1 AND snapshot->>'kind'='mental' AND decision->>'action'<>'INFER' ORDER BY created_at DESC LIMIT 10",[agentId]),
    tx.query("SELECT count(*)::int AS count FROM citta.observations WHERE agent_id=$1 AND state='pending' AND not_before<=now()",[agentId]),
    tx.query("SELECT id,topic,state,turns,last_outcome,next_step,reason,source_goal_id,source_memory_id,source_observation_id,conversation_id,updated_at FROM citta.focuses WHERE agent_id=$1 ORDER BY (state='active') DESC,updated_at DESC,id LIMIT 1",[agentId])
  ]);
  if (!agent) throw new Missing('Agent has not been initialized.');
  const observedAt=new Date(agent.observed_at).toISOString();
  const used=new Date(agent.budget_hour).getTime()<new Date(agent.current_budget_hour).getTime()?0:Number(agent.work_used);
  const mind=mindStatus({control:agent.control,enabled:config.cognitionEnabled,providerReady:provider.ready,providerReason:provider.reason,providerProgress:provider.activeTurns,runnerReady:!!agent.heartbeat_at&&Date.parse(observedAt)-new Date(agent.heartbeat_at).getTime()<15000,workUsed:used,hourlyLimit:config.hourlyWorkLimit,actions,pendingInputs:pending.count,enabledMotives:motives.filter(m=>m.enabled).length,now:observedAt});
  return {agent,mind,focus:focus||null,profile:{name:config.profile.name},conversations,messages,goals,motives,appraisals,proposals,memories,thoughts,events:events.reverse(),actions};
  });
}
export async function eventsAfter(after: string) {
  return (await pool.query('SELECT ordinal,kind,body,created_at FROM citta.events WHERE agent_id=$1 AND ordinal>$2::bigint ORDER BY ordinal LIMIT 200',[config.agentId,after])).rows;
}
export async function markSeen(conversationId: string) {
  return transaction(async tx=> {
    await lockAgent(tx);
    await tx.query("UPDATE citta.messages SET contact_state='seen' WHERE agent_id=$1 AND conversation_id=$2 AND initiative AND contact_state IN ('created','delivered')",[config.agentId,conversationId]);
    await tx.query("UPDATE citta.contacts SET state='seen' WHERE agent_id=$1 AND conversation_id=$2 AND state='delivered'",[config.agentId,conversationId]);
  });
}
export async function declineContact(id:string) {
  return transaction(async tx=> {
    await lockAgent(tx);
    const {rowCount}=await tx.query("UPDATE citta.contacts SET state='declined' WHERE id=$1 AND agent_id=$2",[id,config.agentId]);
    if(!rowCount)throw new Missing('Contact not found.');
    await tx.query("UPDATE citta.messages SET contact_state='declined' WHERE contact_id=$1 AND agent_id=$2",[id,config.agentId]);
    const {rows:questions}=await tx.query("UPDATE citta.goals g SET state='cancelled',version=version+1,summary='The operator declined this question.',updated_at=now() FROM citta.contacts c,citta.observations o WHERE c.id=$1 AND c.agent_id=$2 AND g.id=c.goal_id AND g.agent_id=c.agent_id AND o.id=g.observation_id AND o.agent_id=g.agent_id AND o.kind='mental' AND g.state='waiting' AND g.wait_reason IN ('contact_delivery','operator_input') RETURNING g.id",[id,config.agentId]);
    for(const goal of questions)await tx.query("UPDATE citta.frames SET state='closed',version=version+1 WHERE goal_id=$1 AND agent_id=$2",[goal.id,config.agentId]);
    await event(tx,'contact_declined',{contactId:id});return {ok:true};
  });
}
export async function messageHistory(conversationId:string,before:string) {
  const {rows}=await pool.query(`SELECT ${conversationMessageFields} FROM (SELECT * FROM citta.messages WHERE agent_id=$1 AND conversation_id=$2 AND ordinal<$3::bigint ORDER BY ordinal DESC LIMIT 100) m ${conversationMessageJoins} ORDER BY m.ordinal`,[config.agentId,conversationId,before]);
  return {messages:rows};
}
export interface ProposalReviewRequest {requestId:string;proposalId:string;expectedVersion:number;decision:'accepted'|'declined'}
export async function reviewProposal(request:ProposalReviewRequest) {
  return transaction(async tx=> {
    await lockAgent(tx);
    const {rows:[previous]}=await tx.query('SELECT request,result FROM citta.proposal_reviews WHERE id=$1 AND agent_id=$2',[request.requestId,config.agentId]);
    if(previous) {
      if(!(['requestId','proposalId','expectedVersion','decision'] as const).every(key=>previous.request[key]===request[key]))throw new Conflict('Review key belongs to different proposal arguments.');
      return previous.result;
    }
    const {rows:[proposal]}=await tx.query('SELECT id,state,version FROM citta.proposals WHERE id=$1 AND agent_id=$2 FOR UPDATE',[request.proposalId,config.agentId]);
    if(!proposal)throw new Missing('Proposal not found.');
    if(proposal.version!==request.expectedVersion||proposal.state!=='proposed')throw new Conflict('Proposal changed or is no longer awaiting review.');
    await tx.query('UPDATE citta.proposals SET state=$2,version=version+1 WHERE id=$1',[proposal.id,request.decision]);
    const result={proposalId:proposal.id,state:request.decision,version:proposal.version+1,executionAuthorized:false};
    await tx.query('INSERT INTO citta.proposal_reviews(id,agent_id,proposal_id,request,result) VALUES($1,$2,$3,$4,$5)',[request.requestId,config.agentId,proposal.id,JSON.stringify(request),JSON.stringify(result)]);
    await tx.query('UPDATE citta.agents SET domain_version=domain_version+1 WHERE id=$1',[config.agentId]);
    await event(tx,'proposal_reviewed',result);return result;
  });
}
export async function replyToGoal(goalId:string,version:number,messageId:string,text:string){
 const {rows:[goal]}=await pool.query('SELECT conversation_id FROM citta.goals WHERE id=$1 AND agent_id=$2',[goalId,config.agentId]);
 if(!goal)throw new Missing('Activity not found.');
 return ingest(goal.conversation_id,messageId,text,undefined,{goalId,version});
}
export async function goalDetail(id:string) {
  return transaction(async tx=> {
    await tx.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const {rows:[goal]}=await tx.query('SELECT * FROM citta.goals WHERE id=$1 AND agent_id=$2',[id,config.agentId]);
    if(!goal)throw new Missing('Goal not found.');
    const [{rows:[frame]},{rows:versions},{rows:transitions},{rows:decisions},{rows:actions}]=await Promise.all([
      tx.query('SELECT state,version,checkpoint,parent_goal_id,continuation_depth,updated_at FROM citta.frames WHERE goal_id=$1 AND agent_id=$2',[id,config.agentId]),
      tx.query('SELECT version,snapshot,created_at FROM citta.goal_versions WHERE goal_id=$1 AND agent_id=$2 ORDER BY version DESC',[id,config.agentId]),
      tx.query('SELECT ordinal,version,previous_state,state,reason,created_at FROM citta.goal_transitions WHERE goal_id=$1 AND agent_id=$2 ORDER BY ordinal DESC',[id,config.agentId]),
      tx.query('SELECT id,sequence,engine,policy,snapshot,decision,created_at FROM citta.decisions WHERE goal_id=$1 AND agent_id=$2 ORDER BY sequence DESC NULLS LAST,created_at DESC',[id,config.agentId]),
      tx.query('SELECT id,kind,goal_version,state,result,reviewed,attempts,yields,created_at,started_at,finished_at FROM citta.actions WHERE goal_id=$1 AND agent_id=$2 ORDER BY created_at DESC',[id,config.agentId])
    ]);
    return {goal,frame,versions,transitions,decisions,actions,steps:activitySteps(decisions,actions)};
  });
}
