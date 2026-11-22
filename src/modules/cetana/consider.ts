import type { Context, Decision, Proposal } from '../../contracts/runtime.ts';
import { describeIdentity,identityFieldLabel } from '../nama/nama-service.ts';
import { validPreference } from '../sati/preferences.ts';
const myanmar = (text: string) => /[\u1000-\u109f]/u.test(text);
const decision = (action: string, text: string, reason: string, evidenceIds: string[] = []): Decision => ({action,text,reason,evidenceIds,tone:'neutral'});
function directiveBody(text:string) {
  return text.trim().replace(/^(?:(?:please|actually|instead|correction)[,:]?\s+|(?:can|could|would|will)\s+you\s+|I\s+(?:want|need|would like)(?:\s+you)?\s+to\s+|I'd\s+like(?:\s+you)?\s+to\s+|let(?: us|'s)\s+)*/i,'');
}
export function hasRevisionInstruction(text:string){return /^(?:revise|change|update|replace|switch|use|correct)\b/i.test(directiveBody(text));}
export function hasCancellationInstruction(text:string){return /^(?:stop|cancel|forget)\b|^(?:do not|don't)\s+(?:continue|resume)\b/i.test(directiveBody(text));}
/** These are sufficient local operations, not a general natural-language interpreter. */
export function considerLocal(ctx: Context): Decision | null {
  const text = ctx.text.trim();
  const identityText=text.replace(/[.!?]\s*(?:after answering[,]?\s*)?(?:(?:and )?then\s+)?(?:please\s+)?(?:continue|resume)\s+(?:your|the|our)\s+(?:earlier|previous|prior|pending)\s+(?:task|work|investigation)[.!?]*$/i,'').trim();
  const language=ctx.preferences?.find(p=>p.key==='response-language'&&validPreference(p.key,p.value))?.value;
  const my = language?language==='my':myanmar(text);
  const preference=/^prefer (response-language|response-length|explanation-style)\s+(\S+)$/i.exec(text);
  if(preference) {
    const key=preference[1].toLowerCase(),value=preference[2].toLowerCase();
    return validPreference(key,value)?{...decision('SET_PREFERENCE',value,'The operator explicitly supplied a scoped conversation preference.',[ctx.observationId]),argument:key}:decision('CLARIFY','Supported preferences: response-language en; response-length concise/detailed; explanation-style plain/technical.','Do not guess an unsupported preference value.');
  }
  if(ctx.recallReason)return decision('RESPOND','Reminder: '+ctx.recallReason,'An explicitly scheduled operator reminder is due; no inference is needed.');
  const reminder=/^remind at (\S+)\s+([\s\S]+)$/i.exec(text);
  if(reminder) {
    const due=Date.parse(reminder[1]),now=Date.parse(ctx.recordedAt||'');
    if(!Number.isFinite(due)||!Number.isFinite(now)||due<=now||due-now>30*86400000)return decision('CLARIFY','Use remind at <future ISO timestamp> <note>, within 30 days. Include a timezone.','Reminder time must be explicit and valid.');
    return {...decision('WAIT',reminder[2],'The operator explicitly scheduled a local reminder.'),argument:new Date(due).toISOString()};
  }
  if(/^(?:stop that task|cancel that task|forget it|cancel it)[.!?]*$/i.test(text)) {
    const goals=ctx.eligibleGoals||[];
    if(goals.length===1)return {...decision('CANCEL_GOAL','','The operator unambiguously cancelled the single eligible commitment.'),argument:goals[0].id};
    return decision('CLARIFY','Which goal should I cancel? Please choose it in Activity.','Do not guess cancellation scope.');
  }
  if(/^(do the other one|do that|အခြားတစ်ခုလုပ်ပါ)[.!?။]*$/iu.test(text))return decision('CLARIFY',my?'ဘယ်အရာကို လုပ်စေချင်ပါသလဲ။':'Which option do you mean?','The intended referent is not established.');
  if(/^(?:how|what) about (?:that|it)[.!?]*$/i.test(text)&&!ctx.recent.some(m=>m.role!=='operator'||m.text!==text)&&!ctx.eligibleGoals?.length&&!ctx.evidence.some(e=>e.id!==ctx.observationId&&(e.origin==='memory'||e.origin==='ability'&&e.kind==='observed')))return decision('CLARIFY','Which topic do you mean?','There is no earlier contextual referent; do not infer or consult an adviser.');
  if(/\b(change|rename) (?:your |my )?name\b/i.test(text))return decision('RESPOND','My configured identity can be changed in the private .env file, followed by a coordinated service restart. Conversation does not silently change it.','Configured identity is outside conversational mutation scope.',['profile']);
  if(/\b(do you really (?:suffer|feel)|are you conscious|subjective (?:feeling|experience))\b/i.test(text))return decision('RESPOND','I maintain contextual modeled appraisals that can affect my choices. That does not establish subjective feeling, suffering or consciousness.','Explain the application modeling boundary.');
  if (/^(hi|hello|hey|မင်္ဂလာပါ)[.!\s]*$/i.test(text)) return decision('RESPOND',my ? `မင်္ဂလာပါ။ ကျွန်ုပ်နာမည် ${ctx.profile.name} ဖြစ်ပါတယ်။` : `Hello. I'm ${ctx.profile.name}.`, 'A greeting needs no inference.',['profile']);
  if (/^(thanks|thank you|ကျေးဇူးတင်ပါတယ်)[.!\s]*$/i.test(text)) return decision('RESPOND',my ? 'ရပါတယ်။' : "You're welcome.", 'Acknowledge locally.');
  if (/^(who are you|tell me about yourself|introduce yourself)[.!?]*$/i.test(identityText) || /^(မင်းဘယ်သူလဲ|သင်ဘယ်သူလဲ)[။?]*$/.test(identityText.replace(/\s/gu,''))) return decision('RESPOND',describeIdentity(ctx.profile,my?'my':'en'),'Configured identity is sufficient.',['profile']);
  const fields: [RegExp, keyof Context['profile']][] = [
    [/^(what(?:'s| is) your name|your name|မင်းနာမည်ဘာလဲ|သင့်နာမည်ဘာလဲ|မင်းနာမည်ဘယ်လိုခေါ်လဲ|သင့်နာမည်ဘယ်လိုခေါ်လဲ)[.!?။]*$/i,'name'],
    [/^(how old are you|what(?:'s| is) your age|မင်းအသက်ဘယ်လောက်လဲ|သင့်အသက်ဘယ်လောက်လဲ|မင်းအသက်ဘယ်လောက်ရှိပြီလဲ|သင့်အသက်ဘယ်လောက်ရှိပြီလဲ)[.!?။]*$/i,'age'],
    [/^what (?:is|are) your (?:goals|ambitions)[.!?]*$/i,'goals'],
    [/^what (?:is|are) your values[.!?]*$/i,'values'],
    [/^what is your background[.!?]*$/i,'background']
  ];
  for (const [pattern, field] of fields) if (pattern.test(identityText)||(/\p{Script=Myanmar}/u.test(identityText)&&pattern.test(identityText.replace(/\s/gu,'')))) {
    const value = ctx.profile[field];
    const label=identityFieldLabel(field,my?'my':'en');
    return decision('RESPOND', value === undefined ? (my ? `ကျွန်ုပ်၏ ${label} ကို မသတ်မှတ်ရသေးပါ။` : `My ${field} hasn't been configured.`) : (my ? `${label}: ${value}` : `My ${field}: ${value}.`),'Read the pinned configured profile; unknown fields stay unknown.',['profile']);
  }
  const remember = /^(?:remember|မှတ်ထားပါ)\s+([\s\S]+)$/iu.exec(text);
  if (remember) return decision('REMEMBER',remember[1],'Save operator-reported information with provenance.');
  const correction=/^correct saved note ([0-9a-f-]{36}):\s*([\s\S]+)$/i.exec(text);
  if(correction) {
    if(!ctx.evidence.some(e=>e.id===correction[1]&&e.kind==='reported'&&e.origin==='memory'))return decision('CLARIFY','That reported note is not in the current scoped context. Select a current note or identify it explicitly.','A correction needs a current owned source.');
    return {...decision('CORRECT_MEMORY',correction[2],'Preserve the original reported note and append the operator correction.',[correction[1]]),argument:correction[1]};
  }
  if (/^(recall|what do you remember|မှတ်ထားတာပြန်ပြောပါ)[.!?။]*$/iu.test(text)) {
    const notes = ctx.evidence.filter(e => e.kind === 'reported' && (e.origin==='memory'||(!e.origin&&e.id!==ctx.observationId)));
    return decision('RECALL',notes.length ? notes.map(e=>e.content).join('\n\n') : (my ? 'ဒီစကားဝိုင်းမှာ သိမ်းထားသောမှတ်ဉာဏ် မရှိသေးပါ။' : 'There are no saved notes in this conversation.'),'Retrieve scoped saved records without consulting AI.',notes.map(e=>e.id));
  }
  const read = /^(?:read file|ဖိုင်ဖတ်ပါ)\s+(.+)$/iu.exec(text);
  if (read) return {...decision('READ','','Read an explicitly requested permitted local source.'),argument:read[1]};
  const ask = /^(?:ask|consult codex|codex ကိုမေးပါ)\s+([\s\S]+)$/iu.exec(text);
  if (ask) return {...decision('CONSULT_AI','','The operator explicitly requested external advice.'),argument:ask[1]};
  if (/^(help|အကူအညီ)[.!?။]*$/iu.test(text)) return decision('RESPOND', 'Talk normally in English. I use my configured cognition provider when needed. Commands: remember <note>, recall, read file <relative path>, ask <question>. Pause, Resume, Stop and Quiet control my ongoing activity. External advice is attributed; source reads stay within the configured evidence directory.','Explain real bounded capabilities.');
  if (/^(that|it|ဒါ|အဲဒါ)[.!?။]*$/iu.test(text)) return decision('CLARIFY',my ? 'ဘယ်အကြောင်းအရာကို ဆိုလိုပါသလဲ။' : 'Which item do you mean, and what would you like me to do?','The referent is unclear; do not dispatch an adviser.');
  if(myanmar(text))return decision('CLARIFY','English conversation is supported in this delivery. Please send the request in English. Myanmar reference catalogs remain available.','General Myanmar cognition is deferred by the operator.');
  return null;
}
export function validateProposal(proposal: Proposal, ctx: Context): Decision {
  if(ctx.responseLanguage==='my'&&['RESPOND','CLARIFY','INITIATE','REFLECT','PROPOSE_IMPROVEMENT'].includes(proposal.action)&&!/[\u1000-\u109f]/u.test(proposal.text))throw Error('The local proposal did not use the selected Myanmar response language.');
  if(proposal.action==='RESPOND'&&ctx.eligibleGoals?.some(g=>!['completed','cancelled'].includes(g.state))&&/(?:^|[.!?]\s+)(?:I|we)(?:['’]ve| have)?\s+(?:already\s+)?(?:completed|finished|resolved)\s+(?:(?:your|the|our|my)\s+)?(?:earlier|previous|prior|pending)\s+(?:task|work|investigation|request)\b/i.test(proposal.text))throw Error('A generated reply cannot claim known unfinished commitments are complete.');
  const ids = new Set(ctx.evidence.map(e=>e.id)); ids.add('profile');ids.add(ctx.observationId);
  if (proposal.evidenceIds.some(id=>!ids.has(id))) throw Error('Local proposal refers to evidence outside its context.');
  if(ctx.goalCriterion&&proposal.goalReview&&proposal.goalReview.criterion!==ctx.goalCriterion)throw Error('Goal review cannot replace the recorded completion criterion.');
  if(proposal.action==='RESPOND'&&!proposal.goalReview?.criterion.trim())throw Error('A generated response needs an explicit review of the actual goal criterion.');
  if(proposal.goalReview?.evidenceIds.some(id=>!ids.has(id)))throw Error('Goal review refers to evidence outside its context.');
  if(proposal.action==='SET_PREFERENCE'&&(ctx.kind!=='speech'||!proposal.evidenceIds.includes(ctx.observationId)||!validPreference(proposal.argument,proposal.text)))throw Error('A scoped preference needs explicit operator provenance and a supported key/value.');
  if (proposal.action === 'CONSULT_AI' && (!proposal.argument.trim() || !proposal.uncertainty.trim())) throw Error('Advice requires a specific question and an explicit local knowledge gap.');
  if (proposal.action === 'READ' && !proposal.argument.trim()) throw Error('Read requires a relative source path.');
  if (proposal.action === 'CORRECT_MEMORY' && !ctx.evidence.some(e=>e.id===proposal.argument && e.kind==='reported'&&e.origin==='memory')) throw Error('Correction requires the exact scoped reported memory ID.');
  if (['CORRECT_MEMORY','REMEMBER'].includes(proposal.action) && (!proposal.text.trim() || ctx.kind!=='speech')) throw Error('Saving or correcting a reported memory requires operator input.');
  if (proposal.action === 'CANCEL_GOAL' && !ctx.eligibleGoals?.some(g=>g.id===proposal.argument)) throw Error('Cancellation needs an unambiguous eligible goal ID.');
  if(proposal.action==='CANCEL_GOAL'&&(ctx.kind!=='speech'||!hasCancellationInstruction(ctx.text)))throw Error('Goal cancellation requires an explicit operator instruction.');
  if(proposal.action==='REVISE_GOAL'&&!hasRevisionInstruction(ctx.text))throw Error('Goal revision requires an explicit operator task-change instruction.');
  if(proposal.action==='REVISE_GOAL'&&(!ctx.eligibleGoals?.some(g=>g.id===proposal.argument)||!proposal.text.trim()||ctx.kind!=='speech'))throw Error('Goal revision requires an exact scoped goal and an operator-sourced revised task.');
  if(proposal.action==='WAIT') {
    const due=Date.parse(proposal.argument),now=Date.parse(ctx.recordedAt||'');
    if(!Number.isFinite(due)||!Number.isFinite(now)||due<=now||due-now>30*86400000)throw Error('A due recall must specify a future ISO timestamp within 30 days.');
  }
  if (['RESPOND','CLARIFY','INITIATE','REFLECT','PROPOSE_IMPROVEMENT'].includes(proposal.action) && !proposal.text.trim()) throw Error('Proposal contains no usable response.');
  if (ctx.kind !== 'mental' && proposal.action === 'INITIATE') throw Error('Proactive contact is limited to an internal turn.');
  if(proposal.action==='PROPOSE_IMPROVEMENT'&&!proposal.evidenceIds.length)throw Error('An improvement proposal requires an attributable opportunity or limitation.');
  if(proposal.action==='PROPOSE_IMPROVEMENT'&&(!proposal.improvement?.benefit.trim()||!proposal.improvement.criteria.trim()||!proposal.improvement.risks.trim()))throw Error('An improvement proposal requires specific benefit, criteria, risks and scope.');
  if(proposal.action==='ADOPT_INTEREST'&&(!proposal.evidenceIds.length||!proposal.argument.trim()||proposal.argument.length>100||!proposal.text.trim()))throw Error('A candidate interest needs a bounded name, description and attributable origin.');
  const chosen:Decision={...proposal};
  if(ctx.modeledAffectEnabled===false){chosen.tone='undetermined';chosen.candidateTendency='undetermined';chosen.chosenTendency='hold';chosen.regulationReason='Modeled affect is disabled; retain task/evidence and independent policy checks.';}
  if(proposal.goalReview?.status==='met'&&!/^(?:ask|consult codex|codex ကိုမေးပါ)\s/iu.test(ctx.text)) {
    const cited=ctx.evidence.filter(e=>proposal.goalReview!.evidenceIds.includes(e.id));
    const advice=cited.some(e=>e.kind==='reported'&&(e.origin==='ability'||/^(?:Codex advice \(unverified\)|Unverified Codex advice)/.test(e.content)));
    if(advice&&!cited.some(e=>e.kind==='observed'||e.kind==='configured')) {
      chosen.goalReview={...proposal.goalReview,status:'unknown'};
      chosen.uncertainty='The cited adviser speech has no independently observed support for this criterion.';
    }
  }
  chosen.evidenceIds=[...new Set(chosen.evidenceIds)];
  if(chosen.goalReview)chosen.goalReview={...chosen.goalReview,evidenceIds:[...new Set(chosen.goalReview.evidenceIds)]};
  return chosen;
}
