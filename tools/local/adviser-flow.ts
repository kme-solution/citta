import assert from 'node:assert/strict';
import pg from 'pg';
import {randomUUID} from 'node:crypto';
import {spawn,type ChildProcess} from 'node:child_process';
import {createWriteStream} from 'node:fs';
import {mkdir,writeFile} from 'node:fs/promises';
import {setTimeout as delay} from 'node:timers/promises';
import {Connection,Client} from '@temporalio/client';
const url=new URL(process.env.CITTA_DATABASE_URL||process.env.DATABASE_URL||'');url.pathname='/citta_agent_test';
const failureOnly=process.env.CITTA_ADVISER_FAILURE_ONLY==='true';
const agent='adviser-'+randomUUID().slice(0,8),port=4177,conversationId=randomUUID();
const env:NodeJS.ProcessEnv={...process.env,CITTA_DATABASE_URL:url.toString(),CITTA_AGENT_ID:agent,CITTA_PORT:String(port),CITTA_NAME:'Verification agent',CITTA_AGE:'',CITTA_GENDER:'',CITTA_BACKGROUND:'',CITTA_OCCUPATION:'',CITTA_LOCATION:'',CITTA_LANGUAGE:'',CITTA_VALUES:'',CITTA_GOALS:'',CITTA_COGNITION_ENABLED:'false',CITTA_ADVISER_ENABLED:'true'};
await mkdir('.local/state',{recursive:true});await mkdir('artifacts/verification',{recursive:true});
if(failureOnly)env.CITTA_CODEX_PATH='/nonexistent/citta-verification-codex';
const log=createWriteStream('.local/state/adviser-flow.log',{flags:'w'}),children:ChildProcess[]=[];
const db=new pg.Client({connectionString:url.toString()});await db.connect();
const connection=await Connection.connect({address:process.env.CITTA_TEMPORAL_ADDRESS||'127.0.0.1:7233'}),temporal=new Client({connection,namespace:process.env.CITTA_TEMPORAL_NAMESPACE||'default'});
const base='http://127.0.0.1:'+port;
async function read(){const response=await fetch(base+'/api/state?conversationId='+conversationId);return response.json();}
async function send(text:string){const response=await fetch(base+'/api/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({conversationId,messageId:randomUUID(),text})});assert.equal(response.status,202);return response.json();}
async function until<T>(read:()=>Promise<T>,predicate:(value:T)=>boolean,timeout=150000){const end=Date.now()+timeout;do{try{const value=await read();if(predicate(value))return value;}catch{}await delay(100);}while(Date.now()<end);throw Error('Timed out waiting for real adviser flow; inspect private adviser-flow.log.');}
const checks:string[]=[];const passed=(name:string)=>{checks.push(name);console.log('PASS '+name);};
try {
  for(const app of ['server','worker','relay']){const child=spawn(process.execPath,['--import','tsx',`src/app/${app}.ts`],{env,stdio:['ignore','pipe','pipe']});child.stdout?.pipe(log,{end:false});child.stderr?.pipe(log,{end:false});children.push(child);}
  await until(async()=>(await(await fetch(base+'/api/health')).json()),h=>h.runner==='ready',20000);
  if(!failureOnly) {
  const start=await send('ask Reply with exactly CITTA_FLOW_OK. Do not run tools or inspect files.');
  const active=await until(async()=>(await db.query("SELECT a.*,g.observation_id FROM citta.actions a JOIN citta.goals g ON g.id=a.goal_id WHERE a.agent_id=$1 AND a.kind='CONSULT_AI' AND g.observation_id=$2",[agent,start.observationId])).rows[0],a=>a?.state==='running');
  const before=Date.now(),question=await send('What is your name?');
  const answered=await until(read,s=>s.messages.some((m:any)=>m.role==='citta'&&m.observation_id===question.observationId),10000);
  const responseMs=Date.now()-before;assert.ok(responseMs<2500,'Local response remains responsive while the actual adviser runs');assert.ok(!answered.messages.some((m:any)=>m.goal_id===active.goal_id&&m.source==='codex'));passed('local identity response arrives before actual in-flight Codex advice');
  const final=await until(read,s=>s.messages.some((m:any)=>m.goal_id===active.goal_id&&m.source==='codex'));
  const advice=final.messages.find((m:any)=>m.goal_id===active.goal_id&&m.source==='codex');assert.match(advice.text,/Codex advice \(unverified\)/);assert.match(advice.text,/CITTA_FLOW_OK/);passed('real advice is persisted, attributed and explicitly unverified');
  const second=await send('ask Reply with exactly CITTA_CANCEL_CHECK. Do not run tools or inspect files.');
  const pending=await until(async()=>(await db.query("SELECT a.* FROM citta.actions a JOIN citta.goals g ON g.id=a.goal_id WHERE a.agent_id=$1 AND a.kind='CONSULT_AI' AND g.observation_id=$2",[agent,second.observationId])).rows[0],a=>a?.state==='running');
  await send('Stop that task');
  await until(async()=>(await db.query('SELECT state FROM citta.goals WHERE id=$1',[pending.goal_id])).rows[0],g=>g.state==='cancelled',10000);
  await until(async()=>(await db.query('SELECT state,reviewed FROM citta.actions WHERE id=$1',[pending.id])).rows[0],a=>a.state!=='running'&&a.reviewed);
  const cancelled=await read();assert.equal(cancelled.goals.find((g:any)=>g.id===pending.goal_id).state,'cancelled');assert.ok(!cancelled.messages.some((m:any)=>m.goal_id===pending.goal_id&&m.source==='codex'));passed('cancellation of real adviser work cannot publish a late result or revive its goal');
  await writeFile('artifacts/verification/adviser-flow-results.json',JSON.stringify({checks,localResponseMs:responseMs,scope:'Actual Codex CLI/provider requests in a synthetic isolated test conversation; no fabricated adviser output.'},null,2));
  } else {
    const receipt=await send('ask Verify the unavailable CLI boundary.');
    const failed=await until(async()=>(await db.query("SELECT a.* FROM citta.actions a JOIN citta.goals g ON g.id=a.goal_id WHERE a.agent_id=$1 AND g.observation_id=$2 AND a.kind='CONSULT_AI'",[agent,receipt.observationId])).rows[0],a=>a&&['failed','unknown'].includes(a.state));
    assert.equal(failed.state,'failed','A CLI that could not start is a definite failure, not an unknown external effect.');
    const reported=await until(read,state=>state.messages.some((m:any)=>m.goal_id===failed.goal_id&&m.text.includes('CLI unavailable')));
    assert.equal(reported.goals.find((g:any)=>g.id===failed.goal_id).state,'exhausted');passed('definitely unavailable CLI is a visible failed attempt, not success or uncertain remote execution');
    await writeFile('artifacts/verification/adviser-failure-results.json',JSON.stringify({checks,scope:'Actual nonexistent executable failure; no external provider request was made.'},null,2));
  }

} finally {
  try{await temporal.workflow.getHandle('citta/'+agent).terminate('Adviser flow verification teardown');}catch{}
  for(const child of children)child.kill('SIGTERM');
  await Promise.race([Promise.all(children.map(child=>new Promise<void>(resolve=>{if(child.exitCode!==null)resolve();else child.once('exit',()=>resolve());}))),delay(12000)]);
  for(const child of children)if(child.exitCode===null)child.kill('SIGKILL');log.end();await db.end();await connection.close();
}
