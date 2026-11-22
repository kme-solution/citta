export function nextAction(formGoal: boolean) {
  return formGoal ? 'READ' : 'WAIT';
}
