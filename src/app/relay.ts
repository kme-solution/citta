import { randomUUID } from 'node:crypto';
import { Connection, Client } from '@temporalio/client';
import { setTimeout as delay } from 'node:timers/promises';
import { config } from './config.ts';
import { pool, transaction } from '../infra/postgres/database.ts';
import { initialize } from '../infra/postgres/runtime-repository.ts';
import { TASK_QUEUE } from '../contracts/runtime.ts';
await initialize();
const connection = await Connection.connect({address:config.temporalAddress});
const client = new Client({connection,namespace:config.temporalNamespace});
let stopping=false;
for (const signal of ['SIGINT','SIGTERM'] as const) process.once(signal,()=>{stopping=true;});
try {
  while (!stopping) {
    try {
      const token = randomUUID();
      const rows = await transaction(async tx=>(await tx.query("UPDATE citta.outbox SET claim_token=$2,lease_until=now()+interval '20 seconds' WHERE id IN (SELECT id FROM citta.outbox WHERE agent_id=$1 AND delivered_at IS NULL AND (lease_until IS NULL OR lease_until<now()) ORDER BY created_at LIMIT 50 FOR UPDATE SKIP LOCKED) RETURNING id",[config.agentId,token])).rows);
      // signalWithStart is idempotent ownership activation, including an initially empty inbox.
      const {rows:[agent]}=await pool.query('SELECT generation FROM citta.agents WHERE id=$1',[config.agentId]);
      await client.workflow.signalWithStart('cittaVithi',{workflowId:'citta/'+config.agentId,taskQueue:TASK_QUEUE+'/'+config.agentId,args:[String(agent.generation)],signal:'wake',signalArgs:[],workflowIdReusePolicy:'REJECT_DUPLICATE'});
      if (rows.length) await pool.query('UPDATE citta.outbox SET delivered_at=now(),lease_until=NULL WHERE claim_token=$1 AND agent_id=$2',[token,config.agentId]);
    } catch (error) { console.error(JSON.stringify({level:'error',service:'relay',message:error instanceof Error?error.message:'Relay failed'})); }
    await delay(3000);
  }
} finally { await connection.close(); await pool.end(); }
