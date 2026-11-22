import assert from 'node:assert/strict';
import pg from 'pg';
import { randomUUID } from 'node:crypto';
import { spawn, type ChildProcess } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { Connection, Client } from '@temporalio/client';
const url = new URL(process.env.CITTA_DATABASE_URL || process.env.DATABASE_URL || '');
url.pathname = '/citta_agent_test';
const output = process.env.CITTA_AUTONOMY_OUTPUT || 'artifacts/verification/autonomy-results.json';
const agent = 'autonomy-' + randomUUID().slice(0, 8),
  port = 4179;
const env = {
  ...process.env,
  CITTA_DATABASE_URL: url.toString(),
  CITTA_AGENT_ID: agent,
  CITTA_PORT: String(port),
  CITTA_NAME: 'Autonomy verification',
  CITTA_AGE: '',
  CITTA_GENDER: '',
  CITTA_BACKGROUND: '',
  CITTA_OCCUPATION: '',
  CITTA_LOCATION: '',
  CITTA_LANGUAGE: 'en',
  CITTA_VALUES: 'Use evidence and respect operator attention',
  CITTA_GOALS: 'Understand permitted local evidence and share useful discoveries',
  CITTA_COGNITION_ENABLED: 'true',
  CITTA_ADVISER_ENABLED: 'false',
  CITTA_INTERNAL_INTERVAL_MS: '60000',
  CITTA_HOURLY_WORK_LIMIT: '12',
};
await mkdir('.local/state', { recursive: true });
await mkdir('artifacts/verification', { recursive: true });
const log = createWriteStream('.local/state/autonomy.log', { flags: 'w' }),
  children: ChildProcess[] = [];
const db = new pg.Client({ connectionString: url.toString() });
await db.connect();
const connection = await Connection.connect({
    address: process.env.CITTA_TEMPORAL_ADDRESS || '127.0.0.1:7233',
  }),
  temporal = new Client({
    connection,
    namespace: process.env.CITTA_TEMPORAL_NAMESPACE || 'default',
  });
