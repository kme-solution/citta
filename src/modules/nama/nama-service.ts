export interface Identity {
  name: string;
  age?: number;
  gender?: string;
  background?: string;
  occupation?: string;
  location?: string;
  language?: string;
  values?: string;
  goals?: string;
}

export function loadIdentity(env: NodeJS.ProcessEnv): Identity {
  const value = (key: string) => env[key]?.trim() || undefined;
  const age = value("CITTA_AGE");
  if (age && (!/^\d+$/.test(age) || Number(age) > 150)) {
    throw new Error("CITTA_AGE must be a whole number from 0 to 150, or blank.");
  }
  return {
    name: value("CITTA_NAME") ?? "Citta",
    age: age ? Number(age) : undefined,
    gender: value("CITTA_GENDER"),
    background: value("CITTA_BACKGROUND"),
    occupation: value("CITTA_OCCUPATION"),
    location: value("CITTA_LOCATION"),
    language: value("CITTA_LANGUAGE"),
    values: value("CITTA_VALUES"),
    goals: value("CITTA_GOALS")
  };
}

export function identityFieldLabel(key:keyof Identity,language:'en'|'my'='en'):string {
  if(language==='en')return key;
  return {name:'နာမည်',age:'အသက်',gender:'လိင်',background:'နောက်ခံအကြောင်းအရာ',occupation:'အလုပ်အကိုင်',location:'နေရာ',language:'ဘာသာစကား',values:'တန်ဖိုးထားမှုများ',goals:'ရည်မှန်းချက်များ'}[key];
}
export function describeIdentity(identity: Identity,language:'en'|'my'='en'): string {
  if(language==='my')return [
    `ကျွန်ုပ်နာမည် ${identity.name} ဖြစ်ပါတယ်။`,
    identity.age===undefined?'':`ကျွန်ုပ်အသက် ${identity.age} နှစ် ဖြစ်ပါတယ်။`,
    ...(['gender','background','occupation','location','language','values','goals'] as const).filter(key=>identity[key]).map(key=>`${identityFieldLabel(key,'my')}: ${identity[key]}`)
  ].filter(Boolean).join('\n');
  return [
    `My name is ${identity.name}.`,
    identity.age === undefined ? "" : `I am ${identity.age} years old.`,
    ...(["gender", "background", "occupation", "location", "language", "values", "goals"] as const)
      .filter(key => identity[key])
      .map(key => `My ${key}: ${identity[key]}`)
  ].filter(Boolean).join("\n");
}
