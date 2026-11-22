import assert from 'node:assert/strict';
import pg from 'pg';
import { randomUUID } from 'node:crypto';
import { spawn, execFile, type ChildProcess } from 'node:child_process';
import { promisify } from 'node:util';
import { createWriteStream } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { Connection, Client } from '@temporalio/client';
const url = new URL(process.env.CITTA_DATABASE_URL || process.env.DATABASE_URL || '');
url.pathname = '/citta_agent_test';
const agent = 'recovery-' + randomUUID().slice(0, 8),
  port = 4178,
  conversationId = randomUUID();
const env = {
  ...process.env,
  CITTA_DATABASE_URL: url.toString(),
  CITTA_AGENT_ID: agent,
  CITTA_PORT: String(port),
  CITTA_NAME: 'Recovery verification',
  CITTA_AGE: '',
  CITTA_GENDER: '',
  CITTA_BACKGROUND: '',
  CITTA_OCCUPATION: '',
  CITTA_LOCATION: '',
  CITTA_LANGUAGE: '',
  CITTA_VALUES: '',
  CITTA_GOALS: '',
  CITTA_COGNITION_ENABLED: 'false',
  CITTA_ADVISER_ENABLED: 'false',
};
await mkdir('.local/state', { recursive: true });
await mkdir('artifacts/verification', { recursive: true });
const log = createWriteStream('.local/state/recovery.log', { flags: 'w' }),
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
const base = 'http://127.0.0.1:' + port,
  execute = promisify(execFile),
  checks: string[] = [];
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
  return child;
}
async function stop(child: ChildProcess) {
  child.kill('SIGTERM');
  await Promise.race([
    new Promise<void>((resolve) => {
      if (child.exitCode !== null) resolve();
      else child.once('exit', () => resolve());
    }),
    delay(7000).then(() => {
      throw Error('Service did not stop gracefully.');
    }),
  ]);
}
async function until<T>(read: () => Promise<T>, predicate: (value: T) => boolean, timeout = 20000) {
  const end = Date.now() + timeout;
  do {
    try {
      const value = await read();
      if (predicate(value)) return value;
    } catch {}
    await delay(100);
  } while (Date.now() < end);
  throw Error('Recovery verification timed out; inspect private recovery.log.');
}
async function request(path: string, body?: unknown) {
  const response = await fetch(
    base + path,
    body === undefined
      ? {}
      : {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
  );
  const data = await response.json();
  assert.ok(response.ok, `HTTP ${response.status}`);
  return data;
}
const state = () => request('/api/state?conversationId=' + conversationId);
const input = (text: string, messageId = randomUUID()) =>
  request('/api/messages', { conversationId, messageId, text });
let server: ChildProcess | undefined, worker: ChildProcess | undefined;
try {
  server = launch('server');
  worker = launch('worker');
  launch('relay');
  await until(
    () => request('/api/health'),
    (h) => h.runner === 'ready',
  );
  const initial = await temporal.workflow.getHandle('citta/' + agent).describe();
  let snapshot = await state();
  await request('/api/control', {
    requestId: randomUUID(),
    operation: 'pause',
    expectedVersion: snapshot.agent.control_version,
  });
  const firstId = randomUUID();
  await input('remember worker restart first note', firstId);
  await stop(worker);
  await input('remember worker restart second note');
  await input('/resume');
  worker = launch('worker');
  await until(
    state,
    (s) => s.memories.filter((m: any) => m.content.startsWith('worker restart')).length === 2,
  );
  assert.equal(
    (await temporal.workflow.getHandle('citta/' + agent).describe()).runId,
    initial.runId,
  );
  assert.equal((await input('remember worker restart first note', firstId)).duplicate, true);
  passed(
    'worker restart keeps the same workflow owner and drains durable accepted input exactly once',
  );
  const stream = await fetch(base + '/api/events');
  assert.equal(stream.status, 200);
  const reader = stream.body!.getReader();
  await reader.read();
  const before = Date.now();
  await stop(server);
  assert.ok(Date.now() - before < 5000);
  await reader.cancel().catch(() => {});
  server = launch('server');
  await until(
    state,
    (s) => s.memories.filter((m: any) => m.content.startsWith('worker restart')).length === 2,
  );
  passed('server closes an active SSE stream gracefully and restarts with unchanged history');
  await temporal.workflow
    .getHandle('citta/' + agent)
    .terminate('Test-owned explicit closed-owner recovery');
  const pending = await input('remember after explicit owner recovery');
  await delay(1200);
  assert.equal(
    (await db.query('SELECT state FROM citta.observations WHERE id=$1', [pending.observationId]))
      .rows[0].state,
    'pending',
  );
  const recoveryId = randomUUID();
  await execute(
    process.execPath,
    ['--import', 'tsx', 'tools/local/recover-workflow.ts', recoveryId],
    { env },
  );
  await until(state, (s) =>
    s.memories.some((m: any) => m.content === 'after explicit owner recovery'),
  );
  const generation = (await db.query('SELECT generation FROM citta.agents WHERE id=$1', [agent]))
    .rows[0].generation;
  assert.equal(String(generation), '2');
  await execute(
    process.execPath,
    ['--import', 'tsx', 'tools/local/recover-workflow.ts', recoveryId],
    { env },
  );
  assert.equal(
    String(
      (await db.query('SELECT generation FROM citta.agents WHERE id=$1', [agent])).rows[0]
        .generation,
    ),
    '2',
  );
  passed(
    'closed workflow recovery advances one ownership generation and is idempotent after an uncertain result',
  );
  Object.assign(process.env, env);
  const { cycle } = await import('../../src/modules/vithi/cycle.ts');
  const { pool } = await import('../../src/infra/postgres/database.ts');
  try {
    const before = (
      await db.query(
        'SELECT domain_version,decision_sequence,generation FROM citta.agents WHERE id=$1',
        [agent],
      )
    ).rows[0];
    assert.equal((await cycle(randomUUID(), '1')).fenced, true);
    const after = (
      await db.query(
        'SELECT domain_version,decision_sequence,generation FROM citta.agents WHERE id=$1',
        [agent],
      )
    ).rows[0];
    assert.deepEqual(after, before);
    passed('a stale ownership generation cannot commit new domain decisions');
  } finally {
    await pool.end();
  }
  await writeFile(
    'artifacts/verification/recovery-results.json',
    JSON.stringify(
      {
        checks,
        scope:
          'Actual service/Temporal restarts against an isolated test-owned agent; no user database or service was stopped.',
      },
      null,
      2,
    ),
  );
} finally {
  try {
    await temporal.workflow.getHandle('citta/' + agent).terminate('Recovery verification teardown');
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
