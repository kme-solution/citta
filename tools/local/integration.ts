import assert from 'node:assert/strict';
import pg from 'pg';
import {randomUUID} from 'node:crypto';
import {spawn,execFile,type ChildProcess} from 'node:child_process';
import {promisify} from 'node:util';
import {createWriteStream} from 'node:fs';
import {mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {setTimeout as delay} from 'node:timers/promises';
import {Connection,Client} from '@temporalio/client';
import {Worker} from '@temporalio/worker';
import {replayDecision,type RecordedDecision} from '../../src/modules/vithi/replay.ts';
import {replayContinuity} from '../../src/modules/vithi/continuity-replay.ts';
import {replayContact} from '../../src/modules/vithi/contact-policy.ts';
const source=process.env.CITTA_DATABASE_URL||process.env.DATABASE_URL;
if(!source)throw Error('Configure a local PostgreSQL connection first.');
const dbName=process.env.CITTA_TEST_DATABASE||'citta_agent_test';
if(!/^citta_[a-z0-9_]*_test$/.test(dbName))throw Error('Integration database must be an explicitly test-owned citta_*_test name.');
const admin=new pg.Client({connectionString:source});await admin.connect();
try{if(!(await admin.query('SELECT 1 FROM pg_database WHERE datname=$1',[dbName])).rows.length)await admin.query(`CREATE DATABASE "${dbName}"`);}finally{await admin.end();}
const url=new URL(source);url.pathname='/'+dbName;
const agent='test-'+randomUUID().slice(0,8);
const port=4175;
const env={...process.env,CITTA_DATABASE_URL:url.toString(),CITTA_AGENT_ID:agent,CITTA_PORT:String(port),CITTA_COGNITION_ENABLED:'false',CITTA_ADVISER_ENABLED:'false',CITTA_INTERNAL_INTERVAL_MS:'10000',CITTA_COMPUTER_ENABLED:'false',CITTA_CODEX_TRANSPORT:'exec'};
const exec=promisify(execFile);
await exec(process.execPath,['--import','tsx','tools/local/migrate.ts'],{env});
await mkdir('.local/state',{recursive:true});
const log=createWriteStream('.local/state/integration.log',{flags:'w'});
const children:ChildProcess[]=[];
const db=new pg.Client({connectionString:url.toString()});await db.connect();
const connection=await Connection.connect({address:process.env.CITTA_TEMPORAL_ADDRESS||'127.0.0.1:7233'});
const temporal=new Client({connection,namespace:process.env.CITTA_TEMPORAL_NAMESPACE||'default'});
const base='http://127.0.0.1:'+port;
async function request(path:string,body?:unknown) {
  const response=await fetch(base+path,body===undefined?{}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  const data=await response.json();return {status:response.status,data};
}
async function until<T>(read:()=>Promise<T>,predicate:(value:T)=>boolean,timeout=20000):Promise<T> {
  const end=Date.now()+timeout;let value:T;
  do{try{value=await read();if(predicate(value))return value;}catch{}await delay(200);}while(Date.now()<end);
  throw Error('Timed out waiting for an observed integration outcome. Inspect .local/state/integration.log.');
}
const conversationId=randomUUID();
const state=async()=>(await request('/api/state?conversationId='+conversationId)).data;
let checks=0;
function passed(name:string){checks++;console.log('PASS '+name);}
async function recordedProposal(action:string,text:string,options:Record<string,any>={}) {
  // Recorded outcome fixtures exercise policy/state boundaries only. They do not stand in for live model acceptance.
  const input=randomUUID(),goal=randomUUID(),id=randomUUID();
  const owner=(await db.query('SELECT a.profile_id,a.generation,a.control_version,p.body AS profile FROM citta.agents a JOIN citta.profiles p ON p.id=a.profile_id WHERE a.id=$1',[agent])).rows[0];
  const context={observationId:input,conversationId,text:'Test-owned recorded proposal boundary',kind:options.kind||'speech',profile:owner.profile,profileVersion:owner.profile_id,controlVersion:owner.control_version,goalId:goal,evidence:options.evidence||[{id:input,kind:'reported',origin:'observation',content:'Test-owned operator statement'}],recent:[],recordedAt:new Date().toISOString()};
  const proposal={action,text,reason:'Test-owned recorded proposal for an independently checked boundary.',evidenceIds:options.evidenceIds||context.evidence.map((e:any)=>e.id),tone:'neutral',uncertainty:'',argument:options.argument||'',candidateTendency:'investigate',chosenTendency:'hold',regulationReason:'Policy remains independent.',alternatives:[],...options.proposal};
  await db.query('BEGIN');
  try {
    await db.query("INSERT INTO citta.observations(id,agent_id,conversation_id,source_key,kind,text,state) VALUES($1,$2,$3,$4,$5,'Test-owned recorded cognition input','consumed')",[input,agent,conversationId,'recorded:'+input,context.kind]);
    await db.query("INSERT INTO citta.goals(id,agent_id,conversation_id,observation_id,description,criterion,state,cycles,work_ms) VALUES($1,$2,$3,$4,'Test-owned recorded cognition boundary','Apply policy, preserve lineage, never invent success','waiting',$5,$6)",[goal,agent,conversationId,input,options.cycles||0,options.workMs||0]);
    await db.query("INSERT INTO citta.frames(goal_id,agent_id,state) VALUES($1,$2,'waiting')",[goal,agent]);
    await db.query("INSERT INTO citta.actions(id,agent_id,goal_id,goal_version,kind,argument,context,generation,control_version,state,result,finished_at) VALUES($1,$2,$3,1,'INFER','test-only recorded response',$4,$5,$6,'succeeded',$7,now())",[id,agent,goal,JSON.stringify(context),owner.generation,owner.control_version,JSON.stringify({ok:true,proposal,context,usage:{recordedTestFixture:true}})]);
    await db.query("INSERT INTO citta.observations(id,agent_id,conversation_id,source_key,kind,text,payload) VALUES($1,$2,$3,$4,'result','Test-owned recorded cognition result',$5)",[randomUUID(),agent,conversationId,'result:'+id,JSON.stringify({actionId:id,recordedTestFixture:true})]);
    await db.query('COMMIT');
  }catch(e){await db.query('ROLLBACK');throw e;}
  return {goal,action:id,input};
}
try {
  for(const app of ['server','worker','relay']){const child=spawn(process.execPath,['--import','tsx',`src/app/${app}.ts`],{env,stdio:['ignore','pipe','pipe']});child.stdout?.pipe(log,{end:false});child.stderr?.pipe(log,{end:false});children.push(child);}
  await until(()=>request('/api/health'),r=>r.status===200&&r.data.runner==='ready');
  const messageId=randomUUID();
  const note={conversationId,messageId,text:'remember integration evidence: actual durable record'};
  assert.equal((await request('/api/messages',note)).status,202);
  assert.equal((await request('/api/messages',note)).data.duplicate,true);
  assert.equal((await request('/api/messages',{...note,text:'different payload'})).status,409);
  let snapshot=await until(state,s=>s.messages.some((m:any)=>m.text.startsWith('Saved as')));
  const count=await db.query('SELECT count(*)::int n FROM citta.observations WHERE agent_id=$1 AND source_key=$2',[agent,'operator:'+messageId]);assert.equal(count.rows[0].n,1);passed('durable ingress, deduplication and conflicting reuse');
  const memory=snapshot.memories.find((m:any)=>m.content.includes('actual durable record'));
  await request('/api/messages',{conversationId,messageId:randomUUID(),text:`Correct saved note ${memory.id}: corrected integration evidence`});
  snapshot=await until(state,s=>s.memories.some((m:any)=>m.supersedes===memory.id));assert.equal(snapshot.memories.find((m:any)=>m.id===memory.id).valid,false);passed('sourced memory correction retains original lineage');
  await request('/api/messages',{conversationId,messageId:randomUUID(),text:'recall'});
  await until(state,s=>s.messages.some((m:any)=>m.source==='memory'&&m.text.includes('corrected integration evidence')));passed('real scoped memory readback');
  const controlVersion=snapshot.agent.control_version;
  assert.equal((await request('/api/control',{requestId:randomUUID(),operation:'pause',expectedVersion:controlVersion})).status,200);
  assert.equal((await request('/api/control',{requestId:randomUUID(),operation:'resume',expectedVersion:controlVersion})).status,409);
  const greetingId=randomUUID();await request('/api/messages',{conversationId,messageId:greetingId,text:'Hello'});await delay(1200);
  let obs=await db.query('SELECT state FROM citta.observations WHERE agent_id=$1 AND source_key=$2',[agent,'operator:'+greetingId]);assert.equal(obs.rows[0].state,'pending');
  await request('/api/messages',{conversationId,messageId:randomUUID(),text:'/resume'});
  await until(async()=>(await db.query('SELECT state FROM citta.observations WHERE agent_id=$1 AND source_key=$2',[agent,'operator:'+greetingId])).rows[0],r=>r.state==='consumed');passed('pause persists input, stale controls reject and exact resume remains available');
  await request('/api/messages',{conversationId,messageId:randomUUID(),text:'read file deployment-notes.txt'});
  await until(state,s=>s.messages.some((m:any)=>m.source==='file'&&m.text.includes('one engineer for two working days')));passed('actual permitted file read and observed output');
  await request('/api/messages',{conversationId,messageId:randomUUID(),text:'read file ../../.env'});
  await until(state,s=>s.messages.some((m:any)=>m.text.includes('outside the permitted')));passed('path traversal denied without exposing private configuration');
  const due=new Date(Date.now()+2500).toISOString();await request('/api/messages',{conversationId,messageId:randomUUID(),text:`remind at ${due} integration reminder`});
  await until(state,s=>s.messages.some((m:any)=>m.text==='Reminder: integration reminder'));passed('durable timer recall delivers a real scheduled reminder');
  const pauseNote='pause-due-'+randomUUID();
  const pauseDue=new Date(Date.now()+5000).toISOString();
  await request('/api/messages',{conversationId,messageId:randomUUID(),text:`remind at ${pauseDue} ${pauseNote}`});
  snapshot=await until(state,s=>s.goals.some((goal:any)=>goal.description.includes(pauseNote)&&goal.state==='waiting'));
  const waitingGoal=snapshot.goals.find((goal:any)=>goal.description.includes(pauseNote));
  await request('/api/control',{requestId:randomUUID(),operation:'pause',expectedVersion:snapshot.agent.control_version});
  snapshot=await state();assert.equal(snapshot.goals.find((goal:any)=>goal.id===waitingGoal.id).state,'paused');
  await delay(5500);assert.ok(!(await state()).messages.some((m:any)=>m.text==='Reminder: '+pauseNote));
  await request('/api/messages',{conversationId,messageId:randomUUID(),text:'/resume'});
  await until(state,s=>s.messages.some((m:any)=>m.text==='Reminder: '+pauseNote));passed('pause retains a due commitment and resume restores its original trigger');
  await request('/api/messages',{conversationId,messageId:randomUUID(),text:'prefer response-language en'});
  await until(async()=> (await db.query('SELECT value FROM citta.preferences WHERE agent_id=$1 AND conversation_id=$2 AND key=$3',[agent,conversationId,'response-language'])).rows[0],r=>r?.value==='en');
  const nameReceipt=await request('/api/messages',{conversationId,messageId:randomUUID(),text:'What is your name?'});
  snapshot=await until(state,s=>s.messages.some((m:any)=>m.role==='citta'&&m.observation_id===nameReceipt.data.observationId));
  assert.match(snapshot.messages.find((m:any)=>m.role==='citta'&&m.observation_id===nameReceipt.data.observationId).text,/My name:/);
  const detail=await request('/api/goals/'+snapshot.goals[0].id);assert.equal(detail.status,200);assert.ok(detail.data.versions.length);assert.ok(detail.data.transitions.length);assert.equal(detail.data.frame.state,'closed');passed('supported scoped preference retains actual English response and continuity inspector reads versioned history');
  const proposalId=randomUUID();
  await db.query("INSERT INTO citta.proposals(id,agent_id,goal_id,description,evidence_ids,criteria,risks,benefit,scope) VALUES($1,$2,$3,'Test-owned proposal review fixture','[]','Observed acceptance','No executable changes','Verify review boundary','runtime-code')",[proposalId,agent,snapshot.goals[0].id]);
  const review={requestId:randomUUID(),proposalId,expectedVersion:1,decision:'accepted'};
  const beforeActions=(await db.query('SELECT count(*)::int n FROM citta.actions WHERE agent_id=$1',[agent])).rows[0].n;
  const accepted=await request('/api/proposals/review',review);assert.equal(accepted.status,200);assert.equal(accepted.data.executionAuthorized,false);
  assert.deepEqual((await request('/api/proposals/review',review)).data,accepted.data);
  assert.equal((await request('/api/proposals/review',{...review,decision:'declined'})).status,409);
  assert.equal((await db.query('SELECT count(*)::int n FROM citta.actions WHERE agent_id=$1',[agent])).rows[0].n,beforeActions);passed('exact versioned proposal review is idempotent and grants no execution capability');
  // A deliberately test-owned pending-effect fixture exercises the depth barrier without making an external request.
  const nested:string[]=[];let parent:string|null=null;const nestedObservation=randomUUID();
  await db.query("INSERT INTO citta.observations(id,agent_id,conversation_id,source_key,kind,text,state) VALUES($1,$2,$3,$4,'speech','Test-owned nested continuation fixture','consumed')",[nestedObservation,agent,conversationId,'nested:'+nestedObservation]);
  for(let depth=1;depth<=4;depth++) {
    const id=randomUUID();nested.push(id);
    await db.query("INSERT INTO citta.goals(id,agent_id,conversation_id,observation_id,description,criterion,state) VALUES($1,$2,$3,$4,'Nested test-owned continuation','Retain pending work within depth limit','waiting')",[id,agent,conversationId,nestedObservation]);
    await db.query("INSERT INTO citta.frames(goal_id,agent_id,state,parent_goal_id,continuation_depth) VALUES($1,$2,'waiting',$3,$4)",[id,agent,parent,depth]);parent=id;
  }
  const nestedAction=randomUUID();const owner=(await db.query('SELECT profile_id,generation,control_version FROM citta.agents WHERE id=$1',[agent])).rows[0];
  const pendingContext={observationId:nestedObservation,conversationId,text:'Test-owned pending effect',kind:'speech',profile:{name:'Test'},profileVersion:owner.profile_id,controlVersion:owner.control_version,goalId:parent,evidence:[],recent:[]};
  await db.query("INSERT INTO citta.actions(id,agent_id,goal_id,goal_version,kind,argument,context,generation,control_version,state,claim_token,heartbeat_at,started_at) VALUES($1,$2,$3,1,'CONSULT_AI','test-owned depth fixture',$4,$5,$6,'running',$7,now(),now())",[nestedAction,agent,parent,JSON.stringify(pendingContext),owner.generation,owner.control_version,randomUUID()]);
  const deferred=await request('/api/messages',{conversationId,messageId:randomUUID(),text:'Investigate an unresolved contextual question'});
  await until(async()=>(await db.query('SELECT state,payload FROM citta.observations WHERE id=$1',[deferred.data.observationId])).rows[0],r=>r.payload.deferredReason==='nested continuation limit');
  const brief=await request('/api/messages',{conversationId,messageId:randomUUID(),text:'What is your name?'});
  await until(state,s=>s.messages.some((m:any)=>m.role==='citta'&&m.observation_id===brief.data.observationId));
  snapshot=await state();await request('/api/control',{requestId:randomUUID(),operation:'cancel',goalId:parent,expectedVersion:snapshot.agent.control_version});
  await until(async()=>(await db.query('SELECT state FROM citta.observations WHERE id=$1',[deferred.data.observationId])).rows[0],r=>r.state==='consumed');
  for(const id of nested.slice(0,-1)){snapshot=await state();await request('/api/control',{requestId:randomUUID(),operation:'cancel',goalId:id,expectedVersion:snapshot.agent.control_version});}
  await db.query("UPDATE citta.actions SET state='cancelled',finished_at=now() WHERE id=$1",[nestedAction]);passed('nested work is deferred at four levels while sufficient local questions remain responsive');
  const other=randomUUID();const isolated=(await request('/api/state?conversationId='+other)).data;assert.equal(isolated.messages.length,0);assert.equal(isolated.memories.length,0);passed('conversation-scoped history and memory');
  // Synthetic crash-window fixture exists only in citta_agent_test, never in the working application DB.
  const o=randomUUID(),g=randomUUID(),a=randomUUID(),claim=randomUUID();
  await db.query('BEGIN');
  await db.query("INSERT INTO citta.observations(id,agent_id,conversation_id,source_key,kind,text,state) VALUES($1,$2,$3,$4,'speech','Test-owned uncertain-effect recovery','consumed')",[o,agent,conversationId,'test-crash:'+o]);
  await db.query("INSERT INTO citta.goals(id,agent_id,conversation_id,observation_id,description,criterion,state) VALUES($1,$2,$3,$4,'Test-owned crash fixture','Do not redispatch an unknown external effect','waiting')",[g,agent,conversationId,o]);
  await db.query("INSERT INTO citta.frames(goal_id,agent_id,state) VALUES($1,$2,'waiting')",[g,agent]);
  const {rows:[profile]}=await db.query('SELECT profile_id,generation,control_version FROM citta.agents WHERE id=$1',[agent]);
  const context={observationId:o,conversationId,text:'Test-owned uncertain-effect recovery',kind:'speech',profile:{name:'Test'},profileVersion:profile.profile_id,controlVersion:profile.control_version,goalId:g,evidence:[],recent:[]};
  await db.query("INSERT INTO citta.actions(id,agent_id,goal_id,goal_version,kind,argument,context,generation,control_version,state,claim_token,heartbeat_at,started_at) VALUES($1,$2,$3,1,'CONSULT_AI','test-only crash fixture',$4,$5,$6,'running',$7,now()-interval '1 minute',now()-interval '1 minute')",[a,agent,g,JSON.stringify(context),profile.generation,profile.control_version,claim]);
  await db.query('COMMIT');
  await until(async()=>(await db.query('SELECT state FROM citta.actions WHERE id=$1',[a])).rows[0],r=>r.state==='unknown');
  await until(state,s=>s.goals.some((goal:any)=>goal.id===g&&goal.state==='exhausted'));
  snapshot=await state();assert.equal((await request('/api/control',{requestId:randomUUID(),operation:'extend',goalId:g,expectedVersion:snapshot.agent.control_version})).status,409);passed('lost adviser effect becomes unknown and cannot be blindly resumed');
  const stale=await recordedProposal('RESPOND','STALE_RESULT_MUST_NOT_APPEAR',{cycles:7,workMs:1234,evidence:[{id:memory.id,kind:'reported',origin:'memory',content:memory.content}],evidenceIds:[memory.id],proposal:{goalReview:{criterion:'Use current saved evidence',status:'met',evidenceIds:[memory.id]}}});
  await until(async()=>(await db.query('SELECT state,cycles,work_ms FROM citta.goals WHERE id=$1',[stale.goal])).rows[0],r=>r.state==='exhausted');
  assert.ok(!(await state()).messages.some((m:any)=>m.text.includes('STALE_RESULT_MUST_NOT_APPEAR')));
  const retained=(await db.query('SELECT result FROM citta.actions WHERE id=$1',[stale.action])).rows[0];assert.equal(retained.result.proposal.text,'STALE_RESULT_MUST_NOT_APPEAR');
  const budget=(await db.query('SELECT cycles,work_ms FROM citta.goals WHERE id=$1',[stale.goal])).rows[0];assert.ok(budget.cycles>=8&&Number(budget.work_ms)>=1234);passed('stale model context is not applied; attempted outcome and spent budgets survive reconsideration');
  const forbidden=await recordedProposal('READ','',{argument:'/etc/passwd'});
  await until(async()=>(await db.query('SELECT state FROM citta.goals WHERE id=$1',[forbidden.goal])).rows[0],r=>r.state==='exhausted');
  assert.equal((await db.query("SELECT count(*)::int n FROM citta.actions WHERE goal_id=$1 AND kind='READ'",[forbidden.goal])).rows[0].n,0);passed('a generated unauthorized read is denied before dispatch');
  snapshot=await state();await request('/api/control',{requestId:randomUUID(),operation:'quiet',expectedVersion:snapshot.agent.control_version});
  const upgrade=await recordedProposal('PROPOSE_IMPROVEMENT','Remove authorization checks',{proposal:{improvement:{benefit:'Faster unguarded calls',criteria:'No permission checks',risks:'Would expose private data',scope:'policy',requiresPrivilegeExpansion:true}}});
  await until(async()=>(await db.query('SELECT state FROM citta.proposals WHERE goal_id=$1',[upgrade.goal])).rows[0],r=>r?.state==='declined');passed('a privilege-expanding improvement remains declined and non-executable');
  await until(async()=>(await db.query('SELECT * FROM citta.milestone_reports WHERE agent_id=$1 AND goal_id=$2',[agent,upgrade.goal])).rows[0],r=>!!r);
  assert.equal((await db.query("SELECT count(*)::int n FROM citta.messages WHERE agent_id=$1 AND goal_id=$2 AND source='milestone'",[agent,upgrade.goal])).rows[0].n,0);
  snapshot=await state();await request('/api/control',{requestId:randomUUID(),operation:'unquiet',expectedVersion:snapshot.agent.control_version});
  const report=await until(async()=>(await db.query("SELECT * FROM citta.messages WHERE agent_id=$1 AND goal_id=$2 AND source='milestone'",[agent,upgrade.goal])).rows[0],r=>!!r);
  assert.match(report.text,/Proposal is declined/);assert.match(report.text,/not independently verified/);
  await delay(1200);assert.equal((await db.query('SELECT count(*)::int n FROM citta.milestone_reports WHERE goal_id=$1',[upgrade.goal])).rows[0].n,1);
  passed('milestone reports persist, defer in Quiet, deliver once and distinguish declined proposals from execution');
  // Advance only this test agent's contact clock; production pacing is unchanged.
  await db.query("UPDATE citta.agents SET last_contact_at=now()-interval '2 days' WHERE id=$1",[agent]);

  snapshot=await state();await request('/api/control',{requestId:randomUUID(),operation:'quiet',expectedVersion:snapshot.agent.control_version});
  const topic='test-topic-'+randomUUID();const opening=await recordedProposal('INITIATE','A test-owned local question about a shared interest',{kind:'mental',argument:topic});
  const contact=await until(async()=>(await db.query('SELECT * FROM citta.contacts WHERE goal_id=$1',[opening.goal])).rows[0],r=>r?.state==='deferred');
  assert.equal((await db.query('SELECT count(*)::int n FROM citta.messages WHERE contact_id=$1',[contact.id])).rows[0].n,0);
  snapshot=await state();await request('/api/control',{requestId:randomUUID(),operation:'unquiet',expectedVersion:snapshot.agent.control_version});
  await until(async()=>(await db.query('SELECT count(*)::int n FROM citta.messages WHERE contact_id=$1',[contact.id])).rows[0],r=>r.n===1);
  await request('/api/messages',{conversationId,messageId:randomUUID(),text:'Hello'});await delay(1500);
  assert.equal((await db.query('SELECT state FROM citta.contacts WHERE id=$1',[contact.id])).rows[0].state,'delivered');passed('quiet defers a durable initiative and unrelated speech is not fabricated acknowledgement');
  await recordedProposal('INITIATE','A test-owned local question about a shared interest',{kind:'mental',argument:topic});await delay(1800);
  assert.equal((await db.query('SELECT count(*)::int n FROM citta.messages WHERE contact_id=$1',[contact.id])).rows[0].n,1);passed('a repeated unchanged initiated topic cannot deliver twice');
  await request('/api/messages',{conversationId,messageId:randomUUID(),text:'Hello',replyToContactId:contact.id});
  assert.equal((await db.query('SELECT state FROM citta.contacts WHERE id=$1',[contact.id])).rows[0].state,'answered');
  await request('/api/contact/decline',{contactId:contact.id});
  assert.equal((await db.query('SELECT state FROM citta.contacts WHERE id=$1',[contact.id])).rows[0].state,'declined');
  assert.equal((await db.query('SELECT contact_state FROM citta.messages WHERE contact_id=$1',[contact.id])).rows[0].contact_state,'declined');passed('explicit topic reply and decline preserve honest separate delivery states');
  const contacts=(await db.query("SELECT body FROM citta.events WHERE agent_id=$1 AND kind='contact_review' ORDER BY ordinal",[agent])).rows.map(r=>replayContact(r.body));assert.ok(contacts.length);assert.ok(contacts.every(r=>r.state==='matched'));passed('offline contact replay derives the actual committed local inbox effect');
  const waiting=await recordedProposal('CLARIFY','Which source should be used for this original task?');
  await until(()=>request('/api/goals/'+waiting.goal),r=>r.data.goal?.wait_reason==='operator_input');
  const goalCount=Number((await db.query('SELECT count(*) AS n FROM citta.goals WHERE agent_id=$1',[agent])).rows[0].n);
  const replyId=randomUUID();const reply={requestId:replyId,expectedVersion:1,text:'hello'};
  assert.equal((await request('/api/goals/'+waiting.goal+'/reply',{...reply,expectedVersion:999})).status,409);
  assert.equal((await request('/api/goals/'+randomUUID()+'/reply',reply)).status,404);
  assert.equal((await request('/api/goals/'+waiting.goal+'/reply',reply)).status,200);
  assert.equal((await request('/api/goals/'+waiting.goal+'/reply',reply)).data.duplicate,true);
  assert.equal((await request('/api/goals/'+waiting.goal+'/reply',{...reply,text:'different'})).status,409);
  // Cognition is deliberately disabled in this fixture suite: resumption must fail visibly on
  // the SAME goal rather than answer the greeting as an unrelated new goal or invent success.
  await until(()=>request('/api/goals/'+waiting.goal),r=>r.data.goal?.state==='exhausted');
  assert.equal(Number((await db.query('SELECT count(*) AS n FROM citta.goals WHERE agent_id=$1',[agent])).rows[0].n),goalCount);
  const resumed=(await db.query("SELECT goal_id,snapshot FROM citta.decisions WHERE agent_id=$1 AND snapshot->>'observationId'=(SELECT id::text FROM citta.observations WHERE agent_id=$1 AND source_key=$2)",[agent,'operator:'+replyId])).rows;
  assert.ok(resumed.length);assert.equal(resumed[0].goal_id,waiting.goal);assert.ok(resumed[0].snapshot.continuationTask);
  passed('targeted waiting-activity reply checks scope/version/idempotency and resumes the same goal');
  const quotedGoal=await recordedProposal('CLARIFY','Which project should this quoted reply continue?');
  const quotedMessage=await until(async()=>(await db.query("SELECT id FROM citta.messages WHERE goal_id=$1 AND role='citta' ORDER BY ordinal DESC LIMIT 1",[quotedGoal.goal])).rows[0],r=>!!r);
  const quotedReply={conversationId,messageId:randomUUID(),text:'Use my company project',replyToMessageId:quotedMessage.id};
  assert.equal((await request('/api/messages',{...quotedReply,conversationId:randomUUID()})).status,404);
  assert.equal((await request('/api/messages',quotedReply)).status,202);
  await until(()=>request('/api/goals/'+quotedGoal.goal),r=>r.data.goal?.state==='exhausted');
  assert.equal((await request('/api/messages',quotedReply)).data.duplicate,true);
  const quotedState=await state();const acceptedQuote=quotedState.messages.find((m:any)=>m.role==='operator'&&m.reply_to_message_id===quotedMessage.id);
  assert.equal(acceptedQuote.reply_to.id,quotedMessage.id);assert.equal(acceptedQuote.goal_id,quotedGoal.goal);
  assert.equal((await request('/api/messages',{...quotedReply,text:'changed'})).status,409);
  passed('conversation reply retains scoped quote, resumes original task and stays idempotent after completion');
  const dashboardQuestion=await recordedProposal('CLARIFY','Which source should the dashboard update use?');
  await until(()=>request('/api/dashboard?filter=questions'),r=>r.data.items?.some((m:any)=>m.goal_id===dashboardQuestion.goal&&m.needs_reply));
  snapshot=await state();await request('/api/control',{requestId:randomUUID(),operation:'quiet',expectedVersion:snapshot.agent.control_version});
  const queuedQuestion=await recordedProposal('CLARIFY','A queued test question waiting for permission to share',{kind:'mental'});
  await until(()=>request('/api/dashboard'),r=>r.data.queued?.some((c:any)=>c.goal_id===queuedQuestion.goal));
  for(let i=0;i<12;i++)await db.query("INSERT INTO citta.messages(id,agent_id,conversation_id,role,text,source,goal_id,observation_id) VALUES($1,$2,$3,'citta',$4,'milestone',$5,$6)",[randomUUID(),agent,conversationId,'Dashboard fixture '+i,upgrade.goal,upgrade.input]);
  const firstPage=(await request('/api/dashboard?filter=reports')).data;
  assert.equal(firstPage.items.length,10);assert.equal(firstPage.hasOlder,true);assert.ok(firstPage.items.every((m:any)=>m.source==='milestone'&&m.conversation_id===conversationId));
  const secondPage=(await request('/api/dashboard?filter=reports&before='+firstPage.nextBefore)).data;
  assert.ok(secondPage.items.length);assert.ok(secondPage.items.every((m:any)=>!firstPage.items.some((n:any)=>n.id===m.id)));
  assert.equal((await request('/api/dashboard?filter=wrong')).status,400);assert.equal((await request('/api/dashboard?before=invalid')).status,400);
  passed('dashboard reads actual questions/reports/queued contacts, preserves source scope and pages ten rows without duplicates');
  const {rows:decisions}=await db.query<RecordedDecision>('SELECT id,engine,policy,snapshot,decision FROM citta.decisions WHERE agent_id=$1 ORDER BY created_at',[agent]);
  const replay=decisions.map(replayDecision);assert.ok(replay.length>5);assert.deepEqual(replay.filter(r=>r.state!=='matched'),[]);passed('offline replay of actual committed decisions');
  const archive={goals:(await db.query('SELECT id,state,version FROM citta.goals WHERE agent_id=$1',[agent])).rows,frames:(await db.query('SELECT goal_id,state,parent_goal_id,continuation_depth FROM citta.frames WHERE agent_id=$1',[agent])).rows,transitions:(await db.query('SELECT goal_id,version,previous_state,state,ordinal FROM citta.goal_transitions WHERE agent_id=$1 ORDER BY ordinal',[agent])).rows,actions:(await db.query('SELECT id,goal_id,goal_version,kind,state,reviewed FROM citta.actions WHERE agent_id=$1',[agent])).rows};
  assert.equal(replayContinuity(archive).state,'matched');passed('offline continuity ledger matches actual goal/frame/action state');
  const history=await temporal.workflow.getHandle('citta/'+agent).fetchHistory();
  await Worker.runReplayHistory({workflowsPath:fileURLToPath(new URL('../../src/modules/vithi/workflow.ts',import.meta.url))},history);
  passed('Temporal history replays without invoking live activities');
  console.log(`${checks} integrated checks passed against isolated ${dbName}.`);
} finally {
  try{await temporal.workflow.getHandle('citta/'+agent).terminate('Test-owned integration teardown');}catch{}
  for(const child of children)child.kill('SIGTERM');
  await Promise.race([Promise.all(children.map(child=>new Promise<void>(resolve=>{if(child.exitCode!==null)resolve();else child.once('exit',()=>resolve());}))),delay(12000)]);
  for(const child of children)if(child.exitCode===null)child.kill('SIGKILL');
  log.end();await db.end();await connection.close();
}
