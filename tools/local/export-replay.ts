import { writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { pool, transaction } from '../../src/infra/postgres/database.ts';
import { config } from '../../src/app/config.ts';
const target = process.argv[2];
if (!target)
  throw Error(
    'Supply a private output path. Exports contain selected profile and conversation context.',
  );
try {
  const archive = await transaction(async (tx) => {
    await tx.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const [
      { rows: decisions },
      { rows: contacts },
      { rows: goals },
      { rows: frames },
      { rows: transitions },
      { rows: actions },
    ] = await Promise.all([
      tx.query(
        'SELECT id,engine,policy,snapshot,decision FROM citta.decisions WHERE agent_id=$1 ORDER BY sequence NULLS LAST,created_at,id',
        [config.agentId],
      ),
      tx.query(
        "SELECT body FROM citta.events WHERE agent_id=$1 AND kind='contact_review' ORDER BY ordinal",
        [config.agentId],
      ),
      tx.query('SELECT id,state,version FROM citta.goals WHERE agent_id=$1', [config.agentId]),
      tx.query(
        'SELECT goal_id,state,parent_goal_id,continuation_depth FROM citta.frames WHERE agent_id=$1',
        [config.agentId],
      ),
      tx.query(
        'SELECT goal_id,version,previous_state,state,ordinal FROM citta.goal_transitions WHERE agent_id=$1 ORDER BY ordinal',
        [config.agentId],
      ),
      tx.query(
        'SELECT id,goal_id,goal_version,kind,state,reviewed FROM citta.actions WHERE agent_id=$1',
        [config.agentId],
      ),
    ]);
    return {
      format: 'citta-domain-replay-v1',
      decisions,
      contacts: contacts.map((c) => c.body),
      continuity: { goals, frames, transitions, actions },
    };
  });
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, JSON.stringify(archive, null, 2), { flag: 'wx', mode: 0o600 });
  console.log(
    `Exported ${archive.decisions.length} recorded decisions. No live actions were executed.`,
  );
} finally {
  await pool.end();
}
