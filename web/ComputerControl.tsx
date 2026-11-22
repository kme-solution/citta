import {useEffect,useState} from 'react';
import {api} from './api.ts';
interface DesktopStatus {enabled:boolean;connected:boolean;error?:string}
export function ComputerControl(){
 const [status,setStatus]=useState<DesktopStatus|null>(null);
 const [pending,setPending]=useState(false);
 const [error,setError]=useState('');
 useEffect(()=>{
  let active=true;const refresh=()=>{void api<DesktopStatus>('/api/computer').then(s=>{if(active)setStatus(s);}).catch(()=>{if(active)setStatus({enabled:false,connected:false});});};
  refresh();const timer=setInterval(refresh,5000);return()=>{active=false;clearInterval(timer);};
 },[]);
 async function session(operation:'connect'|'disconnect'){
  setPending(true);setError('');
  try{setStatus(await api<DesktopStatus>('/api/computer/'+operation,{}));}catch(e){setError(e instanceof Error?e.message:'Desktop session unavailable.');}finally{setPending(false);}
 }
 return <section className="computer-control" aria-label="Computer access"><div><strong>This computer</strong><span>{status?.connected?'Screen and input session connected':pending?'Waiting for desktop permission…':status?.enabled?'Not connected':'Computer capability disabled'}</span></div><button disabled={!status?.enabled||pending} onClick={()=>void session(status?.connected?'disconnect':'connect')}>{status?.connected?'Disconnect computer':'Share this desktop'}</button><p>Choose a screen in the desktop permission dialog. Kyaw2 can see and use it; screenshots go to Codex. Disconnect here or stop sharing from the desktop indicator.</p>{(error||status?.error)&&<p role="alert">{error||status?.error}</p>}</section>;
}
