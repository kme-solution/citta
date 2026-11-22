import { createHash } from 'node:crypto';
import { config } from '../../app/config.ts';
import { pool } from '../postgres/database.ts';
export interface WorkingScope {
  conversationId: string;
  profileVersion: string;
  contextKey: string;
}
export async function workingThread(scope: WorkingScope, model?: string) {
  try {
    const {
      rows: [owner],
    } = await pool.query(
      'SELECT 1 FROM citta.conversations c JOIN citta.profiles p ON p.agent_id=c.agent_id WHERE c.id=$1 AND c.agent_id=$2 AND p.id=$3',
      [scope.conversationId, config.agentId, scope.profileVersion],
    );
    if (!owner) throw Error('invalid-scope');
    const {
      rows: [memory],
    } = await pool.query(
      'SELECT count(*) AS invalidated FROM citta.memories WHERE agent_id=$1 AND NOT valid',
      [config.agentId],
    );
    // A correction invalidates old provider working context without discarding Citta's durable memory.
    const key = createHash('sha256')
      .update(
        JSON.stringify({
          context: scope.contextKey,
          model: model || 'configured',
          invalidated: String(memory.invalidated),
        }),
      )
      .digest('hex');
    const {
      rows: [row],
    } = await pool.query(
      'SELECT thread_id FROM citta.cognition_threads WHERE agent_id=$1 AND conversation_id=$2 AND profile_id=$3 AND context_key=$4',
      [config.agentId, scope.conversationId, scope.profileVersion, key],
    );
    return { key, threadId: row?.thread_id as string | undefined };
  } catch (error) {
    if (error instanceof Error && error.message === 'invalid-scope')
      throw Error('Codex working context scope does not belong to this Citta.');
    throw Error(
      'Codex working context store unavailable. Apply pending migrations before using the connection.',
    );
  }
}
export async function saveWorkingThread(scope: WorkingScope, key: string, threadId: string) {
  await pool.query(
    'INSERT INTO citta.cognition_threads(agent_id,conversation_id,profile_id,context_key,thread_id) VALUES($1,$2,$3,$4,$5) ON CONFLICT(agent_id,conversation_id,profile_id,context_key) DO UPDATE SET thread_id=EXCLUDED.thread_id,updated_at=now()',
    [config.agentId, scope.conversationId, scope.profileVersion, key, threadId],
  );
}
export async function resetWorkingThreads() {
  await pool.query('DELETE FROM citta.cognition_threads WHERE agent_id=$1', [config.agentId]);
}
