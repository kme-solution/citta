import { NativeConnection, Worker } from '@temporalio/worker';
import { tracing } from '../infra/telemetry/tracing.ts';
import { fileURLToPath } from 'node:url';
import { config } from './config.ts';
import { pool } from '../infra/postgres/database.ts';
import * as activities from '../modules/vithi/activities.ts';
import { TASK_QUEUE } from '../contracts/runtime.ts';
const connection = await NativeConnection.connect({address:config.temporalAddress});
const worker = await Worker.create({connection,namespace:config.temporalNamespace,taskQueue:TASK_QUEUE+'/'+config.agentId,
  workflowsPath:fileURLToPath(new URL('../modules/vithi/workflow.ts',import.meta.url)),activities,
  maxConcurrentActivityTaskExecutions:8,maxConcurrentWorkflowTaskExecutions:2});
for (const signal of ['SIGINT','SIGTERM'] as const) process.once(signal,()=>worker.shutdown());
try { await worker.run(); } finally { await connection.close(); await pool.end(); await tracing.shutdown(); }
