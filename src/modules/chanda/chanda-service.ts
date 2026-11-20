export function desire(recalls: number) {
  const curiosity = Math.min(recalls / 3, 1);
  return { curiosity, formGoal: curiosity >= 1 };
}
