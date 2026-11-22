import { describeIdentity } from '../nama/nama-service.ts';
import type { Identity } from '../nama/nama-service.ts';

type Decision = {
  action: 'remember' | 'recall' | 'read' | 'ask' | 'respond';
  body: string;
  reason: string;
  needsAi: boolean;
};

export function interpretSpeech(text: string, identity: Identity): Decision {
  const decide = (action: Decision['action'], body: string, reason: string): Decision => ({
    action,
    body,
    reason,
    needsAi: action === 'ask',
  });
  const respond = (body: string, reason: string) => decide('respond', body, reason);
  const command = /^(remember|read|ask)\s+([\s\S]+)$/i.exec(text);
  if (command) {
    const action = command[1].toLowerCase() as 'remember' | 'read' | 'ask';
    return decide(
      action,
      command[2],
      action === 'ask'
        ? 'The operator explicitly requested an external AI consultation.'
        : `The local ${action} ability can handle this without AI.`,
    );
  }
  if (/^recall[.!?]?$/i.test(text))
    return decide('recall', '', 'Retrieve local conversation memory; no AI needed.');
  if (/^(help|remember|read|ask)[.!?]?$/i.test(text)) {
    return respond(
      'I consider each message before acting. Tell me about a task, ask about me, or use remember <note>, recall, read <text>, or ask <question> to request AI advice.',
      'Explain local abilities without consulting AI.',
    );
  }
  const profileQuestions: [RegExp, keyof Identity, string][] = [
    [/\b(your name|what are you called)\b|နာမည်/i, 'name', 'My name is'],
    [/\b(how old are you|your age)\b|အသက်/i, 'age', 'My age is'],
    [/\b(your gender|are you (?:a )?(?:man|woman|male|female))\b|လိင်/i, 'gender', 'My gender is'],
    [/\byour background\b|နောက်ခံ/i, 'background', 'My background is'],
    [
      /\b(your occupation|your job|what do you do for (?:a )?living)\b/i,
      'occupation',
      'My occupation is',
    ],
    [/\b(where (?:do you live|are you from)|your location)\b/i, 'location', 'My location is'],
    [/\b(your language|what language do you speak)\b/i, 'language', 'My language is'],
    [/\b(your values|what do you value)\b/i, 'values', 'My values are'],
    [/\b(your goals|what are your goals)\b/i, 'goals', 'My goals are'],
  ];
  if (/\b(who are you|tell me about yourself|introduce yourself)\b|မင်းဘယ်သူလဲ|သင်ဘယ်သူလဲ/i.test(text)) {
    return respond(
      describeIdentity(identity),
      'My configured identity is sufficient to answer locally.',
    );
  }
  // Restrict profile matching to questions about this app, not arbitrary mentions.
  if (/\b(you|your)\b|မင်း|သင်/i.test(text)) {
    const matched = profileQuestions.filter(([pattern]) => pattern.test(text));
    if (matched.length)
      return respond(
        matched
          .map(([, key, prefix]) =>
            identity[key] === undefined
              ? `My ${key} has not been configured yet.`
              : `${prefix} ${identity[key]}.`,
          )
          .join('\n'),
        'Answer from my configured profile; external advice is unnecessary.',
      );
  }
  if (/^(hi|hello|hey|good morning|good afternoon|good evening|မင်္ဂလာပါ)[.!\s]*$/i.test(text)) {
    return respond(
      `Hello, I am ${identity.name}. What would you like to work on?`,
      'A greeting needs only a local social response.',
    );
  }
  if (/^(thanks|thank you|ok|okay|yes|no|got it|ကျေးဇူးတင်ပါတယ်)[.!\s]*$/i.test(text)) {
    return respond(
      'Understood. Tell me when you want to continue.',
      'Acknowledge the message without external consultation.',
    );
  }
  if (
    /\b(explain|suggest|recommend|research|compare|solve|calculate|translate|summari[sz]e|debug|write|plan|help me|how|why|what|which|where|when)\b|[?？]|ရှင်းပြ|အကြံပေး|ဘာကြောင့်|ဘယ်လို/i.test(
      text,
    )
  ) {
    return decide(
      'ask',
      text,
      'This requests knowledge or problem solving beyond my current local abilities; consult the AI adviser.',
    );
  }
  return respond(
    'What would you like me to do with this? I need a clearer goal before deciding whether to act locally or seek AI advice.',
    'The intended task is unclear; clarify locally rather than dispatching to AI by default.',
  );
}
