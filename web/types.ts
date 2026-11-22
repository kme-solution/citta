export interface Message {id:string;ordinal:string;role:string;text:string;source:string;goal_id:string;observation_id:string;initiative:boolean;contact_state?:string;contact_id?:string;created_at:string}
export interface Goal {id:string;conversation_id:string;description:string;criterion:string;state:string;summary:string;cycles:number;version:number}
export interface RuntimeState {
 agent:{id:string;control:string;control_version:number;quiet:boolean;heartbeat_at:string;next_internal_at:string;work_used:number};
 profile:{name:string};conversations:{id:string;title:string;created_at:string}[];messages:Message[];goals:Goal[];
 thoughts?:{id:string;goal_id:string;conversation_id:string;action:string;text:string;created_at:string}[];
 motives:{id:string;name:string;origin:string;description:string;last_topic?:string;turns:number;enabled:boolean}[];
 appraisals:{tone:string;cause:string;uncertainty:string;tendency:string;created_at:string}[];
 proposals:{id:string;description:string;benefit:string;scope:string;criteria:string;risks:string;state:string;version:number}[];
 events:{ordinal:string;kind:string;body:Record<string,unknown>;created_at:string}[];
 actions:{id:string;goal_id:string;kind:string;state:string}[];
  memories:{id:string;kind:string;content:string;source_id:string;supersedes?:string;valid:boolean;created_at:string}[];
}
