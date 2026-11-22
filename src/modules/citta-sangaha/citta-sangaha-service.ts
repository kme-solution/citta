import { readFileSync } from 'node:fs';

interface CittaType {
  id: string;
  group: string;
  label: string;
  labelMy: string;
  myanmarReview: 'pending';
  projection: 'shared' | 'summary' | 'detailed';
  parentId?: string;
}

const file = new URL('../../../data/catalog/v1/citta-types.json', import.meta.url);
const records: CittaType[] = JSON.parse(readFileSync(file, 'utf8'));

export function listTypes(count: 89 | 121): CittaType[] {
  const projection = count === 89 ? 'summary' : 'detailed';
  return records.filter((row) => row.projection === 'shared' || row.projection === projection);
}

const summary = listTypes(89);
const detailed = listTypes(121);
export const groups = Array.from(new Set(records.map((row) => row.group)), (name) => ({
  name,
  summary: summary.filter((row) => row.group === name).length,
  detailed: detailed.filter((row) => row.group === name).length,
}));

export function catalogView() {
  return { groups, summary: summary.length, detailed: detailed.length };
}
