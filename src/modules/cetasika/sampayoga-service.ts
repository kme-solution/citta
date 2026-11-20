import { readFileSync } from "node:fs";
import { listTypes } from "../citta-sangaha/citta-sangaha-service.ts";

interface Factor { id: string; family: string }
const factors: Factor[] = JSON.parse(readFileSync(
  new URL("../../../data/catalog/v1/cetasikas.json", import.meta.url), "utf8"));
const detailed = listTypes(121);
const abstinences = ["sammavaca", "sammakammanta", "sammaajiva"];
const immeasurables = ["karuna", "mudita"];

function resolve(id: string) {
  const required = new Set(factors.filter(f => f.family === "universal").map(f => f.id));
  const conditional: string[] = [];
  const restrictions: string[] = [];
  const add = (...ids: string[]) => { for (const factor of ids) required.add(factor); };
  const rootless = id.startsWith("ahetuka-");
  const unwholesome = /^(lobha|dosa|moha)-/.test(id);
  const sensePair = rootless && /-(seeing|hearing|smelling|tasting|touching)$/.test(id);
  const senseBeautiful = id.startsWith("sobhana-");
  const level = id.startsWith("arupa-") ? 5 : Number(id.match(/-([1-5])$/)?.[1] ?? 1);

  if (!sensePair) {
    if (level === 1) add("vitakka");
    if (level <= 2) add("vicara");
    if (id !== "moha-doubt") add("adhimokkha");
    if (!rootless || /mind-door-adverting|smile-producing/.test(id)) add("viriya");
    if (id.includes("joy") || id.includes("smile-producing") ||
        (!rootless && !unwholesome && !senseBeautiful && level <= 3)) add("piti");
    if (!rootless && !id.startsWith("moha-")) add("chanda");
  }
  if (unwholesome) {
    add("moha", "ahirika", "anottappa", "uddhacca");
    if (id.startsWith("lobha-")) {
      add("lobha");
      if (id.includes("with-wrong-view")) add("ditthi");
      else conditional.push("mana");
    }
    if (id.startsWith("dosa-")) {
      add("dosa");
      conditional.push("issa", "macchariya", "kukkucca");
      restrictions.push("At most one of issa, macchariya and kukkucca.");
    }
    if (id === "moha-doubt") add("vicikiccha");
    if (id.endsWith("-prompted")) {
      conditional.push("thina", "middha");
      restrictions.push("Thina and middha occur together when present.");
    }
  } else if (!rootless) {
    for (const f of factors) {
      if (f.family === "beautiful" && ![...abstinences, ...immeasurables, "pannindriya"].includes(f.id)) add(f.id);
    }
    if (!senseBeautiful || id.includes("with-knowledge")) add("pannindriya");
    if (id.startsWith("lokuttara-")) add(...abstinences);
    if (id.startsWith("sobhana-wholesome-")) conditional.push(...abstinences);
    if ((senseBeautiful && !id.startsWith("sobhana-resultant-")) ||
        (id.startsWith("rupa-") && level < 5)) conditional.push(...immeasurables);
    if (conditional.length) restrictions.push("At most one listed conditional factor occurs on this occasion.");
  }
  const excluded = factors.map(f => f.id).filter(f => !required.has(f) && !conditional.includes(f));
  return { typeId: id, required: [...required], conditional, excluded, restrictions };
}

export function sampayoga(typeId: string) {
  const matches = detailed.filter(row => row.id === typeId || row.parentId === typeId);
  if (!matches.length) throw new Error("Unknown citta ID: " + typeId);
  return matches.map(row => resolve(row.id));
}
