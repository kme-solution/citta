import {config} from '../../app/config.ts';
import {parseComputerCommand} from '../../infra/computer/desktop.ts';
import { realpath, stat } from 'node:fs/promises';
import { resolve, relative, isAbsolute } from 'node:path';
import type { Ability, Context } from '../../contracts/runtime.ts';
export function authorize(kind: Ability, ctx: Context, argument: string, adviserEnabled: boolean) {
  if(kind==='COMPUTER'){if(!config.computerEnabled)throw Error('Computer ability is disabled.');if(config.cognitionProvider!=='codex')throw Error('Computer vision requires the Codex cognition provider.');if(ctx.kind==='mental'&&!config.computerAutonomous)throw Error('Autonomous computer use is disabled.');if(!ctx.computerAvailable)throw Error('No approved computer session was retained in this context.');const command=parseComputerCommand(argument);if(command.action!=='observe'&&!ctx.computerScreen)throw Error('Observe the desktop before input.');}
  if (argument.length > 8000) throw Error('Ability arguments exceed the permitted limit.');
  if (kind === 'CONSULT_AI' && !adviserEnabled) throw Error('External advice is disabled.');
  if (kind === 'CONSULT_AI' && ctx.kind === 'mental') throw Error('Self-originated work cannot spend external advice without an operator request.');
  if (kind === 'READ' && (isAbsolute(argument) || !argument.trim() || argument.includes('\0'))) throw Error('Use a relative file path within the evidence directory.');
}
export async function permittedFile(root: string, input: string) {
  const base = await realpath(root);
  const target = await realpath(resolve(base,input));
  const rel = relative(base,target);
  if (rel === '..' || rel.startsWith('../') || isAbsolute(rel)) throw Error('Source is outside the permitted evidence directory.');
  const info = await stat(target);
  if (!info.isFile() || info.size > 32768) throw Error('Source must be a regular file no larger than 32 KB.');
  return target;
}
