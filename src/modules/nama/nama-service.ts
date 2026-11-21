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

export function describeIdentity(identity: Identity): string {
  return [
    `My name is ${identity.name}.`,
    identity.age === undefined ? "" : `I am ${identity.age} years old.`,
    ...(["gender", "background", "occupation", "location", "language", "values", "goals"] as const)
      .filter(key => identity[key])
      .map(key => `My ${key}: ${identity[key]}`)
  ].filter(Boolean).join("\n");
}
