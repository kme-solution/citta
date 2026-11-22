import pg from 'pg';
import { config, requireDatabase } from '../../app/config.ts';
export const pool = new pg.Pool({ connectionString: requireDatabase(), max: 8, connectionTimeoutMillis: 5000, statement_timeout: 15000 });
pool.on('error', error => console.error(JSON.stringify({level:'error',service:'postgres',message:error.message})));
export type Tx = pg.PoolClient;
export async function transaction<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
  const tx = await pool.connect();
  try { await tx.query('BEGIN'); const result = await fn(tx); await tx.query('COMMIT'); return result; }
  catch (e) { await tx.query('ROLLBACK'); throw e; } finally { tx.release(); }
}
export async function lockAgent(tx: Tx) {
  const { rows: [agent] } = await tx.query("SELECT *,date_trunc('hour',now()) AS current_budget_hour FROM citta.agents WHERE id=$1 FOR UPDATE", [config.agentId]);
  if (!agent) throw Error('Runtime not initialized. Run the migration and setup commands.');
  return agent;
}
export async function event(tx: Tx, kind: string, body: unknown) {
  await tx.query('INSERT INTO citta.events(agent_id,kind,body) VALUES($1,$2,$3)',[config.agentId,kind,JSON.stringify(body)]);
}
