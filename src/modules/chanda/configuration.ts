export interface ConfiguredMotive {
  name: string;
  displayName: string;
  origin:
    'configured-default' | 'configured-profile' | 'configured-interest' | 'configured-ambition';
  description: string;
  category: 'interest' | 'ambition';
}
function entries(
  raw: string | undefined,
  variable: string,
  ambition: boolean,
): ConfiguredMotive[] | undefined {
  if (raw === undefined || !raw.trim()) return undefined;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw Error(`${variable} must be a JSON array.`);
  }
  if (!Array.isArray(parsed) || parsed.length > 8)
    throw Error(`${variable} must contain at most eight entries.`);
  const ids = new Set<string>();
  return parsed.map((entry: unknown): ConfiguredMotive => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry))
      throw Error(`${variable} entries must be objects.`);
    const row = entry as Record<string, unknown>;
    const allowed = ['id', 'name', 'description', ...(ambition ? ['successCriterion'] : [])];
    if (Object.keys(row).some((key) => !allowed.includes(key)))
      throw Error(`${variable} contains an unsupported field.`);
    const value = (key: string, max: number) => {
      const text = row[key];
      if (typeof text !== 'string' || !text.trim() || text.trim().length > max)
        throw Error(`${variable}.${key} must be nonempty text of at most ${max} characters.`);
      return text.trim();
    };
    const id = value('id', 48);
    if (!/^[a-z][a-z0-9-]*$/.test(id) || ids.has(id))
      throw Error(`${variable} IDs must be unique lowercase identifiers.`);
    ids.add(id);
    const displayName = value('name', 100),
      description = value('description', 600);
    return {
      name: (ambition ? 'ambition:' : 'interest:') + id,
      displayName,
      origin: ambition ? 'configured-ambition' : 'configured-interest',
      category: ambition ? 'ambition' : 'interest',
      description:
        displayName +
        ': ' +
        description +
        (ambition
          ? '\nDesired success criterion (configuration, not evidence): ' +
            value('successCriterion', 600)
          : ''),
    };
  });
}
export function loadMotivationConfiguration(env: NodeJS.ProcessEnv) {
  const interests = entries(env.CITTA_INTERESTS, 'CITTA_INTERESTS', false);
  const ambitions = entries(env.CITTA_AMBITIONS, 'CITTA_AMBITIONS', true);
  const defaults: ConfiguredMotive[] = [
    {
      name: 'understanding',
      displayName: 'Understanding',
      origin: 'configured-default',
      category: 'interest',
      description: 'Explore permitted sources and understand how things work.',
    },
    {
      name: 'reflection',
      displayName: 'Reflection',
      origin: 'configured-default',
      category: 'interest',
      description:
        'Consider grounded experience, alternative interpretations and possible improvements.',
    },
    {
      name: 'connection',
      displayName: 'Connection',
      origin: 'configured-default',
      category: 'interest',
      description: 'Share an appropriate new idea or question in the local inbox.',
    },
  ];
  const legacyGoal = env.CITTA_GOALS?.trim();
  const fallback: ConfiguredMotive[] = legacyGoal
    ? [
        {
          name: 'aspiration',
          displayName: 'Configured aspiration',
          origin: 'configured-profile',
          category: 'ambition',
          description: legacyGoal,
        },
      ]
    : [];
  return {
    entries: [...(interests ?? defaults), ...(ambitions ?? fallback)],
    explicitInterests: interests !== undefined,
    explicitAmbitions: ambitions !== undefined,
  };
}
