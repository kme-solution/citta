import { resolve } from 'node:path';
import { loadIdentity } from '../modules/nama/nama-service.ts';
function integer(name: string, fallback: number, min: number, max: number) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < min || n > max) throw Error(`${name} must be ${min}..${max}`);
  return n;
}
const agentId = process.env.CITTA_AGENT_ID || 'local';
if (!/^[a-zA-Z0-9_-]{1,64}$/.test(agentId)) throw Error('Invalid CITTA_AGENT_ID');
const ollamaUrl = process.env.CITTA_OLLAMA_URL || 'http://127.0.0.1:11434';
const url = new URL(ollamaUrl);
if (!['127.0.0.1','localhost','[::1]'].includes(url.hostname) || url.protocol !== 'http:') throw Error('Ollama must be a local HTTP service');
const cognitionProvider=process.env.CITTA_COGNITION_PROVIDER || 'ollama';
if(!['ollama','codex'].includes(cognitionProvider))throw Error('CITTA_COGNITION_PROVIDER must be ollama or codex');
const codexTransport=process.env.CITTA_CODEX_TRANSPORT || 'app-server';
if(!['app-server','exec'].includes(codexTransport))throw Error('CITTA_CODEX_TRANSPORT must be app-server or exec');
export const config = {
  codexProgressTimeoutMs:integer('CITTA_CODEX_PROGRESS_TIMEOUT_MS',60000,10000,600000),
  codexTransport,codexHome:resolve('.local/state/codex',agentId,'home'),
  codexWorkRoot:resolve('.local/state/codex',agentId,'work'),codexBrokerTokenFile:resolve('.local/state/codex',agentId,'broker.token'),
  computerEnabled:process.env.CITTA_COMPUTER_ENABLED==='true',
  computerAutonomous:process.env.CITTA_COMPUTER_AUTONOMOUS==='true',
  computerPort:integer('CITTA_COMPUTER_PORT',4180,1024,65535),
  computerTokenFile:resolve('.local/state/computer.token'),computerImageRoot:resolve('.local/state/computer/frames'),
  cognitionProvider, codexModel:process.env.CITTA_CODEX_MODEL || undefined,
  agentId, databaseUrl: process.env.CITTA_DATABASE_URL || process.env.DATABASE_URL,
  profile: loadIdentity(process.env), port: integer('CITTA_PORT', 4173, 1024, 65535),
  temporalAddress: process.env.CITTA_TEMPORAL_ADDRESS || '127.0.0.1:7233',
  temporalNamespace: process.env.CITTA_TEMPORAL_NAMESPACE || 'default',
  ollamaUrl, model: process.env.CITTA_LOCAL_MODEL || 'qwen3:4b-instruct-2507-q4_K_M',
  modelThreads: integer('CITTA_MODEL_THREADS', 3, 1, 8),
  cognitionEnabled: process.env.CITTA_COGNITION_ENABLED === 'true',
  affectEnabled: process.env.CITTA_AFFECT_ENABLED !== 'false',
  inferenceTimeoutMs: integer('CITTA_INFERENCE_TIMEOUT_MS', 300000, 1000, 600000),
  internalIntervalMs: integer('CITTA_INTERNAL_INTERVAL_MS', 1000, 1000, 86400000),
  contactIntervalMs: integer('CITTA_CONTACT_INTERVAL_MS', 3600000, 60000, 86400000),
  hourlyWorkLimit: integer('CITTA_HOURLY_WORK_LIMIT', 12, 0, 120000),
  readRoot: resolve(process.env.CITTA_READ_ROOT || 'data/fixtures'),
  adviserEnabled: process.env.CITTA_ADVISER_ENABLED !== 'false'
};
export function requireDatabase() {
  if (!config.databaseUrl) throw Error('Set CITTA_DATABASE_URL or DATABASE_URL');
  return config.databaseUrl;
}
