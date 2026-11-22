import { realpath, stat } from 'node:fs/promises';
import { resolve, relative, isAbsolute } from 'node:path';
import type { Ability, Context } from '../../contracts/runtime.ts';
export function authorize(kind: Ability, ctx: Context, argument: string, adviserEnabled: boolean) {
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
