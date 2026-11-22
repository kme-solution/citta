import { readFile, writeFile, mkdir, chmod } from 'node:fs/promises';
import { dirname } from 'node:path';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { config } from '../../app/config.ts';
import type { CodexRequest, CodexResult, ConnectionState } from './app-server.ts';
export class CodexTransportFailure extends Error {
  readonly effectUncertain: boolean;
  constructor(message: string, effectUncertain: boolean) {
    super(message);
    this.name = 'CodexTransportFailure';
    this.effectUncertain = effectUncertain;
  }
}
export async function ensureCodexBrokerToken() {
  await mkdir(dirname(config.codexBrokerTokenFile), { recursive: true, mode: 0o700 });
  await writeFile(config.codexBrokerTokenFile, randomBytes(32).toString('hex'), {
    flag: 'wx',
    mode: 0o600,
  }).catch((error) => {
    if (error.code !== 'EEXIST') throw error;
  });
  await chmod(config.codexBrokerTokenFile, 0o600);
  return readToken();
}
async function readToken() {
  const value = (await readFile(config.codexBrokerTokenFile, 'utf8')).trim();
  if (!/^[a-f0-9]{64}$/.test(value)) throw Error('Codex broker token is invalid.');
  return value;
}
export async function validCodexBrokerToken(header: unknown) {
  if (typeof header !== 'string' || !/^Bearer [a-f0-9]{64}$/.test(header)) return false;
  try {
    const expected = Buffer.from('Bearer ' + (await readToken()));
    const actual = Buffer.from(header);
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
export async function requestCodex(
  request: CodexRequest,
  signal?: AbortSignal,
): Promise<CodexResult> {
  let token: string;
  try {
    token = await readToken();
  } catch {
    throw new CodexTransportFailure('Codex broker unavailable. Start the portal services.', false);
  }
  try {
    const deadline = AbortSignal.timeout(Math.min(request.timeoutMs + 30000, 660000));
    const response = await fetch(`http://127.0.0.1:${config.port}/internal/codex/generate`, {
      method: 'POST',
      redirect: 'error',
      signal: signal ? AbortSignal.any([signal, deadline]) : deadline,
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify(request),
    });
    const reader = response.body?.getReader();
    if (!reader) throw Error('Empty broker response.');
    const parts: Uint8Array[] = [];
    let bytes = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.length;
      if (bytes > 2 * 1024 * 1024) {
        await reader.cancel();
        throw Error('Codex broker output exceeded its bound.');
      }
      parts.push(value);
    }
    const data = JSON.parse(Buffer.concat(parts).toString('utf8'));
    if (!response.ok)
      throw new CodexTransportFailure(
        typeof data.error === 'string' ? data.error : 'Codex consideration failed.',
        data.effectUncertain !== false,
      );
    if (
      typeof data.output !== 'string' ||
      typeof data.threadId !== 'string' ||
      typeof data.turnId !== 'string'
    )
      throw Error('Invalid Codex broker response.');
    return data as CodexResult;
  } catch (error) {
    if (error instanceof CodexTransportFailure) throw error;
    throw new CodexTransportFailure(
      'Codex broker connection ended before confirmed output. Your context remains in Citta.',
      true,
    );
  }
}
let connectionCache:
  | {
      at: number;
      state: { ready: boolean; reason?: string; activeTurns?: ConnectionState['activeTurns'] };
    }
  | undefined;
export async function codexAvailability() {
  if (config.cognitionProvider !== 'codex' || config.codexTransport !== 'app-server')
    return { ready: true };
  if (connectionCache && Date.now() - connectionCache.at < 1000) return connectionCache.state;
  try {
    const r = await fetch(`http://127.0.0.1:${config.port}/api/codex`, {
      signal: AbortSignal.timeout(1500),
      redirect: 'error',
    });
    const s = (await r.json()) as ConnectionState;
    const ready = r.ok && s.available && s.connected && s.canConsider !== false;
    const state = { ready, reason: s.providerIssue || s.error, activeTurns: s.activeTurns };
    connectionCache = { at: Date.now(), state };
    return state;
  } catch {
    return { ready: false, reason: 'The local Codex connection is unavailable.' };
  }
}
export async function codexConnectionReady() {
  return (await codexAvailability()).ready;
}
