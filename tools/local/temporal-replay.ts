import { Worker } from '@temporalio/worker';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const path=process.argv[2];if(!path)throw Error('Supply a Temporal history JSON file exported through the Temporal CLI.');
await Worker.runReplayHistory({workflowsPath:fileURLToPath(new URL('../../src/modules/vithi/workflow.ts',import.meta.url))},JSON.parse(await readFile(path,'utf8')));
console.log('Temporal workflow history replay completed. No live activities were invoked.');
