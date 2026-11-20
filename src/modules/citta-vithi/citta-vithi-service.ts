import { eyeDoorKhandha } from "../khandha/khandha-service.ts";

const phases = [
  ["Past life-continuum", "bhavanga", 1],
  ["Vibration", "bhavanga", 1],
  ["Arrest", "bhavanga", 1],
  ["Five-door adverting", "avajjana", 1],
  ["Eye-consciousness", "dassana", 1],
  ["Receiving", "sampaticchana", 1],
  ["Investigating", "santirana", 1],
  ["Determining", "votthapana", 1],
  ["Javana", "javana", 7],
  ["Registration", "tadarammana", 2]
] as const;

export function eyeDoorProcess() {
  let position = 0;
  return phases.flatMap(([phase, kicca, count]) =>
    Array.from({ length: count }, () => ({
      position: ++position,
      phase,
      kicca,
      ...eyeDoorKhandha(kicca === "bhavanga" ? "prior" : "visible", kicca === "dassana")
    }))
  );
}
