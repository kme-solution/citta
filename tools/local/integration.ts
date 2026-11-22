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
const source=process.env.CITTA_DATABASE_URL||process.env.DATABASE_URL;
if(!source)throw Error('Configure a local PostgreSQL connection first.');
const dbName='citta_agent_test';
const admin=new pg.Client({connectionString:source});await admin.connect();
try{if(!(await admin.query('SELECT 1 FROM pg_database WHERE datname=$1',[dbName])).rows.length)await admin.query('CREATE DATABASE "citta_agent_test"');}finally{await admin.end();}
const url=new URL(source);url.pathname='/'+dbName;
const agent='test-'+randomUUID().slice(0,8);
const port=4175;
const env={...process.env,CITTA_DATABASE_URL:url.toString(),CITTA_AGENT_ID:agent,CITTA_PORT:String(port),CITTA_COGNITION_ENABLED:'false',CITTA_ADVISER_ENABLED:'false',CITTA_INTERNAL_INTERVAL_MS:'10000'};
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
  const {rows:decisions}=await db.query<RecordedDecision>('SELECT id,engine,policy,snapshot,decision FROM citta.decisions WHERE agent_id=$1 ORDER BY created_at',[agent]);
  const replay=decisions.map(replayDecision);assert.ok(replay.length>5);assert.deepEqual(replay.filter(r=>r.state!=='matched'),[]);passed('offline replay of actual committed decisions');
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
