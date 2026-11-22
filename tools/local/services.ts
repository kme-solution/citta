import { spawn, type ChildProcess } from 'node:child_process';
import { mkdir, readFile, writeFile, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
const stateDir=resolve('.local/state');
await mkdir(stateDir,{recursive:true});
const marker=resolve(stateDir,'supervisor.pid');
const command=process.argv[2]||'start';
if (command==='stop') {
  try {
    const pid=Number(await readFile(marker,'utf8'));
    if(!Number.isInteger(pid)||pid<=1)throw Error('Invalid supervisor marker.');
    const args=await readFile(`/proc/${pid}/cmdline`,'utf8');
    if(!args.includes('tools/local/services.ts'))throw Error('Marker no longer identifies the Citta supervisor; no process was stopped.');
    process.kill(pid,'SIGTERM');console.log('Stop requested for the Citta supervisor.');
  }
  catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;else console.log('No Citta supervisor marker found.');}
} else {
  try {const pid=Number(await readFile(marker,'utf8'));process.kill(pid,0);throw Error('Citta supervisor is already running.');}
  catch(error){if(!['ENOENT','ESRCH'].includes((error as NodeJS.ErrnoException).code||''))throw error;}
  await writeFile(marker,String(process.pid),{flag:'wx'}).catch(async error=>{if(error.code!=='EEXIST')throw error;await writeFile(marker,String(process.pid));});
  let stopping=false;
  const children=new Set<ChildProcess>();
  const timers=new Set<ReturnType<typeof setTimeout>>();
  const launch=(name:string,args:string[])=> {
    if(stopping)return;
    const child=spawn(process.execPath,args,{stdio:'inherit',env:process.env});children.add(child);
    child.on('error',error=>console.error(name+': '+error.message));
    child.on('exit',(code,signal)=>{children.delete(child);if(!stopping){console.error(`${name} exited (${code??signal}); restarting in 5s.`);const timer=setTimeout(()=>{timers.delete(timer);launch(name,args);},5000);timers.add(timer);}});
  };
  async function stop() {
    if(stopping)return;stopping=true;
    for(const timer of timers)clearTimeout(timer);
    for(const child of children)child.kill('SIGTERM');
    const force=setTimeout(()=>{for(const child of children)child.kill('SIGKILL');},15000);force.unref();
    await unlink(marker).catch(()=>{});
  }
  process.once('SIGINT',()=>void stop());process.once('SIGTERM',()=>void stop());
  // External PostgreSQL/Ollama/Temporal have their own persistence and supervision.
  for(const name of ['server','worker','relay'])launch(name,['--import','tsx',`src/app/${name}.ts`]);
  console.log('Citta local services supervised. Ctrl+C stops only these processes.');
}
