import type { Identity } from '../modules/nama/nama-service.ts';
import type { AttentionSnapshot } from '../modules/manasikara/select.ts';
export type Control = 'running' | 'paused' | 'stopped';
export type GoalState = 'active' | 'suspended' | 'waiting' | 'paused' | 'completed' | 'exhausted' | 'cancelled';
export type Ability = 'INFER' | 'CONSULT_AI' | 'READ' | 'COMPUTER';
export interface ImprovementDetails {benefit:string;criteria:string;risks:string;scope:'knowledge'|'runtime-code'|'model'|'dependencies'|'policy';requiresPrivilegeExpansion:boolean}
export interface GoalReview {criterion:string;status:'met'|'not_met'|'unknown';evidenceIds:string[]}
export interface Evidence { id: string; kind: 'configured' | 'reported' | 'observed' | 'inferred'; content: string;origin?:'memory'|'observation'|'ability' }
export interface Proposal {
  action: 'RESPOND' | 'CLARIFY' | 'RECALL' | 'REMEMBER' | 'CORRECT_MEMORY' | 'SET_PREFERENCE' | 'CANCEL_GOAL' | 'REVISE_GOAL' | 'WAIT' | 'READ' | 'COMPUTER' | 'CONSULT_AI' | 'REFLECT' | 'ADOPT_INTEREST' | 'INITIATE' | 'PROPOSE_IMPROVEMENT';
  text: string;
  reason: string;
  evidenceIds: string[];
  tone: 'pleasant' | 'unpleasant' | 'neutral' | 'undetermined';
  uncertainty: string;
  argument: string;
  candidateTendency: 'approach'|'avoid'|'repair'|'investigate'|'connect'|'hold'|'undetermined';
  chosenTendency: 'approach'|'avoid'|'repair'|'investigate'|'connect'|'hold'|'undetermined';
  regulationReason: string;
  alternatives: {action:string;reason:string}[];
  improvement?:ImprovementDetails;
  goalReview?:GoalReview;
}
export type ComputerCommand={action:'observe'}|{action:'click';x:number;y:number;button?:'left'|'right'|'middle'}|{action:'type';text:string}|{action:'key';keys:string[]}|{action:'scroll';steps:number};
export interface ComputerScreen {frameId:string;width:number;height:number;sha256:string;capturedAt:string}
export interface Context {
  workingMemory?:boolean;cognitionAvailable?:boolean;computerAvailable?:boolean;computerScreen?:ComputerScreen;
  observationId: string; conversationId: string; text: string; kind: string;
  profile: Identity; profileVersion: string; controlVersion: number; goalId: string; goalCriterion?:string; responseLanguage?:'en'|'my'; goalRevisionAllowed?:boolean; goalCancellationAllowed?:boolean;
  evidence: Evidence[]; recent: {role: string; text: string}[]; motive?: string;
  availableSources?: string[];
  eligibleGoals?: {id:string;description:string;state:string;version:number;criterion:string}[];
  proposal?: Proposal;
  reviewedOutcome?: {kind:string;outcome:Outcome;observationId:string};
  recordedAt?: string;
  versions?: {generation:string;domainVersion:string;policy:string;engine:string;catalog?:'not-used'};
  commitState?:{sequence:string;goalVersion:number;goalState:string;criterion:string;cycles:number;adviserCalls:number;workMs:string;generation:string;controlVersion:number};
  appraisals?: {tone:string;cause:string;tendency:string;uncertainty:string}[];
  recallReason?:string;
  declinedTopics?:{topic:string;text:string}[];
  attention?:AttentionSnapshot;
  inferenceAttention?:AttentionSnapshot;
  inferenceRequestId?:string;
  selectedObservationId?:string;
  interruption?:{parentGoalId:string|null;depth:number;transient:boolean};
  preferences?:{key:string;value:string;version:number;memoryId:string;sourceId:string}[];
  modeledAffectEnabled?:boolean;
  invalidatedEvidenceIds?:string[];
  motiveSnapshot?:{id:string;name:string;origin:string;description:string;version:number;contextSignature:string;nextEligibleAt:string;unchangedTurns:number;memoryIds:string[]};
}
export interface Work { id: string; kind: Ability; argument: string; context: Context; goalId: string; goalVersion: number }
export interface Outcome { ok: boolean; text?: string; proposal?: Proposal; context?:Context; error?: string; unknown?: boolean; usage?: unknown; computerScreen?:ComputerScreen }
export interface Tick { work: Work[]; waiting: boolean }
export interface Decision { action: string; reason: string; text: string; evidenceIds: string[]; tone: Proposal['tone']; uncertainty?: string; argument?: string;candidateTendency?:Proposal['candidateTendency'];chosenTendency?:Proposal['chosenTendency'];regulationReason?:string;alternatives?:Proposal['alternatives'];improvement?:ImprovementDetails;goalReview?:GoalReview }
export const ENGINE_VERSION = 'citta-runtime-v3';
export const POLICY_VERSION = 'local-bounded-v3';
export const TASK_QUEUE = 'citta-vithi';
