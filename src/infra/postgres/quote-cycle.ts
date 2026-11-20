import pg from "pg";
import { randomUUID } from "node:crypto";
import { setTimeout as pause } from "node:timers/promises";
import { recall } from "../../modules/sati/sati-recall-service.ts";
import { readQuoteFile, consultQuotePartner } from "../../modules/kamma/quote-service.ts";
import type { Observation } from "../../modules/dvara/dvara-service.ts";

const question = "What deployment effort is missing from the draft quote?";

function runKey(id: string) {
  return "quote:" + id;
}

async function advance(client: pg.Client, key: string) {
  await client.query("BEGIN");
  try {
    const { rows: [memory] } = await client.query(
      "SELECT question, recalls, resolved FROM runtime.memories WHERE id=$1 FOR UPDATE", [key]);
    if (!memory) throw new Error("Unknown quote run");
    if (memory.resolved) {
      await client.query("COMMIT");
      return null;
    }
    const step: number = memory.recalls;
    const previous = await client.query(
      "SELECT cycle FROM runtime.history WHERE memory_id=$1 ORDER BY id DESC LIMIT 1", [key]);
    const input: Observation = step === 0 ? recall(memory.question) : previous.rows[0].cycle.result;
    let action: "READ" | "SPEAK";
    let reason: string;
    let result: Observation;
    switch (step) {
      case 0:
        action = "READ";
        reason = "Read the draft to identify the missing scope.";
        result = await readQuoteFile("quote-draft.txt");
        break;
      case 1:
        action = "SPEAK";
        reason = "Ask where the missing estimate can be checked.";
        result = consultQuotePartner();
        break;
      case 2:
        action = "READ";
        reason = "Check the partner's suggestion against the deployment notes.";
        result = await readQuoteFile("deployment-notes.txt");
        break;
      default: throw new Error("Unsupported quote checkpoint");
    }
    const finished = step === 2;
    const cycle = { step: step + 1, input, action, reason, result, finished };
    await client.query("INSERT INTO runtime.history(memory_id, cycle) VALUES ($1,$2)", [key, cycle]);
    await client.query("UPDATE runtime.memories SET recalls=recalls+1, resolved=$2 WHERE id=$1", [key, finished]);
    if (finished) await client.query("UPDATE runtime.goals SET completed_at=now() WHERE memory_id=$1", [key]);
    await client.query("COMMIT");
    return cycle;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

export async function quoteCommand(mode: "demo" | "trace", suppliedId?: string) {
  if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL first.");
  if (mode === "trace" && !suppliedId) throw new Error("Pass the run ID printed by demo.");
  const id = suppliedId ?? randomUUID();
  const key = runKey(id);
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    if (mode === "trace") {
      const run = await client.query("SELECT resolved FROM runtime.memories WHERE id=$1", [key]);
      if (!run.rowCount) throw new Error("Unknown quote run");
      const history = await client.query("SELECT recorded_at, cycle FROM runtime.history WHERE memory_id=$1 ORDER BY id", [key]);
      console.log(JSON.stringify({ id, resolved: run.rows[0].resolved, history: history.rows }, null, 2));
      return;
    }
    if (!suppliedId) {
      await client.query("BEGIN");
      try {
        await client.query("INSERT INTO runtime.memories(id, question) VALUES ($1,$2)", [key, question]);
        await client.query("INSERT INTO runtime.goals(memory_id, description) VALUES ($1,$2)", [key, "Verify the deployment estimate"]);
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }
    console.log("Run ID:", id);
    while (true) {
      const cycle = await advance(client, key);
      if (!cycle) break;
      console.log(JSON.stringify(cycle, null, 2));
      if (cycle.finished) break;
      await pause(1000);
    }
  } finally {
    await client.end();
  }
}
