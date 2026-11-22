import pg from 'pg';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { requireDatabase } from '../../src/app/config.ts';
const client = new pg.Client({connectionString:requireDatabase()});
await client.connect();
try {
  await client.query('SELECT pg_advisory_lock(72478231)');
  await client.query('CREATE SCHEMA IF NOT EXISTS citta');
  await client.query('CREATE TABLE IF NOT EXISTS citta.migrations(name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())');
  // Prototype migrations are deliberately excluded: their tables/data are independent.
  const names = (await readdir(new URL('../../migrations/',import.meta.url))).filter(n=>/^\d{3,}_.*\.sql$/.test(n)&&Number(n.split('_')[0])>=3).sort();
  for (const name of names) {
    const sql = await readFile(new URL('../../migrations/'+name,import.meta.url),'utf8');
    const checksum = createHash('sha256').update(sql).digest('hex');
    const {rows:[old]} = await client.query('SELECT checksum FROM citta.migrations WHERE name=$1',[name]);
    if (old) { if (old.checksum!==checksum) throw Error('Applied migration checksum changed: '+name); continue; }
    await client.query('BEGIN');
    try {await client.query(sql);await client.query('INSERT INTO citta.migrations(name,checksum) VALUES($1,$2)',[name,checksum]);await client.query('COMMIT');console.log('Applied '+name);}
    catch(e){await client.query('ROLLBACK');throw e;}
  }
} finally { await client.query('SELECT pg_advisory_unlock(72478231)'); await client.end(); }
