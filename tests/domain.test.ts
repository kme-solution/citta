import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,symlink,rm,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {considerLocal,validateProposal} from '../src/modules/cetana/consider.ts';
import {permittedFile,authorize} from '../src/modules/sikkha/authorize.ts';
import {contactDisposition} from '../src/modules/vithi/contact-policy.ts';
import {selectContext} from '../src/modules/sati/context-selection.ts';
import type {Context,Proposal} from '../src/contracts/runtime.ts';
const base:Context={observationId:'input',conversationId:'conversation',text:'',kind:'speech',profile:{name:'Test identity'},profileVersion:'test',controlVersion:1,goalId:'goal',evidence:[],recent:[],recordedAt:'2026-11-22T00:00:00Z'};
const proposal:Proposal={action:'RESPOND',text:'An uncertain response',reason:'Evidence is incomplete.',evidenceIds:[],tone:'undetermined',uncertainty:'No independent source.',argument:'',candidateTendency:'investigate',chosenTendency:'hold',regulationReason:'Do not invent evidence.',alternatives:[]};
test('unknown profile fields and ambiguous input do not route to an adviser',()=>{
  assert.match(considerLocal({...base,text:'How old are you?'})!.text,/(?:hasn't|not).*configured/);
  assert.equal(considerLocal({...base,text:'Do the other one'})!.action,'CLARIFY');
  assert.equal(considerLocal({...base,text:'မင်းအသက်ဘယ်လောက်လဲ။'})!.action,'RESPOND');
  assert.equal(considerLocal({...base,text:'မင်္ဂလာပါ'})!.action,'RESPOND');
});
test('cancellation preserves ambiguous scope and uses one exact eligible goal',()=>{
  const goal={id:'target',description:'Pending work',state:'waiting',version:2,criterion:'Observed outcome'};
  assert.equal(considerLocal({...base,text:'Forget it',eligibleGoals:[goal,{...goal,id:'other'}]})!.action,'CLARIFY');
  assert.equal(considerLocal({...base,text:'Stop that task',eligibleGoals:[goal]})!.argument,'target');
});
test('model evidence and authority are checked independently',()=>{
  assert.throws(()=>validateProposal({...proposal,evidenceIds:['invented']},base),/outside/);
  assert.throws(()=>validateProposal({...proposal,action:'CONSULT_AI',argument:'Guess it',uncertainty:''},base),/knowledge gap/);
  assert.throws(()=>authorize('CONSULT_AI',{...base,kind:'mental'},'Question',true),/Self-originated/);
  assert.throws(()=>authorize('READ',base,'/etc/passwd',true),/relative/);
  assert.throws(()=>validateProposal({...proposal,action:'CANCEL_GOAL',argument:'other-agent'},base),/eligible/);
});
test('file scope rejects traversal, symlinks, oversized files and permits actual evidence',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'citta-scope-'));
  try{
    const root=join(dir,'root');await mkdir(root);
    await writeFile(join(root,'note.txt'),'Actual test evidence');await writeFile(join(dir,'outside.txt'),'Outside scope');
    await symlink(join(dir,'outside.txt'),join(root,'link.txt'));
    await writeFile(join(root,'large.txt'),'x'.repeat(32769));
    assert.equal(await permittedFile(root,'note.txt'),join(root,'note.txt'));
    await assert.rejects(permittedFile(root,'../outside.txt'),/outside/);
    await assert.rejects(permittedFile(root,'link.txt'),/outside/);
    await assert.rejects(permittedFile(root,'large.txt'),/32 KB/);
  }finally{await rm(dir,{recursive:true,force:true});}
});
test('quiet, unanswered contact and expiry cannot be overridden by a proposed opening',()=>{
  const snapshot={quiet:false,pending:false,lastContactAt:null,intervalMs:3600000,now:'2026-11-22T01:00:00Z',expiresAt:'2026-11-23T01:00:00Z'};
  assert.equal(contactDisposition({...snapshot,quiet:true}).action,'defer');
  assert.equal(contactDisposition({...snapshot,pending:true}).action,'defer');
  assert.equal(contactDisposition({...snapshot,expiresAt:'2026-11-21T00:00:00Z'}).action,'expire');
  assert.equal(contactDisposition(snapshot).action,'deliver');
});
test('context selection records explicit excerpts and enforces an input budget',()=>{
  const selected=selectContext({...base,evidence:[{id:'source',kind:'observed',content:'မြန်မာ'.repeat(2000)}]});
  assert.match(selected.evidence[0].content,/Excerpt only/);
  assert.ok(Buffer.byteLength(JSON.stringify(selected))<=10000);
  assert.throws(()=>selectContext({...base,text:'x'.repeat(15000)}),/budget/);
});
