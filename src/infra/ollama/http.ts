import {request} from 'node:http';
/** Local-only, bounded JSON transport. The supplied signal owns the entire deadline. */
export function chatJson(url:string,body:unknown,signal:AbortSignal):Promise<unknown> {
  const endpoint=new URL(url);
  if(endpoint.protocol!=='http:'||!['localhost','127.0.0.1','[::1]'].includes(endpoint.hostname))throw Error('Local model transport requires a loopback HTTP endpoint.');
  return new Promise((resolve,reject)=>{
    const req=request(endpoint,{method:'POST',signal,headers:{'Content-Type':'application/json'},agent:false},res=>{
      if(!res.statusCode||res.statusCode<200||res.statusCode>=300){res.resume();reject(Error(`Local cognition unavailable (HTTP ${res.statusCode}); no external fallback was used.`));return;}
      let text='',bytes=0;res.setEncoding('utf8');
      res.on('data',(chunk:string)=>{bytes+=Buffer.byteLength(chunk);if(bytes>1048576){const error=Error('Local model response exceeded its 1 MiB transport limit.');reject(error);res.destroy(error);req.destroy(error);}else text+=chunk;});
      res.once('aborted',()=>reject(Error('Local model connection closed before its response completed.')));
      res.once('error',reject);
      res.once('end',()=>{try{resolve(JSON.parse(text));}catch{reject(Error('Local model transport returned invalid JSON.'));}});
    });
    req.once('error',reject);
    req.end(JSON.stringify(body));
  });
}