const checks: string[] = [];
const report: Record<string, unknown> = {
  agent,
  scope:
    'Real Ollama cognition through Temporal and PostgreSQL, synthetic isolated identity; no recorded model fixture.',
};
const passed = (name: string) => {
  checks.push(name);
  console.log('PASS ' + name);
};
function launch(app: string) {
  const child = spawn(process.execPath, ['--import', 'tsx', `src/app/${app}.ts`], {
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout?.pipe(log, { end: false });
  child.stderr?.pipe(log, { end: false });
  children.push(child);
}
async function until<T>(read: () => Promise<T>, predicate: (value: T) => boolean, timeout = 30000) {
  const end = Date.now() + timeout;
  do {
    const value = await read();
    if (predicate(value)) return value;
    await delay(250);
  } while (Date.now() < end);
  throw Error('Autonomy verification timed out; inspect private autonomy.log.');
}
async function request(path: string, body?: unknown) {
  const response = await fetch(
    'http://127.0.0.1:' + port + path,
    body === undefined
      ? {}
      : {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
  );
  assert.ok(response.ok, `HTTP ${response.status}`);
  return response.json();
}
try {
  launch('server');
  launch('worker');
  launch('relay');
  await until(
    async () => {
      try {
        return await request('/api/health');
      } catch {
        return {};
      }
    },
    (h) => h.runner === 'ready',
  );
  const running = await until<pg.QueryResultRow>(
    async () =>
      (
        await db.query(
          "SELECT * FROM citta.actions WHERE agent_id=$1 AND kind='INFER' AND state='running' ORDER BY created_at LIMIT 1",
          [agent],
        )
      ).rows[0],
    Boolean,
  );
  assert.equal(
    Number(
      (
        await db.query(
          "SELECT count(*) FROM citta.observations WHERE agent_id=$1 AND kind='speech'",
          [agent],
        )
      ).rows[0].count,
    ),
    0,
  );
  passed(
    'an agent with no incoming messages originates an internal motive and dispatches real local cognition',
  );
  const conversationId = running.context.conversationId;
  const before = Date.now();
  const nameReceipt = await request('/api/messages', {
    conversationId,
    messageId: randomUUID(),
    text: 'What is your name? After answering, continue your earlier task.',
  });
  const nameReply = await until<pg.QueryResultRow>(
    async () =>
      (
        await db.query(
          "SELECT text,source FROM citta.messages WHERE agent_id=$1 AND role='citta' AND observation_id=$2",
          [agent, nameReceipt.observationId],
        )
      ).rows[0],
    Boolean,
    5000,
  );
  assert.equal(nameReply.source, 'local');
  assert.doesNotMatch(nameReply.text, /completed|finished/i);
  report.localReplyMs = Date.now() - before;
  assert.ok(Number(report.localReplyMs) < 2500);
  passed('local identity reply remains responsive during autonomous inference');
  const finished = await until(
    async () =>
      (
        await db.query('SELECT state,result,finished_at FROM citta.actions WHERE id=$1', [
          running.id,
        ])
      ).rows[0],
    (r) => !['queued', 'running'].includes(r.state),
    Math.max(240000, Number(process.env.CITTA_INFERENCE_TIMEOUT_MS || 180000) + 30000),
  );
  report.inference = finished;
  report.mentalActionsAtFirstCompletion = Number(
    (
      await db.query(
        "SELECT count(*) FROM citta.actions WHERE agent_id=$1 AND kind='INFER' AND context->>'kind'='mental' AND created_at<=$2",
        [agent, finished.finished_at],
      )
    ).rows[0].count,
  );
  assert.equal(
    report.mentalActionsAtFirstCompletion,
    1,
    'Only one internal inference may originate before its first completion',
  );
  assert.equal(finished.state, 'succeeded', JSON.stringify(finished.result));
  const decisions = await until(
    async () =>
      (
        await db.query(
          'SELECT decision FROM citta.decisions WHERE agent_id=$1 AND goal_id=$2 ORDER BY created_at',
          [agent, running.goal_id],
        )
      ).rows,
    (r) => r.some((x) => x.decision.action !== 'INFER'),
    30000,
  );
  report.autonomousDecisions = decisions;
  assert.ok(
    decisions.some((x) =>
      ['REFLECT', 'READ', 'INITIATE', 'ADOPT_INTEREST', 'PROPOSE_IMPROVEMENT'].includes(
        x.decision.action,
      ),
    ),
    JSON.stringify(decisions),
  );
  passed(
    'a real local-model result becomes a durable autonomous decision after an operator interruption',
  );
  assert.equal(
    Number(
      (
        await db.query(
          "SELECT count(*) FROM citta.actions WHERE agent_id=$1 AND kind='CONSULT_AI'",
          [agent],
        )
      ).rows[0].count,
    ),
    0,
  );
  passed('autonomous cognition does not route to external advice');
  if (process.env.CITTA_HUMAN_SCENARIOS === 'true') {
    const turns: Record<string, unknown>[] = [];
    report.humanConversation = turns;
    for (const text of [
      'remember Tomorrow I will give my first work presentation. I feel nervous.',
      'I am worried I will forget what to say in that presentation. Suggest one small practical step I can try.',
      'That sounds too general. Give me one concrete sentence I can practise saying now.',
      'I feel sad because a close friend moved away. I just want someone to listen.',
      'Good news: I got accepted into a weekend art class.',
      'That last reply was useless. Please speak plainly.',
      'I feel tired now. Let us pause this conversation and talk again later.',
    ]) {
      const started = Date.now(),
        messageId = randomUUID();
      const receipt = await request('/api/messages', { conversationId, messageId, text });
      const response = await until(
        async () =>
          (
            await db.query(
              "SELECT role,text,source FROM citta.messages WHERE agent_id=$1 AND observation_id=$2 AND role='citta' ORDER BY created_at",
              [agent, receipt.observationId],
            )
          ).rows,
        (r) => r.length > 0,
        660000,
      );
      const goal = (
        await db.query(
          'SELECT state FROM citta.goals WHERE agent_id=$1 AND observation_id=$2 ORDER BY created_at DESC LIMIT 1',
          [agent, receipt.observationId],
        )
      ).rows[0];
      assert.notEqual(goal?.state, 'exhausted', JSON.stringify(response));
      turns.push({ input: text, response, wallMs: Date.now() - started });
      console.log('OBSERVED human scenario ' + turns.length);
      await writeFile(output, JSON.stringify({ ...report, checks }, null, 2));
      assert.ok(
        !response.some((r: any) => /could not safely|unavailable|timed out|timeout/i.test(r.text)),
        JSON.stringify(response),
      );
    }
    assert.ok(
      /[A-Za-z]/.test(String((turns.at(-1)!.response as any[])[0].text)),
      'English input needs an actual English reply',
    );
    passed(
      'everyday worry, correction, sadness, good news, blunt feedback and rest message receive actual contextual replies; semantic review recorded separately',
    );
  }
} catch (error) {
  report.error = error instanceof Error ? error.message : String(error);
  throw error;
} finally {
  await writeFile(output, JSON.stringify({ ...report, checks }, null, 2));
  try {
    await temporal.workflow.getHandle('citta/' + agent).terminate('Autonomy verification teardown');
  } catch {}
  for (const child of children) if (child.exitCode === null) child.kill('SIGTERM');
  await Promise.race([
    Promise.all(
      children.map(
        (child) =>
          new Promise<void>((resolve) => {
            if (child.exitCode !== null) resolve();
            else child.once('exit', () => resolve());
          }),
      ),
    ),
    delay(10000),
  ]);
  for (const child of children) if (child.exitCode === null) child.kill('SIGKILL');
  log.end();
  await db.end();
  await connection.close();
}
