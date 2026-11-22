import {readFile,writeFile,mkdir,readdir,unlink,realpath} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {config} from '../../app/config.ts';
import type {ComputerCommand,ComputerScreen,Work,Outcome} from '../../contracts/runtime.ts';
export class ComputerFailure extends Error {
 readonly effectUncertain:boolean;
 constructor(message:string,effectUncertain:boolean){super(message);this.name='ComputerFailure';this.effectUncertain=effectUncertain;}
}
export function parseComputerCommand(argument:string):ComputerCommand {
 let value:any;try{value=JSON.parse(argument);}catch{throw new ComputerFailure('Computer argument must be a JSON command.',false);}
 const fields:Record<string,string[]>={observe:['action'],click:['action','x','y','button'],type:['action','text'],key:['action','keys'],scroll:['action','steps']};
 if(!value||typeof value!=='object'||Array.isArray(value)||!fields[value.action]||Object.keys(value).some(k=>!fields[value.action].includes(k)))throw new ComputerFailure('Unsupported computer command or fields.',false);
 if(value.action==='click'&&(!Number.isInteger(value.x)||!Number.isInteger(value.y)||value.x<0||value.y<0||value.x>1280||value.y>900||value.button!==undefined&&!['left','right','middle'].includes(value.button)))throw new ComputerFailure('Click needs valid screen coordinates.',false);
 if(value.action==='type'&&(typeof value.text!=='string'||!value.text.length||value.text.length>2000||/[\x00-\x08\x0b-\x1f]/.test(value.text)))throw new ComputerFailure('Type needs 1–2000 printable characters.',false);
 if(value.action==='scroll'&&(!Number.isInteger(value.steps)||value.steps===0||Math.abs(value.steps)>10))throw new ComputerFailure('Scroll needs -10..-1 or 1..10 steps.',false);
 if(value.action==='key'&&(!Array.isArray(value.keys)||!value.keys.length||value.keys.length>4||value.keys.some((k:unknown)=>typeof k!=='string'||! /^(?:[a-z0-9]|CTRL|SHIFT|ALT|SUPER|ENTER|TAB|ESC|BACKSPACE|DELETE|LEFT|RIGHT|UP|DOWN|HOME|END|PAGEUP|PAGEDOWN|SPACE|F(?:[1-9]|1[0-2]))$/i.test(k))))throw new ComputerFailure('Unsupported key chord.',false);
 return value as ComputerCommand;
}
async function call(path:string,body:unknown,signal?:AbortSignal):Promise<any> {
 if(!config.computerEnabled)throw new ComputerFailure('Computer ability is disabled.',false);
 let token:string;try{token=(await readFile(config.computerTokenFile,'utf8')).trim();}catch{throw new ComputerFailure('Computer driver token is unavailable. Start the supervised services.',false);}
 if(token.length<32)throw new ComputerFailure('Computer driver token is invalid.',false);
 const deadline=AbortSignal.timeout(path==='connect'?135000:path==='status'?1000:45000);
 try{
  const response=await fetch(`http://127.0.0.1:${config.computerPort}/${path}`,{method:'POST',redirect:'error',signal:signal?AbortSignal.any([signal,deadline]):deadline,headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify(body)});
  const reader=response.body?.getReader();if(!reader)throw Error('Missing driver response.');
  let total=0;const chunks:Uint8Array[]=[];
  for(;;){const {done,value}=await reader.read();if(done)break;total+=value.length;if(total>5*1024*1024){await reader.cancel();throw Error('Driver response exceeded its size limit.');}chunks.push(value);}
  let data:any;try{data=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw Error('Driver returned invalid JSON.');}
  if(!response.ok||data.uncertain)throw new ComputerFailure(typeof data.error==='string'?data.error:'Computer driver request failed.',data.uncertain===true);
  return data;
 }catch(error){if(error instanceof ComputerFailure)throw error;throw new ComputerFailure('Computer driver connection failed or ended before confirmed feedback.',path==='action');}
}
export async function desktopSession(operation:'status'|'connect'|'disconnect') {
 if(!config.computerEnabled)return {enabled:false,connected:false};
 const data=await call(operation,{});
 return {enabled:true,connected:operation==='connect'?true:!!data.connected,driver:'xdg-desktop-portal'};
}
export async function computerImage(screen:ComputerScreen):Promise<string> {
 if(!/^[a-f0-9]{32}$/.test(screen.frameId))throw new ComputerFailure('Invalid retained screen identity.',false);
 const root=await realpath(config.computerImageRoot);const file=await realpath(join(root,screen.frameId+'.jpg'));
 if(dirname(file)!==root||createHash('sha256').update(await readFile(file)).digest('hex')!==screen.sha256)throw new ComputerFailure('Retained screen image is unavailable or changed. Observe again.',false);
 return file;
}
export async function operateComputer(work:Work,signal:AbortSignal):Promise<Outcome> {
 const command=parseComputerCommand(work.argument);
 const data=await call('action',{operationId:work.id,command,expectedFrame:work.context.computerScreen?.frameId},signal);
 if(!/^[a-f0-9]{32}$/.test(data.frameId)||!Number.isInteger(data.width)||!Number.isInteger(data.height)||data.width<1||data.width>1280||data.height<1||data.height>900||typeof data.image!=='string'||typeof data.sha256!=='string'||typeof data.capturedAt!=='number')throw new ComputerFailure('Computer driver returned invalid screen metadata.',command.action!=='observe');
 const image=Buffer.from(data.image,'base64');
 if(image.length>3*1024*1024||image[0]!==0xff||image[1]!==0xd8||createHash('sha256').update(image).digest('hex')!==data.sha256)throw new ComputerFailure('Computer image failed its integrity check.',command.action!=='observe');
 await mkdir(config.computerImageRoot,{recursive:true,mode:0o700});
 const path=join(config.computerImageRoot,data.frameId+'.jpg');await writeFile(path,image,{mode:0o600,flag:'wx'}).catch(async error=>{if(error.code!=='EEXIST')throw error;if(createHash('sha256').update(await readFile(path)).digest('hex')!==data.sha256)throw Error('Retained frame identity conflict.');});
 const files=(await readdir(config.computerImageRoot,{withFileTypes:true})).filter(f=>f.isFile()&&/^[a-f0-9]{32}\.jpg$/.test(f.name));
 // Directory order is not chronological; retention uses creation times below.
 if(files.length>100){const {stat}=await import('node:fs/promises');const aged=await Promise.all(files.map(async f=>({name:f.name,mtime:(await stat(join(config.computerImageRoot,f.name))).mtimeMs})));for(const f of aged.sort((a,b)=>b.mtime-a.mtime).slice(100))await unlink(join(config.computerImageRoot,f.name)).catch(()=>{});}
 const screen:ComputerScreen={frameId:data.frameId,width:data.width,height:data.height,sha256:data.sha256,capturedAt:new Date(data.capturedAt*1000).toISOString()};
 return {ok:true,text:command.action==='observe'?'A current desktop screenshot was observed.':`${command.action} input was delivered. The attached screenshot is feedback; verify the intended application result before declaring success.`,computerScreen:screen,usage:{operation:command.action,driver:'xdg-desktop-portal',imageHash:screen.sha256}};
}
