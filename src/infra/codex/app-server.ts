import {workingThread,saveWorkingThread,resetWorkingThreads,type WorkingScope} from './thread-repository.ts';
import {spawn,type ChildProcessWithoutNullStreams} from 'node:child_process';
import {mkdir,mkdtemp,rm,chmod} from 'node:fs/promises';
import {join} from 'node:path';
import {config} from '../../app/config.ts';
import {codexExecutable,codexEnvironment} from '../../modules/cetana/vaca-codex.ts';
export interface CodexRequest {prompt:string;schema?:unknown;model?:string;imagePath?:string;timeoutMs:number;scope?:WorkingScope;actionId?:string}
export interface CodexResult {output:string;threadId:string;turnId:string}
interface Waiter {resolve:(data:any)=>void;reject:(error:Error)=>void;timer:ReturnType<typeof setTimeout>}
interface Turn {threadId:string;turnId?:string;text:string;resolve:(result:CodexResult)=>void;reject:(error:Error)=>void;aborted:boolean;finished:boolean;actionId?:string;phase:string;startedAt:number;updatedAt:number;interrupting?:Promise<void>}
export interface ConnectionState {transport:'app-server';available:boolean;connected:boolean;accountType?:string;plan?:string;pendingLogin?:{loginId:string;authUrl:string};loginError?:string;lastSuccessfulTurnAt?:string;error?:string;canConsider?:boolean;providerIssue?:string;retryAt?:string;activeTurns?:{actionId?:string;phase:string;startedAt:string;updatedAt:string}[]}
function safeError(message:unknown):Error {
 const text=typeof message==='string'?message:'';
 if(/unauthorized|authentication|not (?:logged|signed) in|\b401\b/i.test(text))return Error('Connect Codex from the Connections page.');
 if(/quota|rate.limit|usage.limit|\b429\b/i.test(text))return Error('Codex usage or rate limit reached.');
 if(/model.*(?:not supported|not found)|unsupported.*effort|invalid_json_schema/i.test(text))return Error('The selected model or proposal schema was rejected.');
 return Error('Codex app-server request failed. Check connection and CLI compatibility.');
}
export function trustedAuthUrl(value:unknown):string {
 if(typeof value!=='string')throw Error('Codex did not return a sign-in URL.');
 const u=new URL(value);
 if(u.protocol!=='https:'||!['auth.openai.com','auth0.openai.com','chatgpt.com'].includes(u.hostname)||u.username||u.password)throw Error('Unexpected authorization URL.');
 return u.toString();
}
class CodexAppServer {
 private child?:ChildProcessWithoutNullStreams;
 private starting?:Promise<void>;
 private sequence=0;
 private waiters=new Map<number,Waiter>();
 private turns=new Map<string,Turn>();
 private buffer='';
 private login?:{loginId:string;authUrl:string};
 private loginError?:string;
 private loginOutcomes=new Map<string,boolean>();
 private lastSuccess?:string;
 private statusCache?:{at:number;state:ConnectionState};
 private statusPending?:Promise<ConnectionState>;
 private retryUntil=0;
 private providerIssue?:string;
 private shuttingDown=false;
 private authEpoch=0;
 private changingConnection=false;
 private loadedThreads=new Set<string>();
 private scopes=new Map<string,Promise<void>>();
 private send(message:unknown){if(!this.child?.stdin.writable)throw Error('Codex app-server is disconnected.');this.child.stdin.write(JSON.stringify(message)+'\n');}
 private fail(error:Error){
  for(const w of this.waiters.values()){clearTimeout(w.timer);w.reject(error);}this.waiters.clear();
  for(const t of this.turns.values())t.reject(error);this.turns.clear();
  this.child=undefined;this.loadedThreads.clear();this.buffer='';this.statusCache=undefined;this.login=undefined;
 }
 private receive(message:any){
  if(message.method&&message.id!==undefined){
   // No hidden Codex tool authority: reject all tool/approval requests.
   if(/requestApproval$/.test(message.method))this.send({id:message.id,result:{decision:'decline'}});
   else this.send({id:message.id,error:{code:-32601,message:'Citta owns host tools and permissions.'}});
   return;
  }
  if(message.id!==undefined){const w=this.waiters.get(message.id);if(!w)return;this.waiters.delete(message.id);clearTimeout(w.timer);message.error?w.reject(safeError(message.error.message)):w.resolve(message.result);return;}
  const p=message.params||{};
  if(message.method==='account/login/completed'){
   if(typeof p.loginId==='string'){this.loginOutcomes.set(p.loginId,!!p.success);if(this.loginOutcomes.size>20)this.loginOutcomes.delete(this.loginOutcomes.keys().next().value!);}
   if(this.login?.loginId===p.loginId){this.login=undefined;this.loginError=p.success?undefined:'Sign-in was not completed. Try connecting again.';}this.statusCache=undefined;
  }
  if(message.method==='account/updated'){this.statusCache=undefined;this.authEpoch++;}
  if(['thread/closed','thread/archived'].includes(message.method))this.loadedThreads.delete(p.threadId);
  const turn=this.turns.get(p.threadId);if(!turn)return;
  if(message.method==='error'){
   this.providerIssue=safeError(p.error?.message).message;
   if(p.willRetry)turn.phase='provider_retry';
   else this.retryUntil=Date.now()+30000;
   this.statusCache=undefined;
  }else if(message.method.startsWith('item/')){
   turn.updatedAt=Date.now();
   if(message.method==='item/agentMessage/delta')turn.phase='responding';
   else if(message.method.startsWith('item/reasoning/'))turn.phase='reasoning';
  }
  if(message.method==='turn/started'){turn.turnId=p.turn?.id;if(turn.aborted&&turn.turnId)void this.stopTurn(turn);}
  if(message.method==='item/completed'&&p.item?.type==='agentMessage'&&typeof p.item.text==='string'){
   if(Buffer.byteLength(p.item.text)>1024*1024){turn.reject(Error('Codex final output exceeded its bound.'));return;}
   if(p.item.phase!=='commentary')turn.text=p.item.text;
  }
  if(message.method==='turn/completed'){
   turn.finished=true;this.turns.delete(turn.threadId);
   const last=(p.turn?.items||[]).filter((item:any)=>item.type==='agentMessage'&&item.phase!=='commentary'&&typeof item.text==='string').at(-1);
   const output=last?.text||turn.text;
   if(turn.aborted||p.turn?.status!=='completed')turn.reject(p.turn?.status==='interrupted'?Error('Codex consideration was interrupted.'):safeError(p.turn?.error?.message));
   else if(!output?.trim()||Buffer.byteLength(output)>1024*1024)turn.reject(Error('Codex returned missing or oversized final output.'));
   else{this.lastSuccess=new Date().toISOString();this.statusCache=undefined;turn.resolve({output:output.trim(),threadId:turn.threadId,turnId:p.turn.id});}
  }
 }
 private rpc(method:string,params:unknown,timeout=15000):Promise<any>{
  return new Promise((resolve,reject)=>{
   const id=++this.sequence;const timer=setTimeout(()=>{this.waiters.delete(id);reject(Error('Codex app-server protocol request timed out.'));},timeout);
   this.waiters.set(id,{resolve,reject,timer});try{this.send({id,method,params});}catch(e){clearTimeout(timer);this.waiters.delete(id);reject(e);}
  });
 }
 async start(){
  if(this.shuttingDown)throw Error('Codex app-server is shutting down.');
  if(this.starting)return this.starting;if(this.child)return;
  this.starting=(async()=>{
   await mkdir(config.codexHome,{recursive:true,mode:0o700});await mkdir(config.codexWorkRoot,{recursive:true,mode:0o700});await chmod(config.codexHome,0o700);await chmod(config.codexWorkRoot,0o700);
   const file=codexExecutable();const script=/\.m?js$/i.test(file);
   const args=['app-server','--listen','stdio://','-c','cli_auth_credentials_store="file"','-c','features.shell_tool=false','-c','web_search="disabled"','-c','mcp_servers={}'];
   const env:NodeJS.ProcessEnv={...codexEnvironment(),CODEX_HOME:config.codexHome};delete env.OPENAI_API_KEY;delete env.OPENAI_BASE_URL;
   const child=spawn(script?process.execPath:file,script?[file,...args]:args,{cwd:config.codexWorkRoot,env,stdio:['pipe','pipe','pipe'],windowsHide:true});this.child=child;
   child.stdin.on('error',()=>{});child.stderr.on('data',()=>{}); // Raw stderr can contain auth URLs or prompt material.
   child.on('error',()=>{if(this.child===child)this.fail(Error('Codex app-server could not start. Check CITTA_CODEX_PATH.'));});
   child.on('close',()=>{if(this.child===child)this.fail(Error('Codex app-server closed; reconnect or retry explicitly.'));});
   child.stdout.setEncoding('utf8');child.stdout.on('data',(chunk:string)=>{
    if(this.child!==child)return;this.buffer+=chunk;
    if(Buffer.byteLength(this.buffer)>2*1024*1024){child.kill();this.fail(Error('Codex protocol output exceeded its bound.'));return;}
    let newline:number;while((newline=this.buffer.indexOf('\n'))>=0){const line=this.buffer.slice(0,newline);this.buffer=this.buffer.slice(newline+1);if(!line.trim())continue;try{this.receive(JSON.parse(line));}catch{child.kill();this.fail(Error('Codex returned invalid protocol output.'));break;}}
   });
   try{await this.rpc('initialize',{clientInfo:{name:'citta',title:'Citta',version:'1.0.0'}});this.send({method:'initialized',params:{}});}catch(e){child.kill();if(this.child===child)this.fail(Error('Codex app-server initialization failed.'));throw e;}
  })();
  try{await this.starting;}finally{this.starting=undefined;}
 }
 private connectionState(state:ConnectionState):ConnectionState{
  const cooling=Date.now()<this.retryUntil;
  return {...state,canConsider:state.connected&&!cooling&&!this.changingConnection,providerIssue:cooling?this.providerIssue:undefined,retryAt:cooling?new Date(this.retryUntil).toISOString():undefined,activeTurns:[...this.turns.values()].map(t=>({actionId:t.actionId,phase:t.phase,startedAt:new Date(t.startedAt).toISOString(),updatedAt:new Date(t.updatedAt).toISOString()}))};
 }
 async status():Promise<ConnectionState>{
  if(this.statusCache&&Date.now()-this.statusCache.at<3000)return this.connectionState(this.statusCache.state);
  if(this.statusPending)return this.connectionState(await this.statusPending);
  this.statusPending=(async():Promise<ConnectionState>=>{try{await this.start();const data=await this.rpc('account/read',{refreshToken:false},5000);const state:ConnectionState={transport:'app-server',available:true,connected:!this.changingConnection&&(!!data.account||data.requiresOpenaiAuth===false),accountType:data.account?.type,plan:data.account?.planType,pendingLogin:this.login,loginError:this.loginError,lastSuccessfulTurnAt:this.lastSuccess};this.statusCache={at:Date.now(),state};return state;}catch{return {transport:'app-server',available:false,connected:false,error:'Codex app-server unavailable. Check the configured CLI.'};}})();
  try{return this.connectionState(await this.statusPending);}finally{this.statusPending=undefined;}
 }
 async loginWithChatGPT(){
  await this.start();await this.cancelLogin();this.loginError=undefined;
  const data=await this.rpc('account/login/start',{type:'chatgpt'});
  const authUrl=trustedAuthUrl(data.authUrl);if(typeof data.loginId!=='string')throw Error('Codex did not return a login session.');
  if(!this.loginOutcomes.has(data.loginId))this.login={loginId:data.loginId,authUrl};else if(!this.loginOutcomes.get(data.loginId))this.loginError='Sign-in was not completed. Try again.';this.statusCache=undefined;
  return {loginId:data.loginId,authUrl};
 }
 async loginWithKey(apiKey:string){await this.start();await this.cancelLogin();await this.rpc('account/login/start',{type:'apiKey',apiKey});this.loginError=undefined;this.statusCache=undefined;return this.status();}
 async cancelLogin(){if(this.login){const loginId=this.login.loginId;await this.rpc('account/login/cancel',{loginId});this.login=undefined;}this.statusCache=undefined;}
 private async stopTurn(turn:Turn){
  if(turn.finished||!turn.turnId)return;
  if(!turn.interrupting)turn.interrupting=(async()=>{
   try{
    await this.rpc('turn/interrupt',{threadId:turn.threadId,turnId:turn.turnId},3000);
    const until=Date.now()+3000;
    while(!turn.finished&&this.child&&Date.now()<until)await new Promise(resolve=>setTimeout(resolve,25));
    if(!turn.finished&&this.child)throw Error('Interruption did not reach a terminal event.');
   }
   catch{const child=this.child;this.fail(Error('Codex interruption was not acknowledged; the local connection was reset.'));child?.kill('SIGTERM');}
  })();
  await turn.interrupting;
 }
 private async unloadWorkingThreads(){
  const threads=[...this.loadedThreads];this.loadedThreads.clear();
  await Promise.allSettled(threads.map(threadId=>this.rpc('thread/unsubscribe',{threadId},3000)));
 }
 private async interruptAll(){
  for(const t of this.turns.values()){
   t.aborted=true;t.reject(Error('Codex connection or working context changed.'));
   if(t.turnId)await this.stopTurn(t);
  }
 }
 async resetContext(){
  this.changingConnection=true;this.authEpoch++;this.statusCache=undefined;
  try{await this.interruptAll();await resetWorkingThreads();await this.unloadWorkingThreads();return {reset:true};}
  finally{this.changingConnection=false;this.statusCache=undefined;}
 }
 async logout(){
  this.changingConnection=true;this.authEpoch++;this.statusCache=undefined;
  try{await this.start();await this.cancelLogin();await this.interruptAll();await this.rpc('account/logout',{});await resetWorkingThreads();await this.unloadWorkingThreads();this.lastSuccess=undefined;}
  finally{this.changingConnection=false;this.statusCache=undefined;}
  return this.status();
 }
 async generate(request:CodexRequest,signal?:AbortSignal):Promise<CodexResult>{
  if(!request.scope)return this.run(request,signal);
  const key=request.scope.conversationId+':'+request.scope.profileVersion;
  const previous=this.scopes.get(key)||Promise.resolve();
  let release!:()=>void;const held=new Promise<void>(resolve=>{release=resolve;});
  const chain=previous.catch(()=>{}).then(()=>held);this.scopes.set(key,chain);
  let cancel:()=>void=()=>{};
  try{
   await Promise.race([previous,new Promise<never>((_,reject)=>{cancel=()=>reject(Error('Codex request cancelled while waiting for working context.'));signal?.addEventListener('abort',cancel,{once:true});if(signal?.aborted)cancel();})]);
   return await this.run(request,signal);
  }finally{signal?.removeEventListener('abort',cancel);release();void chain.then(()=>{if(this.scopes.get(key)===chain)this.scopes.delete(key);});}
 }
 private async run(request:CodexRequest,signal?:AbortSignal):Promise<CodexResult>{
  if(signal?.aborted)throw Error('Codex request cancelled before start.');
  const status=await this.status();if(!status.available||!status.connected)throw Error('Connect Codex from the Connections page before continuing.');
  if(status.canConsider===false&&status.connected)throw Error(this.providerIssue||'Codex is waiting before retrying a stalled provider.');
  if(this.changingConnection)throw Error('Codex connection is changing.');
  const epoch=this.authEpoch;
  const cwd=request.scope?config.codexWorkRoot:await mkdtemp(join(config.codexWorkRoot,'turn-'));
  let completed=false;
  let threadId:string|undefined;let state:Turn|undefined;let timer:ReturnType<typeof setTimeout>|undefined;let progressTimer:ReturnType<typeof setInterval>|undefined;
  let interruptionReason='Codex consideration was cancelled or timed out.';
  const interrupt=()=>{if(state){state.aborted=true;if(state.turnId)void this.stopTurn(state);state.reject(Error(interruptionReason));}};
  try{
   const working=request.scope?await workingThread(request.scope,request.model):undefined;
   if(working?.threadId){
    threadId=working.threadId;
    if(!this.loadedThreads.has(threadId)){
     try{await this.rpc('thread/resume',{threadId,cwd,approvalPolicy:'never',sandbox:'read-only',...(request.model?{model:request.model}:{})});}
     catch{throw Error('Codex working context could not be restored. Start fresh working context from Connections; Citta memories remain safe.');}
    }
   }else{
    const thread=await this.rpc('thread/start',{cwd,ephemeral:!request.scope,approvalPolicy:'never',sandbox:'read-only',...(request.model?{model:request.model}:{})});
    threadId=thread.thread?.id;if(typeof threadId!=='string')throw Error('Codex did not return a thread.');
    if(this.changingConnection||epoch!==this.authEpoch)throw Error('Codex connection changed before working context was saved.');
    if(request.scope&&working)await saveWorkingThread(request.scope,working.key,threadId);
   }
   this.loadedThreads.add(threadId);
   if(this.changingConnection||epoch!==this.authEpoch)throw Error('Codex connection changed before consideration started.');
   let resolveTurn!:(result:CodexResult)=>void;let rejectTurn!:(error:Error)=>void;
   const completion=new Promise<CodexResult>((resolve,reject)=>{resolveTurn=resolve;rejectTurn=reject;});
   state={threadId,text:'',resolve:resolveTurn,reject:rejectTurn,aborted:false,finished:false,actionId:request.actionId,phase:'awaiting_provider',startedAt:Date.now(),updatedAt:Date.now()};this.turns.set(threadId,state);
   // Register a handler before turn/start: fast completion can precede its response.
   void completion.catch(()=>{});
   signal?.addEventListener('abort',interrupt,{once:true});timer=setTimeout(interrupt,request.timeoutMs);
   progressTimer=setInterval(()=>{
    if(state&&!state.finished&&!state.aborted&&Date.now()-state.updatedAt>=config.codexProgressTimeoutMs){
     interruptionReason='Codex provider stopped making progress. The consideration was interrupted; retained context is safe.';
     this.providerIssue=interruptionReason;this.retryUntil=Date.now()+30000;this.statusCache=undefined;interrupt();
    }
   },1000);
   if(signal?.aborted){interrupt();throw Error('Codex consideration cancelled.');}
   const input:any[]=[{type:'text',text:request.prompt}];if(request.imagePath)input.push({type:'localImage',path:request.imagePath});
   const started=await this.rpc('turn/start',{threadId,input,effort:'low',approvalPolicy:'never',sandboxPolicy:{type:'readOnly'},...(request.schema?{outputSchema:request.schema}:{})});
   if(state)state.turnId=started.turn?.id;if(state?.aborted&&state.turnId)void this.stopTurn(state);
   const result=await completion;completed=true;return result;
  }finally{
   if(timer)clearTimeout(timer);if(progressTimer)clearInterval(progressTimer);signal?.removeEventListener('abort',interrupt);
   if(threadId){
    if(!completed&&state?.turnId&&!state.finished)await this.stopTurn(state);
    if(!completed&&state&&!state.finished&&!state.turnId){const child=this.child;this.fail(Error('Codex turn acknowledgement was lost; connection reset to stop untracked work.'));child?.kill('SIGTERM');}
    this.turns.delete(threadId);
    if(!request.scope){this.loadedThreads.delete(threadId);void this.rpc('thread/unsubscribe',{threadId},3000).catch(()=>{});}
    while(this.loadedThreads.size>8){const idle=[...this.loadedThreads].find(id=>id!==threadId&&!this.turns.has(id));if(!idle)break;this.loadedThreads.delete(idle);void this.rpc('thread/unsubscribe',{threadId:idle},3000).catch(()=>{});}
   }
   if(!request.scope)await rm(cwd,{recursive:true,force:true}).catch(()=>{});
  }
 }
 async close(){this.shuttingDown=true;const child=this.child;if(!child)return;this.fail(Error('Citta services stopped.'));child.stdin.end();child.kill('SIGTERM');}
}
export const codexAppServer=new CodexAppServer();
