import type { Observation } from "../dvara/dvara-service.ts";
export function recall(question: string): Observation {
  return { door: "mind", kind: "mental", source: "memory", text: question };
}
