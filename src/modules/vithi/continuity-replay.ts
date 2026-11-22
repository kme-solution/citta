// Offline domain-ledger comparison. No database, live clock, queue or ability dependencies.
interface Goal {id:string;state:string;version:number}
interface Frame {goal_id:string;state:string;parent_goal_id:string|null;continuation_depth:number}
interface Transition {goal_id:string;version:number;previous_state:string|null;state:string;ordinal:string}
interface Action {id:string;goal_id:string;goal_version:number;kind:string;state:string;reviewed:boolean}
export interface ContinuityArchive {goals:Goal[];frames:Frame[];transitions:Transition[];actions:Action[]}
const legal:Record<string,readonly string[]>={
 active:['suspended','waiting','paused','completed','exhausted','cancelled'],
 suspended:['active','waiting','paused','exhausted','cancelled'],
 waiting:['active','paused','exhausted','cancelled'],
 paused:['active','suspended','waiting','exhausted','cancelled'],
 exhausted:['active','waiting','cancelled'],completed:[],cancelled:[]
};
export function replayContinuity(archive:ContinuityArchive|undefined) {
  if(!archive)return {state:'unsupported',differences:['No recorded continuity ledger.']};
  const differences:string[]=[],unsupported:string[]=[];
  const goals=new Map(archive.goals.map(g=>[g.id,g]));
  const frames=new Map(archive.frames.map(f=>[f.goal_id,f]));
  const final=new Map<string,{state:string;version:number}>();
  for(const transition of [...archive.transitions].sort((a,b)=>BigInt(a.ordinal)<BigInt(b.ordinal)?-1:1)) {
    const prior=final.get(transition.goal_id);
    if(prior&&prior.state!==transition.previous_state)differences.push('Transition source mismatch: '+transition.goal_id);
    if(prior&&transition.version<prior.version)differences.push('Goal version decreased: '+transition.goal_id);
    if(transition.previous_state&&transition.previous_state!==transition.state&&!legal[transition.previous_state]?.includes(transition.state))differences.push('Illegal transition: '+transition.goal_id+' '+transition.previous_state+' → '+transition.state);
    final.set(transition.goal_id,{state:transition.state,version:transition.version});
  }
  for(const goal of goals.values()) {
    const state=final.get(goal.id);
    if(!state)unsupported.push('Goal predates recorded transition history: '+goal.id);
    else if(state.state!==goal.state||state.version>goal.version)differences.push('Final goal does not match its recorded transitions: '+goal.id);
    const frame=frames.get(goal.id);
    if(!frame){differences.push('Missing continuation frame: '+goal.id);continue;}
    const expected=goal.state==='paused'?['paused']:['completed','cancelled','exhausted'].includes(goal.state)?['closed']:goal.state==='waiting'?['waiting']:['foreground','suspended'];
    if(!expected.includes(frame.state))differences.push('Frame/goal lifecycle mismatch: '+goal.id);
    if(frame.continuation_depth<1||frame.continuation_depth>4)differences.push('Continuation depth outside policy: '+goal.id);
    if(frame.parent_goal_id) {
      const parent=frames.get(frame.parent_goal_id);
      if(!parent||frame.continuation_depth!==parent.continuation_depth+1)differences.push('Parent continuation depth mismatch: '+goal.id);
    }
  }
  if(archive.frames.filter(f=>f.state==='foreground').length>1)differences.push('More than one foreground frame.');
  for(const action of archive.actions) {
    const goal=goals.get(action.goal_id);
    if(!goal){differences.push('Action has no owned goal: '+action.id);continue;}
    if(action.state==='queued'&&(['cancelled','completed','exhausted'].includes(goal.state)||action.goal_version!==goal.version))differences.push('Ineligible queued action: '+action.id);
    if(action.state==='unknown'&&action.reviewed&&goal.state==='completed')differences.push('Unknown effect treated as completed success: '+action.id);
  }
  return {state:differences.length?'diverged':unsupported.length?'unsupported':'matched',differences,unsupported};
}
