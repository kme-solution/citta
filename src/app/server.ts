import { registerCodexRoutes } from './codex-routes.ts';
import { codexAppServer } from '../infra/codex/app-server.ts';
import { ComputerFailure, desktopSession } from '../infra/computer/desktop.ts';
import { existsSync } from 'node:fs';
import { delimiter, join } from 'node:path';
import { codexExecutable } from '../modules/cetana/vaca-codex.ts';
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import { config } from './config.ts';
import { capabilities } from '../modules/kamma/registry.ts';
import type { ServerResponse } from 'node:http';
import { pool } from '../infra/postgres/database.ts';
import {
  initialize,
  ingest,
  control,
  getState,
  dashboardFeed,
  eventsAfter,
  markSeen,
  declineContact,
  messageHistory,
  reviewProposal,
  goalDetail,
  replyToGoal,
  Conflict,
  Missing,
  type ControlRequest,
  type ProposalReviewRequest,
} from '../infra/postgres/runtime-repository.ts';
const app = Fastify({
  logger: {
    level: 'info',
    redact: ['req.headers.authorization', 'req.headers.cookie', 'req.body.apiKey'],
  },
  bodyLimit: 24000,
});
const streams = new Set<ServerResponse>();
app.addHook('preClose', async () => {
  for (const stream of streams) stream.end();
  streams.clear();
});
const uuid = { type: 'string', format: 'uuid' };
const conversationQuery = {
  type: 'object',
  additionalProperties: false,
  properties: { conversationId: uuid },
};
await initialize();
app.addHook('onRequest', async (request, reply) => {
  const host = request.headers.host;
  if (!host || ![`127.0.0.1:${config.port}`, `localhost:${config.port}`].includes(host))
    return reply.code(403).send({ error: 'Invalid local host.' });
  if (!['GET', 'HEAD'].includes(request.method)) {
    const origin = request.headers.origin;
    if (
      origin &&
      ![`http://127.0.0.1:${config.port}`, `http://localhost:${config.port}`].includes(origin)
    )
      return reply.code(403).send({ error: 'Cross-origin writes are forbidden.' });
    if (request.headers['sec-fetch-site'] === 'cross-site')
      return reply.code(403).send({ error: 'Cross-site writes are forbidden.' });
  }
  reply.header('X-Content-Type-Options', 'nosniff').header('Referrer-Policy', 'no-referrer');
  reply.header(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'",
  );
});
app.setErrorHandler((error, request, reply) => {
  if (error instanceof Conflict) return reply.code(409).send({ error: error.message });
  if (error instanceof Missing) return reply.code(404).send({ error: error.message });
  const failure = error as Error & { validation?: { instancePath: string; message?: string }[] };
  if (failure.validation)
    return reply.code(400).send({
      error: 'Invalid request.',
      details: failure.validation.map((v) => v.instancePath + ' ' + v.message),
    });
  request.log.error({ message: failure.message }, 'Request failed');
  return reply.code(503).send({
    error:
      'The local service could not complete this request. Your accepted input remains durable; retry with the same message ID.',
  });
});
await registerCodexRoutes(app);
app.get('/api/health', async () => {
  await pool.query('SELECT 1');
  const {
    rows: [a],
  } = await pool.query('SELECT heartbeat_at,control FROM citta.agents WHERE id=$1', [
    config.agentId,
  ]);
  let cognition = config.cognitionEnabled ? 'unavailable' : 'disabled pending evaluation';
  if (
    config.cognitionProvider === 'codex' &&
    config.cognitionEnabled &&
    config.codexTransport === 'app-server'
  ) {
    const s = await codexAppServer.status();
    cognition = s.connected
      ? s.canConsider === false
        ? 'provider retry pending'
        : s.lastSuccessfulTurnAt
          ? 'ready'
          : 'connected; inference not verified'
      : 'connect from Connections';
  }
  if (
    config.cognitionProvider === 'codex' &&
    config.cognitionEnabled &&
    config.codexTransport === 'exec'
  ) {
    const file = codexExecutable();
    const available =
      existsSync(file) ||
      (process.env.PATH || '').split(delimiter).some((dir) => existsSync(join(dir, file)));
    cognition = available ? 'configured; authentication not checked' : 'CLI missing';
  }
  if (config.cognitionProvider === 'ollama')
    try {
      const r = await fetch(config.ollamaUrl + '/api/tags', { signal: AbortSignal.timeout(1500) });
      const data = (await r.json()) as { models?: { name: string }[] };
      if (r.ok && config.cognitionEnabled)
        cognition = data.models?.some((m) => m.name === config.model) ? 'ready' : 'model missing';
    } catch {}
  return {
    database: 'ready',
    runner:
      a?.heartbeat_at && Date.now() - new Date(a.heartbeat_at).getTime() < 15000
        ? 'ready'
        : 'unavailable',
    cognition,
    cognitionProvider: config.cognitionProvider,
    codexTransport: config.codexTransport,
    model:
      config.cognitionProvider === 'codex' ? config.codexModel || 'cli-configured' : config.model,
    control: a?.control,
  };
});
app.get<{ Querystring: { conversationId?: string } }>(
  '/api/state',
  { schema: { querystring: conversationQuery } },
  async (request, reply) => {
    reply.header('Cache-Control', 'no-store');
    return getState(request.query.conversationId);
  },
);
app.get<{ Querystring: { conversationId: string; before: string } }>(
  '/api/history',
  {
    schema: {
      querystring: {
        type: 'object',
        additionalProperties: false,
        required: ['conversationId', 'before'],
        properties: { conversationId: uuid, before: { type: 'string', pattern: '^[0-9]{1,18}$' } },
      },
    },
  },
  async (request, reply) => {
    reply.header('Cache-Control', 'no-store');
    return messageHistory(request.query.conversationId, request.query.before);
  },
);
app.get<{ Params: { id: string } }>(
  '/api/goals/:id',
  {
    schema: {
      params: {
        type: 'object',
        additionalProperties: false,
        required: ['id'],
        properties: { id: uuid },
      },
    },
  },
  async (request, reply) => {
    reply.header('Cache-Control', 'no-store');
    return goalDetail(request.params.id);
  },
);
app.post<{
  Params: { id: string };
  Body: { requestId: string; expectedVersion: number; text: string };
}>(
  '/api/goals/:id/reply',
  {
    schema: {
      params: {
        type: 'object',
        additionalProperties: false,
        required: ['id'],
        properties: { id: uuid },
      },
      body: {
        type: 'object',
        additionalProperties: false,
        required: ['requestId', 'expectedVersion', 'text'],
        properties: {
          requestId: uuid,
          expectedVersion: { type: 'integer', minimum: 1 },
          text: { type: 'string', minLength: 1, maxLength: 6000 },
        },
      },
    },
  },
  async (request, reply) => {
    const text = request.body.text.trim();
    if (!text) return reply.code(400).send({ error: 'Enter a reply.' });
    return replyToGoal(
      request.params.id,
      request.body.expectedVersion,
      request.body.requestId,
      text,
    );
  },
);
app.post<{
  Body: {
    conversationId: string;
    messageId: string;
    text: string;
    replyToContactId?: string;
    replyToMessageId?: string;
  };
}>(
  '/api/messages',
  {
    schema: {
      body: {
        type: 'object',
        additionalProperties: false,
        required: ['conversationId', 'messageId', 'text'],
        properties: {
          conversationId: uuid,
          messageId: uuid,
          replyToContactId: uuid,
          replyToMessageId: uuid,
          text: { type: 'string', minLength: 1, maxLength: 6000 },
        },
      },
    },
  },
  async (request, reply) => {
    const text = request.body.text.trim();
    if (!text) return reply.code(400).send({ error: 'Enter a message.' });
    const result = await ingest(
      request.body.conversationId,
      request.body.messageId,
      text,
      request.body.replyToContactId,
      undefined,
      request.body.replyToMessageId,
    );
    return reply.code(202).send(result);
  },
);
app.post<{ Body: ControlRequest }>(
  '/api/control',
  {
    schema: {
      body: {
        type: 'object',
        additionalProperties: false,
        required: ['requestId', 'operation', 'expectedVersion'],
        properties: {
          requestId: uuid,
          operation: { enum: ['pause', 'resume', 'stop', 'cancel', 'extend', 'quiet', 'unquiet'] },
          expectedVersion: { type: 'integer', minimum: 0 },
          goalId: uuid,
        },
      },
    },
  },
  async (request) => control(request.body),
);
app.get<{ Querystring: { filter?: 'all' | 'questions' | 'reports'; before?: string } }>(
  '/api/dashboard',
  {
    schema: {
      querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
          filter: { enum: ['all', 'questions', 'reports'] },
          before: { type: 'string', pattern: '^[0-9]{1,18}$' },
        },
      },
    },
  },
  async (request) => dashboardFeed(request.query.filter, request.query.before),
);
app.post<{ Body: { conversationId: string } }>(
  '/api/seen',
  {
    schema: {
      body: {
        type: 'object',
        additionalProperties: false,
        required: ['conversationId'],
        properties: { conversationId: uuid },
      },
    },
  },
  async (request) => {
    await markSeen(request.body.conversationId);
    return { ok: true };
  },
);
app.post<{ Body: { contactId: string } }>(
  '/api/contact/decline',
  {
    schema: {
      body: {
        type: 'object',
        additionalProperties: false,
        required: ['contactId'],
        properties: { contactId: uuid },
      },
    },
  },
  async (request) => declineContact(request.body.contactId),
);
app.post<{ Body: ProposalReviewRequest }>(
  '/api/proposals/review',
  {
    schema: {
      body: {
        type: 'object',
        additionalProperties: false,
        required: ['requestId', 'proposalId', 'expectedVersion', 'decision'],
        properties: {
          requestId: uuid,
          proposalId: uuid,
          expectedVersion: { type: 'integer', minimum: 1 },
          decision: { enum: ['accepted', 'declined'] },
        },
      },
    },
  },
  async (request) => reviewProposal(request.body),
);
app.get('/api/catalog', async () => {
  const [citta, cetasikas, functions] = await Promise.all(
    ['citta-types', 'cetasikas', 'functions'].map((name) =>
      readFile(new URL('../../data/catalog/v1/' + name + '.json', import.meta.url), 'utf8').then(
        (text) => JSON.parse(text),
      ),
    ),
  );
  return { citta, cetasikas, functions, myanmarReview: 'pending' };
});
app.get('/api/computer', async () => {
  try {
    return await desktopSession('status');
  } catch {
    return {
      enabled: config.computerEnabled,
      connected: false,
      error: 'Desktop driver unavailable.',
    };
  }
});
app.post<{ Params: { operation: 'connect' | 'disconnect' } }>(
  '/api/computer/:operation',
  {
    schema: {
      params: {
        type: 'object',
        additionalProperties: false,
        required: ['operation'],
        properties: { operation: { enum: ['connect', 'disconnect'] } },
      },
      body: { type: 'object', additionalProperties: false },
    },
  },
  async (request, reply) => {
    const host = request.headers.host;
    if (
      !['127.0.0.1', 'localhost', '[::1]'].includes(request.hostname) ||
      (request.headers.origin && request.headers.origin !== `http://${host}`)
    )
      return reply.code(403).send({ error: 'Desktop controls require a local portal origin.' });
    try {
      return await desktopSession(request.params.operation);
    } catch (error) {
      return reply.code(503).send({
        error:
          error instanceof ComputerFailure
            ? error.message
            : 'Desktop session unavailable. Check the local driver.',
      });
    }
  },
);
app.get('/api/capabilities', async () => ({
  abilities: capabilities,
  cognitionEnabled: config.cognitionEnabled,
  cognitionProvider: config.cognitionProvider,
  adviserEnabled: config.adviserEnabled,
  computerEnabled: config.computerEnabled,
  computerAutonomous: config.computerAutonomous,
}));
app.get<{ Querystring: { after?: string } }>(
  '/api/events',
  {
    schema: {
      querystring: {
        type: 'object',
        additionalProperties: false,
        properties: { after: { type: 'string', pattern: '^[0-9]{1,18}$' } },
      },
    },
  },
  async (request, reply) => {
    const header = request.headers['last-event-id'];
    let after =
      typeof header === 'string' && /^\d{1,18}$/.test(header) ? header : request.query.after;
    if (!after) {
      const {
        rows: [cursor],
      } = await pool.query(
        'SELECT COALESCE(MAX(ordinal),0)::text AS ordinal FROM citta.events WHERE agent_id=$1',
        [config.agentId],
      );
      after = cursor.ordinal;
    }
    reply.hijack();
    streams.add(reply.raw);
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    let closed = false;
    reply.raw.on('close', () => {
      closed = true;
      streams.delete(reply.raw);
    });
    reply.raw.write('retry: 2000\n\n');
    try {
      while (!closed) {
        const events = await eventsAfter(after!);
        for (const e of events) {
          if (closed) break;
          const writable = reply.raw.write(
            `id: ${e.ordinal}\nevent: change\ndata: ${JSON.stringify(e)}\n\n`,
          );
          after = String(e.ordinal);
          if (!writable) {
            closed = true;
            break;
          }
        }
        if (!events.length) reply.raw.write(': heartbeat\n\n');
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch {
      if (!closed) reply.raw.write('event: unavailable\ndata: {}\n\n');
    } finally {
      reply.raw.end();
    }
  },
);
await app.register(fastifyStatic, {
  root: fileURLToPath(new URL('../../dist/portal/', import.meta.url)),
  wildcard: false,
});
app.setNotFoundHandler((request, reply) =>
  request.url.startsWith('/api/')
    ? reply.code(404).send({ error: 'Not found.' })
    : reply.sendFile('index.html'),
);
for (const signal of ['SIGINT', 'SIGTERM'] as const)
  process.once(signal, () => {
    void app.close().then(() => pool.end());
  });
await app.listen({ host: '127.0.0.1', port: config.port });
