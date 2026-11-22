import pg from 'pg';
import { randomUUID } from 'node:crypto';
import { config } from '../../src/app/config.ts';
import { pool, transaction, lockAgent, event } from '../../src/infra/postgres/database.ts';
import { initialize } from '../../src/infra/postgres/runtime-repository.ts';
if (!process.env.DATABASE_URL) throw Error('The legacy DATABASE_URL is required.');
const source = new pg.Client({ connectionString: process.env.DATABASE_URL });
await source.connect();
try {
  await initialize();
  const {
    rows: [table],
  } = await source.query("SELECT to_regclass('runtime.portal_notes') AS present");
  if (!table.present) throw Error('The source has no legacy portal notes; nothing was imported.');
  let cursor = '0',
    copied = 0;
  for (;;) {
    const { rows } = await source.query(
      'SELECT * FROM runtime.portal_notes WHERE ordinal>$1::bigint ORDER BY ordinal LIMIT 100',
      [cursor],
    );
    if (!rows.length) break;
    for (const note of rows) {
      await transaction(async (tx) => {
        await lockAgent(tx);
        const key = 'legacy-note:' + note.message_id;
        const {
          rows: [old],
        } = await tx.query(
          'SELECT text,conversation_id FROM citta.observations WHERE agent_id=$1 AND source_key=$2',
          [config.agentId, key],
        );
        if (old) {
          if (old.text !== note.body || old.conversation_id !== note.conversation_id)
            throw Error(
              'An imported source note changed; review its lineage before importing again.',
            );
          return;
        }
        const {
          rows: [owner],
        } = await tx.query('SELECT agent_id FROM citta.conversations WHERE id=$1', [
          note.conversation_id,
        ]);
        if (owner && owner.agent_id !== config.agentId)
          throw Error(
            'Legacy conversation ID conflicts with another agent; no records were overwritten.',
          );
        await tx.query(
          "INSERT INTO citta.conversations(id,agent_id,title) VALUES($1,$2,'Imported saved notes') ON CONFLICT DO NOTHING",
          [note.conversation_id, config.agentId],
        );
        const id = randomUUID();
        await tx.query(
          "INSERT INTO citta.observations(id,agent_id,conversation_id,source_key,kind,text,payload,state,consumed_at) VALUES($1,$2,$3,$4,'speech',$5,$6,'consumed',now())",
          [
            id,
            config.agentId,
            note.conversation_id,
            key,
            note.body,
            JSON.stringify({
              origin: 'legacy portal note',
              originalTimestamp: 'unknown',
              legacyOrdinal: String(note.ordinal),
              legacyMessageId: note.message_id,
            }),
          ],
        );
        await tx.query(
          "INSERT INTO citta.memories(id,agent_id,conversation_id,kind,content,source_id) VALUES($1,$2,$3,'reported',$4,$5)",
          [randomUUID(), config.agentId, note.conversation_id, note.body, id],
        );
        await tx.query(
          "INSERT INTO citta.messages(id,agent_id,conversation_id,role,text,observation_id,source) VALUES($1,$2,$3,'system',$4,$5,'legacy-import')",
          [
            randomUUID(),
            config.agentId,
            note.conversation_id,
            'Imported saved note (original time unknown):\n\n' + note.body,
            id,
          ],
        );
        await event(tx, 'note_imported', {
          observationId: id,
          conversationId: note.conversation_id,
        });
        copied++;
      });
      cursor = String(note.ordinal);
    }
  }
  console.log(`Imported ${copied} saved notes. Original records remain unchanged.`);
} finally {
  await source.end();
  await pool.end();
}
