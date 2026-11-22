import {useEffect,useState} from 'react';
import {api} from './api.ts';
interface Connection {
 transport:string;available:boolean;connected:boolean;activeProvider?:string;accountType?:string;plan?:string;
 pendingLogin?:{loginId:string;authUrl:string};loginError?:string;lastSuccessfulTurnAt?:string;error?:string;
}
function authorizationLink(value:string){
 const url=new URL(value);
 if(url.protocol!=='https:'||!['auth.openai.com','auth0.openai.com','chatgpt.com'].includes(url.hostname)||url.username||url.password)throw Error('Unexpected sign-in address.');
 return url.toString();
}
export function ConnectionsPage(){
 const [connection,setConnection]=useState<Connection|null>(null);
 const [apiKey,setApiKey]=useState('');
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [readError,setReadError]=useState('');
 useEffect(()=>{
  let active=true;
  const refresh=()=>{void api<Connection>('/api/codex').then(value=>{if(active){setConnection(value);setReadError('');}}).catch(()=>{if(active)setReadError('Could not read the Codex connection.');});};
  refresh();const timer=setInterval(refresh,3000);return()=>{active=false;clearInterval(timer);};
 },[]);
 async function signIn(){
  const popup=window.open('about:blank','_blank');if(popup)popup.opener=null;
  setBusy(true);setError('');
  try{
   const login=await api<{loginId:string;authUrl:string}>('/api/codex/login',{type:'chatgpt'});
   const authUrl=authorizationLink(login.authUrl);
   if(popup&&!popup.closed)popup.location.replace(authUrl);
   setConnection(current=>current?{...current,pendingLogin:{...login,authUrl}}:current);
  }catch(e){popup?.close();setError(e instanceof Error?e.message:'Could not start sign-in.');}finally{setBusy(false);}
 }
 async function connectKey(){
  const key=apiKey.trim();if(!key)return;setApiKey('');setBusy(true);setError('');
  try{await api('/api/codex/login',{type:'apiKey',apiKey:key});setConnection(await api<Connection>('/api/codex'));}
  catch(e){setError(e instanceof Error?e.message:'Could not connect with that key.');}finally{setBusy(false);}
 }
 async function changeConnection(operation:'cancel'|'logout'|'reset-context'){
  setBusy(true);setError('');setApiKey('');
  try{setConnection(await api<Connection>('/api/codex/'+operation,{}));}
  catch(e){setError(e instanceof Error?e.message:'Connection change failed.');}finally{setBusy(false);}
 }
 let pendingUrl:string|undefined;
 try{if(connection?.pendingLogin)pendingUrl=authorizationLink(connection.pendingLogin.authUrl);}catch{/* An unexpected provider URL is never rendered as a link. */}
 const enabled=!!connection&&connection.transport==='app-server';
 return <section className="workspace connections-workspace" aria-label="Connections">
  <div className="connection-intro"><h2>Codex reasoning</h2><p>Citta keeps its identity, memories, goals and learned records on this laptop. Codex receives selected context to help it consider the next step.</p></div>
  <section className="card connection-card" aria-label="Codex account">
   <div className="card-top"><h3>Connect your account</h3><span className="tag">{!connection?'Checking…':connection.connected?'Connected':'Not connected'}</span></div>
   {!connection&&<p role="status">Checking the local Codex connection…</p>}
   {connection?.connected?<>
    <p>{connection.accountType==='chatgpt'?'Signed in with ChatGPT':connection.accountType==='apiKey'?'Connected with an API key':'Provider connection configured'}{connection.plan?' · '+connection.plan:''}</p>
    <p>{connection.lastSuccessfulTurnAt?'Last completed consideration: '+new Date(connection.lastSuccessfulTurnAt).toLocaleString():'Signed in. A completed consideration will verify model access.'}</p>
    <button disabled={busy} onClick={()=>void changeConnection('logout')}>Disconnect Codex</button>
    <details><summary>Working memory</summary><p>Citta uses its own Codex working threads for consideration. Durable experiences, goals and lessons stay in its local database. Starting fresh clears the provider working-context references and interrupts active considerations; it keeps Citta’s saved memory.</p><button disabled={busy} onClick={()=>void changeConnection('reset-context')}>Start fresh working context</button></details>
    <p className="muted">Disconnecting keeps Citta’s memories and history. This connection is separate from your personal Codex CLI login.</p>
   </>:<>
    <p>Use your ChatGPT account, or provide an OpenAI API key.</p>
    <button className="primary" disabled={!enabled||busy||!!connection?.pendingLogin} onClick={()=>void signIn()}>{busy?'Connecting…':'Sign in with ChatGPT ↗'}</button>
    {pendingUrl&&<div className="connection-pending" role="status"><p>Finish sign-in on OpenAI’s page. This portal updates when the connection completes.</p><a href={pendingUrl} target="_blank" rel="noopener noreferrer">Continue sign-in ↗</a><button disabled={busy} onClick={()=>void changeConnection('cancel')}>Cancel sign-in</button></div>}
    <details className="api-key-option"><summary>Use an API key instead</summary><form onSubmit={e=>{e.preventDefault();void connectKey();}}><label htmlFor="codex-api-key">OpenAI API key</label><input id="codex-api-key" type="password" autoComplete="new-password" spellCheck={false} value={apiKey} maxLength={512} disabled={!enabled||busy||!!connection?.pendingLogin} onChange={e=>setApiKey(e.target.value)} placeholder="Enter your API key"/><button disabled={!enabled||busy||!!connection?.pendingLogin||!apiKey.trim()}>Connect with key</button></form><p>The key is handed to Citta’s local Codex credential store. It is not saved in browser storage or included in Citta’s memories.</p></details>
   </>}
   {(error||connection?.loginError||readError||connection?.error)&&<p className="connection-error" role="alert">{error||connection?.loginError||readError||connection?.error}</p>}
  </section>
  <p className="muted connection-footnote">Reasoning provider: {connection?.activeProvider||'checking'}. Laptop screen and input access is managed separately in Mind.</p>
 </section>;
}
