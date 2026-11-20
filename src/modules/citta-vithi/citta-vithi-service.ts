import { eyeDoorKhandha } from "../khandha/khandha-service.ts";
import { sampayoga } from "../cetasika/sampayoga-service.ts";

const continuum = "sobhana-resultant-equanimity-with-knowledge-unprompted";
const phases = [
  ["Past life-continuum", "bhavanga", continuum, 1],
  ["Vibration", "bhavanga", continuum, 1],
  ["Arrest", "bhavanga", continuum, 1],
  ["Five-door adverting", "avajjana", "ahetuka-five-door-adverting", 1],
  ["Eye-consciousness", "dassana", "ahetuka-wholesome-seeing", 1],
  ["Receiving", "sampaticchana", "ahetuka-wholesome-receiving", 1],
  ["Investigating", "santirana", "ahetuka-wholesome-investigating", 1],
  ["Determining", "votthapana", "ahetuka-mind-door-adverting", 1],
  ["Javana", "javana", "sobhana-wholesome-equanimity-with-knowledge-unprompted", 7],
  ["Registration", "tadarammana", continuum, 2]
] as const;

export function eyeDoorProcess() {
  let position = 0;
  return phases.flatMap(([phase, kicca, typeId, count]) => {
    const [association] = sampayoga(typeId);
    return Array.from({ length: count }, () => ({
      position: ++position, phase, kicca, typeId,
      ...eyeDoorKhandha(kicca === "bhavanga" ? "prior" : "visible", kicca === "dassana"),
      vedana: "Neutral",
      factors: association.required.join(", ")
    }));
  });
}
