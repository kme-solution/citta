import pg from 'pg';
import { recall } from '../../modules/sati/sati-recall-service.ts';
import { desire } from '../../modules/chanda/chanda-service.ts';
import { nextAction } from '../../modules/cetana/cetana-service.ts';
import { feedback } from '../../modules/cetasika/vedana-service.ts';
import { readLampEvidence } from '../../modules/kamma/kamma-service.ts';

export async function runRecall() {
  if (!process.env.DATABASE_URL) throw new Error('Set DATABASE_URL before running recall.');
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query('BEGIN');
    const key = 'demo-lamp';
    await client.query(
      'INSERT INTO runtime.memories(id, question) VALUES ($1,$2) ON CONFLICT DO NOTHING',
      [key, 'Why does the lamp come on?'],
    );
    const {
      rows: [memory],
    } = await client.query('SELECT * FROM runtime.memories WHERE id=$1 FOR UPDATE', [key]);
    if (memory.resolved) {
      await client.query('COMMIT');
      return { status: 'already resolved', memory: key };
    }
    const count = memory.recalls + 1;
    const motivation = desire(count);
    const action = nextAction(motivation.formGoal);
    const result = action === 'READ' ? await readLampEvidence() : null;
    if (motivation.formGoal) {
      await client.query(
        'INSERT INTO runtime.goals(memory_id, description, completed_at) VALUES ($1,$2,now())',
        [key, 'Investigate: ' + memory.question],
      );
    }
    const cycle = {
      input: recall(memory.question),
      motivation,
      action,
      result,
      feeling: feedback(result !== null),
    };
    await client.query('UPDATE runtime.memories SET recalls=$2, resolved=$3 WHERE id=$1', [
      key,
      count,
      result !== null,
    ]);
    await client.query('INSERT INTO runtime.history(memory_id,cycle) VALUES ($1,$2)', [key, cycle]);
    await client.query('COMMIT');
    return cycle;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}
