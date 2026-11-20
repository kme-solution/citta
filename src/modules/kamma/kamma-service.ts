import { readFile } from "node:fs/promises";
import type { Observation } from "../dvara/dvara-service.ts";
export async function readLampEvidence(): Promise<Observation> {
  const path = new URL("../../../data/fixtures/lamp.txt", import.meta.url);
  return { kind: "content", source: "lamp.txt", text: (await readFile(path, "utf8")).trim() };
}
