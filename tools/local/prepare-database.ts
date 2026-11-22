import pg from 'pg';
import { writeFile } from 'node:fs/promises';
if (!process.env.DATABASE_URL) throw Error('Set DATABASE_URL in .env first.');
const source = new URL(process.env.DATABASE_URL);
const name = process.env.CITTA_DEV_DATABASE || 'citta_agent_dev';
if (!/^[a-z][a-z0-9_]{1,62}$/.test(name)) throw Error('Invalid isolated database name.');
const client=new pg.Client({connectionString:source.toString()});
await client.connect();
try {
  const {rows} = await client.query('SELECT 1 FROM pg_database WHERE datname=$1',[name]);
  if (!rows.length) await client.query(`CREATE DATABASE "${name}"`);
  source.pathname='/'+name;
  // Never overwrites a previous private runtime selection or the user's .env.
  await writeFile('.env.runtime',`CITTA_DATABASE_URL=${JSON.stringify(source.toString())}\n`,{flag:'wx',mode:0o600});
  console.log('Isolated database selected in private .env.runtime. No existing tables were changed.');
} catch(error) {
  if ((error as NodeJS.ErrnoException).code==='EEXIST') console.log('.env.runtime already exists; preserved without modification.');
  else throw error;
} finally {await client.end();}
