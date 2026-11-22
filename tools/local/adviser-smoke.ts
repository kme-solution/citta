import { writeFile, mkdir } from 'node:fs/promises';
import { askCodex } from '../../src/modules/cetana/vaca-codex.ts';
const started = Date.now();
try {
  const reply = await askCodex(
    'Reply with exactly CITTA_ADVISER_OK. Do not run tools or inspect any files.',
    { name: 'Verification agent' },
    AbortSignal.timeout(120000),
  );
  if (reply.trim() !== 'CITTA_ADVISER_OK')
    throw Error('The actual adviser did not return the requested smoke response.');
  const result = {
    passed: true,
    adapter: 'actual local Codex CLI',
    durationMs: Date.now() - started,
  };
  await mkdir('artifacts/verification', { recursive: true });
  await writeFile('artifacts/verification/adviser-results.json', JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result));
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Adviser smoke failed.');
  process.exitCode = 1;
}
