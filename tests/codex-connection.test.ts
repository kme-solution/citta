import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';

test('app-server protocol handles final completion, cancellation and isolated credentials (simulated provider)', async () => {
  const temporary = await mkdtemp(join(tmpdir(), 'citta-codex-protocol-'));
  const file = join(temporary, 'codex.mjs');
  await writeFile(
    file,
    `
 import readline from 'node:readline';
 let account=null;let next=0;const turns=new Map();
 const send=m=>process.stdout.write(JSON.stringify(m)+'\\n');
 readline.createInterface({input:process.stdin}).on('line',line=>{
  const m=JSON.parse(line);const p=m.params||{};const reply=result=>send({id:m.id,result});
  if(m.method==='initialize'){
   if(process.env.CITTA_DATABASE_URL||process.env.OPENAI_API_KEY)send({id:m.id,error:{message:'Credential isolation failed'}});
   else reply({serverInfo:{name:'test-protocol'}});
  }else if(m.method==='account/read')reply({account,requiresOpenaiAuth:true});
  else if(m.method==='account/login/start'){
   if(p.type==='apiKey'){account={type:'apiKey'};reply({type:'apiKey'});send({method:'account/updated',params:{authMode:'apikey'}});}
   else reply({loginId:'test-login',authUrl:'https://auth.openai.com/test-only'});
  }else if(m.method==='account/login/cancel')reply({});
  else if(m.method==='thread/start')reply({thread:{id:'thread-'+(++next)}});
  else if(m.method==='thread/unsubscribe')reply({status:'unsubscribed'});
  else if(m.method==='turn/start'){
   const id='turn-'+next;turns.set(p.threadId,id);
   send({method:'turn/started',params:{threadId:p.threadId,turn:{id,status:'inProgress'}}});
   if(!['wait-for-cancellation','hang-no-progress'].includes(p.input[0].text)){
    const status=p.input[0].text==='fail'?'failed':'completed';
    send({method:'item/completed',params:{threadId:p.threadId,item:{id:'answer',type:'agentMessage',phase:'final_answer',text:'final-result'}}});
    send({method:'turn/completed',params:{threadId:p.threadId,turn:{id,status,error:status==='failed'?{message:'simulated failure'}:null}}});
   }
   reply({turn:{id,status:'inProgress'}});
  }else if(m.method==='turn/interrupt'){
   reply({});send({method:'turn/completed',params:{threadId:p.threadId,turn:{id:turns.get(p.threadId),status:'interrupted'}}});
  }
 });
 `,
    { mode: 0o600 },
  );
  process.env.CITTA_AGENT_ID = 'protocol_' + process.pid;
  process.env.CITTA_CODEX_PATH = file;
  process.env.CITTA_CODEX_PROGRESS_TIMEOUT_MS = '10000';
  process.env.CITTA_DATABASE_URL = 'postgresql://127.0.0.1:1/protocol_unit_no_connection';
  process.env.OPENAI_API_KEY = 'unit-only-not-a-real-key';
  const { codexAppServer, trustedAuthUrl } = await import('../src/infra/codex/app-server.ts');
  const { config } = await import('../src/app/config.ts');
  const { pool } = await import('../src/infra/postgres/database.ts');
  try {
    assert.throws(() => trustedAuthUrl('https://example.invalid/login'), /Unexpected/);
    assert.throws(() => trustedAuthUrl('http://auth.openai.com/login'), /Unexpected/);
    assert.throws(() => trustedAuthUrl('https://user:pass@auth.openai.com/login'), /Unexpected/);
    const before = await codexAppServer.status();
    assert.equal(before.available, true);
    assert.equal(before.connected, false);
    const login = await codexAppServer.loginWithChatGPT();
    assert.equal(login.loginId, 'test-login');
    assert.ok((await codexAppServer.status()).pendingLogin);
    await codexAppServer.cancelLogin();
    assert.ok(!(await codexAppServer.status()).pendingLogin);
    assert.equal((await codexAppServer.loginWithKey('unit-key-not-real')).connected, true);
    const result = await codexAppServer.generate({
      prompt: 'fast-final-before-ack',
      timeoutMs: 3000,
    });
    assert.equal(result.output, 'final-result');
    assert.ok(result.turnId);
    await assert.rejects(codexAppServer.generate({ prompt: 'fail', timeoutMs: 3000 }));
    assert.equal((await codexAppServer.status()).available, true);
    const abort = new AbortController();
    const waiting = codexAppServer.generate(
      { prompt: 'wait-for-cancellation', timeoutMs: 3000 },
      abort.signal,
    );
    setTimeout(() => abort.abort(), 100);
    await assert.rejects(waiting, /cancelled|interrupted/);
    assert.equal(
      (await codexAppServer.generate({ prompt: 'after-cancellation', timeoutMs: 3000 })).output,
      'final-result',
    );
    await assert.rejects(
      codexAppServer.generate({ prompt: 'hang-no-progress', timeoutMs: 20000 }),
      /stopped making progress/,
    );
    const cooling = await codexAppServer.status();
    assert.equal(cooling.connected, true);
    assert.equal(cooling.canConsider, false);
    assert.ok(cooling.providerIssue);
    await assert.rejects(
      codexAppServer.generate({ prompt: 'must-not-dispatch-during-cooldown', timeoutMs: 3000 }),
      /stopped making progress/,
    );
  } finally {
    await codexAppServer.close();
    await pool.end();
    await rm(temporary, { recursive: true, force: true });
    await rm(dirname(config.codexHome), { recursive: true, force: true });
  }
});
