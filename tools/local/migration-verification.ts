import assert from 'node:assert/strict';
import pg from 'pg';
import {randomUUID} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {mkdir,writeFile} from 'node:fs/promises';
const source=process.env.CITTA_DATABASE_URL||process.env.DATABASE_URL;if(!source)throw Error('Local database configuration is required.');
const name='citta_migration_'+randomUUID().replaceAll('-','').slice(0,8)+'_test';
const admin=new pg.Client({connectionString:source});await admin.connect();try{await admin.query(`CREATE DATABASE "${name}"`);}finally{await admin.end();}
const url=new URL(source);url.pathname='/'+name;
const db=new pg.Client({connectionString:url.toString()});await db.connect();
const checks:string[]=[];const passed=(name:string)=>{checks.push(name);console.log('PASS '+name);};
const execute=promisify(execFile),env={...process.env,CITTA_DATABASE_URL:url.toString()};
try {
  await db.query('CREATE SCHEMA runtime');await db.query('CREATE TABLE runtime.portal_notes(body text NOT NULL)');await db.query("INSERT INTO runtime.portal_notes VALUES('test-owned preservation sentinel')");
  const first=await execute(process.execPath,['--import','tsx','tools/local/migrate.ts'],{env});assert.match(first.stdout,/Applied 003_/);assert.match(first.stdout,/Applied 004_/);assert.match(first.stdout,/Applied 005_/);
  assert.equal((await db.query('SELECT body FROM runtime.portal_notes')).rows[0].body,'test-owned preservation sentinel');passed('fresh migration chain preserves existing legacy-schema records');
  const second=await execute(process.execPath,['--import','tsx','tools/local/migrate.ts'],{env});assert.equal(second.stdout,'');assert.equal((await db.query('SELECT count(*)::int n FROM citta.migrations')).rows[0].n,3);passed('repeated migration checksums/ledger do not reapply or duplicate schema');
  const a='scope-a',b='scope-b';
  for(const id of [a,b]){await db.query('INSERT INTO citta.profiles(id,agent_id,body) VALUES($1,$2,$3)',['profile-'+id,id,JSON.stringify({name:'Synthetic scope fixture'})]);await db.query('INSERT INTO citta.agents(id,profile_id) VALUES($1,$2)',[id,'profile-'+id]);}
  const ca=randomUUID(),cb=randomUUID(),oa=randomUUID();
  await db.query('INSERT INTO citta.conversations(id,agent_id) VALUES($1,$2),($3,$4)',[ca,a,cb,b]);
  await assert.rejects(db.query("INSERT INTO citta.observations(id,agent_id,conversation_id,source_key,kind,text) VALUES($1,$2,$3,'cross-agent','speech','Must not persist')",[randomUUID(),a,cb]),(e:any)=>e.code==='23503');
  await db.query("INSERT INTO citta.observations(id,agent_id,conversation_id,source_key,kind,text) VALUES($1,$2,$3,'owned','speech','Test-owned scope evidence')",[oa,a,ca]);
  await assert.rejects(db.query("INSERT INTO citta.goals(id,agent_id,conversation_id,observation_id,description,criterion,state) VALUES($1,$2,$3,$4,'Cross-agent goal','Must fail','active')",[randomUUID(),b,cb,oa]),(e:any)=>e.code==='23503');passed('database foreign keys independently reject cross-agent observation and goal links');
  const goal=randomUUID();await db.query("INSERT INTO citta.goals(id,agent_id,conversation_id,observation_id,description,criterion,state) VALUES($1,$2,$3,$4,'Version guard fixture','Original criterion','active')",[goal,a,ca,oa]);
  await db.query("UPDATE citta.goals SET criterion='Revised criterion' WHERE id=$1",[goal]);assert.equal((await db.query('SELECT version FROM citta.goals WHERE id=$1',[goal])).rows[0].version,2);assert.equal((await db.query('SELECT count(*)::int n FROM citta.goal_versions WHERE goal_id=$1',[goal])).rows[0].n,2);
  await db.query("UPDATE citta.goals SET state='completed' WHERE id=$1",[goal]);
  await assert.rejects(db.query("UPDATE citta.goals SET state='active' WHERE id=$1",[goal]),/Terminal goal cannot resume/);
  await assert.rejects(db.query("UPDATE citta.goals SET criterion='Rewrite completed evidence' WHERE id=$1",[goal]),/Terminal goal criteria are immutable/);passed('goal criterion history is append-only and completed goals cannot silently resume');
  await mkdir('artifacts/verification',{recursive:true});await writeFile('artifacts/verification/migration-results.json',JSON.stringify({checks,database:name,scope:'Dedicated newly created test database; original application databases untouched.'},null,2));
}finally{await db.end();}
