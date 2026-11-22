import { Connection, Client } from '@temporalio/client';
import { config } from '../../src/app/config.ts';
import { transaction, lockAgent, pool, event } from '../../src/infra/postgres/database.ts';
import { resultObservation } from '../../src/modules/vithi/cycle.ts';
import { TASK_QUEUE } from '../../src/contracts/runtime.ts';
const requestId=process.argv[2];
if(!requestId||!/^[-0-9a-f]{36}$/i.test(requestId))throw Error('Supply a stable UUID recovery request ID; reuse it after an uncertain result.');
const connection=await Connection.connect({address:config.temporalAddress});
const client=new Client({connection,namespace:config.temporalNamespace});
try {
  const handle=client.workflow.getHandle('citta/'+config.agentId);
  const description=await handle.describe();
  const {rows:[previous]}=await pool.query('SELECT generation FROM citta.recoveries WHERE id=$1 AND agent_id=$2',[requestId,config.agentId]);
  if(description.status.name==='RUNNING') {
    if(previous)console.log('Replacement execution is running; no ownership epoch was advanced.');
    else throw Error('The workflow is running. Refusing to replace its owner.');
  } else {
    const generation=await transaction(async tx=> {
      const agent=await lockAgent(tx);
      const {rows:[old]}=await tx.query('SELECT generation FROM citta.recoveries WHERE id=$1 AND agent_id=$2',[requestId,config.agentId]);
      if(old)return String(old.generation);
      const {rows:[sameExecution]}=await tx.query('SELECT generation FROM citta.recoveries WHERE agent_id=$1 AND previous_run_id=$2',[config.agentId,description.runId]);
      if(sameExecution)return String(sameExecution.generation);
      const {rows:[updated]}=await tx.query('UPDATE citta.agents SET generation=generation+1,domain_version=domain_version+1 WHERE id=$1 RETURNING generation',[config.agentId]);
      const {rows:lost}=await tx.query("UPDATE citta.actions SET state=CASE WHEN kind='CONSULT_AI' THEN 'unknown' ELSE 'failed' END,result=jsonb_build_object('ok',false,'unknown',kind='CONSULT_AI','error','Previous execution closed before a durable outcome.'),finished_at=now() WHERE agent_id=$1 AND state='running' RETURNING id,goal_id",[config.agentId]);
      for(const action of lost) {
        await resultObservation(tx,action.id,action.goal_id);
        await tx.query("UPDATE citta.goals SET state='exhausted',summary='Previous execution closed with an unresolved effect; review required.',updated_at=now() WHERE id=$1 AND state NOT IN ('cancelled','completed')",[action.goal_id]);
        await tx.query("UPDATE citta.frames SET state='closed',version=version+1 WHERE goal_id=$1",[action.goal_id]);
      }
      // Queued work has not crossed dispatch; explicitly reauthorize it in the new generation.
      await tx.query("UPDATE citta.actions SET generation=$2 WHERE agent_id=$1 AND state='queued'",[config.agentId,updated.generation]);
      await tx.query('INSERT INTO citta.recoveries(id,agent_id,generation,previous_run_id) VALUES($1,$2,$3,$4)',[requestId,config.agentId,updated.generation,description.runId]);
      await event(tx,'ownership_recovered',{requestId,previousGeneration:String(agent.generation),generation:String(updated.generation)});
      return String(updated.generation);
    });
    await client.workflow.signalWithStart('cittaVithi',{workflowId:'citta/'+config.agentId,taskQueue:TASK_QUEUE+'/'+config.agentId,args:[generation],signal:'wake',signalArgs:[],workflowIdReusePolicy:'ALLOW_DUPLICATE'});
    console.log('Closed execution replaced with a fenced ownership generation. Existing domain history is preserved.');
  }
} finally {await connection.close();await pool.end();}
