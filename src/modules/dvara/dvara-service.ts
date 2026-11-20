export const doors = ["eye", "ear", "nose", "tongue", "body", "mind"] as const;
export type Door = typeof doors[number];
export interface Observation {
  door?: Door;
  kind: "speech" | "content" | "sensory" | "mental";
  source: string;
  text: string;
}
