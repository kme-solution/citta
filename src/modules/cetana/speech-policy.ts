import type {Context,Decision} from '../../contracts/runtime.ts';
export function renderSpeech(decision:Decision,context:Context) {
  let text=decision.text;
  const my=context.preferences?.find(p=>p.key==='response-language')?.value==='my'||/[\u1000-\u109f]/u.test(text);
  if(decision.uncertainty?.trim()&&!text.includes(decision.uncertainty.trim()))text+='\n\n'+(my?'မသေချာသည့်အချက်: ':'Uncertainty: ')+decision.uncertainty.trim();
  const adviser=context.evidence.some(e=>decision.evidenceIds.includes(e.id)&&e.kind==='reported'&&(e.origin==='ability'||/^(?:Codex advice \(unverified\)|Unverified Codex advice)/.test(e.content)));
  if(adviser)text+='\n\n'+(my?'ဤတုံ့ပြန်ချက်တွင် ပြင်ပ AI ၏ အကြံပြုချက် ပါဝင်သည်။ သီးခြားအထောက်အထားမရှိသော အချက်များကို အတည်ပြုထားခြင်း မရှိပါ။':'This response includes reported external advice. Claims without independent evidence remain unverified.');
  return text;
}
