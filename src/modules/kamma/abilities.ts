import { operateComputer } from '../../infra/computer/desktop.ts';
import { open, realpath } from 'node:fs/promises';
import { constants } from 'node:fs';
import type { Work, Outcome } from '../../contracts/runtime.ts';
import { config } from '../../app/config.ts';
import { permittedFile, authorize } from '../sikkha/authorize.ts';
import { infer } from '../../infra/ollama/cognition.ts';
import { askCodex } from '../cetana/vaca-codex.ts';
export async function executeAbility(work: Work, signal: AbortSignal): Promise<Outcome> {
  authorize(work.kind, work.context, work.argument, config.adviserEnabled);
  if (signal.aborted) throw Error('Cancelled before execution.');
  if (work.kind === 'COMPUTER') return operateComputer(work, signal);
  if (work.kind === 'INFER') return infer(work.context, signal, work.id);
  if (work.kind === 'CONSULT_AI')
    return { ok: true, text: await askCodex(work.argument, work.context.profile, signal) };
  const target = await permittedFile(config.readRoot, work.argument);
  // O_NOFOLLOW guards a symlink replacement between resolution and open.
  const file = await open(target, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    if (process.platform === 'linux')
      await permittedFile(config.readRoot, await realpath('/proc/self/fd/' + file.fd));
    const info = await file.stat();
    if (!info.isFile() || info.size > 32768)
      throw Error('Source exceeds its permitted size or type.');
    const buffer = Buffer.alloc(32769);
    const { bytesRead } = await file.read(buffer, 0, buffer.length, 0);
    if (bytesRead > 32768) throw Error('Source grew beyond its permitted size.');
    const text = new TextDecoder('utf-8', { fatal: true }).decode(buffer.subarray(0, bytesRead));
    return { ok: true, text, usage: { source: work.argument, bytes: bytesRead } };
  } finally {
    await file.close();
  }
}
