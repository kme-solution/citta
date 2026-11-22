import type { FastifyInstance } from 'fastify';
import { realpath } from 'node:fs/promises';
import { dirname, basename } from 'node:path';
import { config } from './config.ts';
import { codexAppServer, type CodexRequest } from '../infra/codex/app-server.ts';
import { ensureCodexBrokerToken, validCodexBrokerToken } from '../infra/codex/portal-client.ts';
export async function registerCodexRoutes(app: FastifyInstance) {
  if (config.codexTransport === 'app-server') await ensureCodexBrokerToken();
  let authBusy = false;
  const status = async () =>
    config.codexTransport === 'app-server'
      ? { ...(await codexAppServer.status()), activeProvider: config.cognitionProvider }
      : {
          transport: 'exec',
          available: true,
          connected: false,
          activeProvider: config.cognitionProvider,
          error: 'Portal sign-in requires CITTA_CODEX_TRANSPORT=app-server.',
        };
  app.get('/api/codex', async (_, reply) => {
    reply.header('Cache-Control', 'no-store');
    return await status();
  });
  app.post<{ Body: { type: 'chatgpt' | 'apiKey'; apiKey?: string } }>(
    '/api/codex/login',
    {
      schema: {
        body: {
          type: 'object',
          additionalProperties: false,
          required: ['type'],
          properties: {
            type: { enum: ['chatgpt', 'apiKey'] },
            apiKey: { type: 'string', minLength: 20, maxLength: 512 },
          },
        },
      },
    },
    async (request, reply) => {
      reply.header('Cache-Control', 'no-store');
      if (config.codexTransport !== 'app-server')
        return reply
          .code(409)
          .send({ error: 'Select app-server transport in the private environment, then restart.' });
      if (authBusy)
        return reply.code(409).send({ error: 'A connection change is already in progress.' });
      if (
        request.body.type === 'apiKey' &&
        (typeof request.body.apiKey !== 'string' ||
          !request.body.apiKey.startsWith('sk-') ||
          /\s/.test(request.body.apiKey))
      )
        return reply.code(400).send({ error: 'Enter a valid OpenAI API key.' });
      authBusy = true;
      try {
        if ((await codexAppServer.status()).connected)
          return reply
            .code(409)
            .send({ error: 'Already connected. Disconnect before changing accounts.' });
        return request.body.type === 'chatgpt'
          ? await codexAppServer.loginWithChatGPT()
          : await codexAppServer.loginWithKey(request.body.apiKey!);
      } catch {
        return reply
          .code(503)
          .send({ error: 'Could not connect Codex. Check the CLI and try sign-in again.' });
      } finally {
        authBusy = false;
      }
    },
  );
  for (const operation of ['cancel', 'logout', 'reset-context'] as const) {
    app.post(
      '/api/codex/' + operation,
      { schema: { body: { type: 'object', additionalProperties: false } } },
      async (_, reply) => {
        reply.header('Cache-Control', 'no-store');
        if (config.codexTransport !== 'app-server')
          return reply
            .code(409)
            .send({ error: 'Portal connection controls require app-server transport.' });
        if (authBusy)
          return reply.code(409).send({ error: 'A connection change is already in progress.' });
        authBusy = true;
        try {
          if (operation === 'cancel') await codexAppServer.cancelLogin();
          else if (operation === 'reset-context') await codexAppServer.resetContext();
          else await codexAppServer.logout();
          return await status();
        } catch {
          return reply.code(503).send({
            error: 'Codex connection change failed. Refresh the connection status before retrying.',
          });
        } finally {
          authBusy = false;
        }
      },
    );
  }
  app.post<{ Body: CodexRequest }>(
    '/internal/codex/generate',
    {
      bodyLimit: 128 * 1024,
      schema: {
        body: {
          type: 'object',
          additionalProperties: false,
          required: ['prompt', 'timeoutMs'],
          properties: {
            prompt: { type: 'string', minLength: 1, maxLength: 60000 },
            schema: { type: 'object', additionalProperties: true },
            model: { type: 'string', minLength: 1, maxLength: 128 },
            imagePath: { type: 'string', maxLength: 2048 },
            timeoutMs: { type: 'integer', minimum: 1000, maximum: 600000 },
            actionId: { type: 'string', format: 'uuid' },
            scope: {
              type: 'object',
              additionalProperties: false,
              required: ['conversationId', 'profileVersion', 'contextKey'],
              properties: {
                conversationId: { type: 'string', format: 'uuid' },
                profileVersion: { type: 'string', minLength: 1, maxLength: 128 },
                contextKey: { type: 'string', minLength: 1, maxLength: 200 },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      reply.header('Cache-Control', 'no-store');
      if (
        config.codexTransport !== 'app-server' ||
        !(await validCodexBrokerToken(request.headers.authorization))
      )
        return reply
          .code(403)
          .send({ error: 'Invalid local Codex broker authorization.', effectUncertain: false });
      const abort = new AbortController();
      const cancel = () => {
        if (!reply.raw.writableEnded) abort.abort();
      };
      request.raw.once('aborted', cancel);
      reply.raw.once('close', cancel);
      try {
        const body = request.body;
        if (body.imagePath) {
          const root = await realpath(config.computerImageRoot);
          const image = await realpath(body.imagePath);
          if (dirname(image) !== root || !/\b[a-f0-9]{32}\.jpg$/.test(basename(image)))
            return reply
              .code(400)
              .send({ error: 'Invalid retained screenshot reference.', effectUncertain: false });
          body.imagePath = image;
        }
        const connection = await codexAppServer.status();
        if (!connection.available || !connection.connected)
          return reply.code(409).send({
            error: 'Connect Codex from the Connections page before continuing.',
            effectUncertain: false,
          });
        return await codexAppServer.generate(body, abort.signal);
      } catch (error) {
        const message =
          error instanceof Error &&
          /^(?:Codex |Connect Codex |The selected model )/.test(error.message)
            ? error.message
            : 'Codex did not finish this consideration. Check Connections before retrying.';
        return reply.code(503).send({ error: message, effectUncertain: true });
      } finally {
        request.raw.removeListener('aborted', cancel);
        reply.raw.removeListener('close', cancel);
      }
    },
  );
  app.addHook('preClose', async () => {
    await codexAppServer.close();
  });
}
