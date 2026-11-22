/** Zero explicitly selects continuous work without an application hourly cutoff. */
export function workBudgetAvailable(used: number, limit: number) {
  return limit === 0 || used < limit;
}
