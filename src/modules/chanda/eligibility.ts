export function nextMotiveEligibility(input:{sameContext:boolean;unchangedTurns:number;intervalMs:number;now:string}) {
  const unchangedTurns=input.sameContext?Math.min(input.unchangedTurns+1,12):0;
  const delayMs=Math.min(6*3600000,input.intervalMs*2**Math.min(unchangedTurns,6));
  return {unchangedTurns,delayMs,nextEligibleAt:new Date(Date.parse(input.now)+delayMs).toISOString()};
}
