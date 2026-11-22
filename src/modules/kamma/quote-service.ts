import { readFile } from 'node:fs/promises';
import type { Observation } from '../dvara/dvara-service.ts';

export async function readQuoteFile(
  file: 'quote-draft.txt' | 'deployment-notes.txt',
): Promise<Observation> {
  const location = new URL('../../../data/fixtures/' + file, import.meta.url);
  return { kind: 'content', source: file, text: (await readFile(location, 'utf8')).trim() };
}

export function consultQuotePartner(): Observation {
  return {
    kind: 'speech',
    source: 'scripted quote partner',
    text: 'Check the deployment notes for the estimate.',
  };
}
