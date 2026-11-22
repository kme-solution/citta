import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer,type RequestListener} from 'node:http';
import type {AddressInfo} from 'node:net';
import {chatJson} from '../src/infra/ollama/http.ts';
async function withServer(handler:RequestListener,run:(url:string)=>Promise<void>) {
  const server=createServer(handler);await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
  try{await run('http://127.0.0.1:'+(server.address() as AddressInfo).port);}finally{server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));}
}
test('local model transport sends JSON and preserves chunked Myanmar UTF-8',async()=>{
  await withServer(async(req,res)=>{let input='';for await(const chunk of req)input+=chunk;assert.deepEqual(JSON.parse(input),{text:'မြန်မာ'});const bytes=Buffer.from(JSON.stringify({text:'မင်္ဂလာပါ'}));res.writeHead(200,{'Content-Type':'application/json'});res.write(bytes.subarray(0,11));setImmediate(()=>res.end(bytes.subarray(11)));},async url=>assert.deepEqual(await chatJson(url,{text:'မြန်မာ'},AbortSignal.timeout(1000)),{text:'မင်္ဂလာပါ'}));
});
test('local model deadline aborts even while no response headers arrive',async()=>{
  await withServer(()=>{},async url=>{await assert.rejects(chatJson(url,{},AbortSignal.timeout(30)),error=>(error as Error).name==='AbortError');});
});
test('local model redirects cannot forward prompt data outside loopback',async()=>{
  await withServer((_req,res)=>{res.writeHead(302,{Location:'https://example.invalid/collect'});res.end();},async url=>{await assert.rejects(chatJson(url,{text:'synthetic'},AbortSignal.timeout(1000)),/HTTP 302/);});
  assert.throws(()=>chatJson('https://example.invalid',{},new AbortController().signal),/loopback/);
});
test('local model oversized response is rejected before parsing',async()=>{
  await withServer((_req,res)=>res.end('x'.repeat(1048577)),async url=>{await assert.rejects(chatJson(url,{},AbortSignal.timeout(1000)),/1 MiB/);});
});
test('local model truncated response is a failure instead of a successful result',async()=>{
  await withServer((_req,res)=>{res.writeHead(200);res.write('{"partial":');setImmediate(()=>res.destroy());},async url=>{await assert.rejects(chatJson(url,{},AbortSignal.timeout(1000)),/before its response completed/);});
});
