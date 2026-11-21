import { createServer } from "node:http";
import type { IncomingMessage } from "node:http";
import { readFile } from "node:fs/promises";
import pg from "pg";
import { askCodex } from "../modules/cetana/vaca-codex.ts";
import { interpretSpeech } from "../modules/cetana/vaca-service.ts";
import { loadIdentity } from "../modules/nama/nama-service.ts";
import type { Observation } from "../modules/dvara/dvara-service.ts";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const identity = loadIdentity(process.env);
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
async function requestData(req: IncomingMessage) {
  const chunks: Buffer[] = [];
  let bytes = 0;
  for await (const chunk of req) {
    bytes += chunk.length;
    if (bytes > 16000) throw Error("Message is too large.");
    chunks.push(chunk);
  }
  const data = JSON.parse(Buffer.concat(chunks).toString());
  if (typeof data.text !== "string" || !data.text.trim() || data.text.length > 2000 ||
      !uuid.test(data.conversationId) || !uuid.test(data.messageId)) throw Error("Invalid message.");
  return { text: data.text.trim() as string, conversationId: String(data.conversationId), messageId: String(data.messageId) };
}

const assets: Record<string, [string,string]> = {
  "/": ["index.html","text/html"], "/ui.js": ["ui.js","text/javascript"], "/style.css": ["style.css","text/css"]
};

createServer(async (req,res) => {
  try {
    const asset = Object.hasOwn(assets, req.url ?? "") && assets[req.url!];
    if (req.method === "GET" && asset) {
      const file = await readFile(new URL("../../portal/" + asset[0], import.meta.url));
      res.writeHead(200, {"Content-Type": asset[1] + "; charset=utf-8"}).end(file);
      return;
    }
    if (req.method !== "POST" || req.url !== "/message") { res.writeHead(404).end(); return; }
    if (req.headers.origin && req.headers.origin !== "http://127.0.0.1:4173") {
      res.writeHead(403).end(); return;
    }
    const {text, conversationId, messageId} = await requestData(req);
    res.writeHead(200, {"Content-Type":"application/x-ndjson","Cache-Control":"no-store"});
    const start = performance.now();
    const emit = (event: object) => res.write(JSON.stringify(event) + "\n");
    const step = (service: string, reason: string, input: unknown, output: unknown) =>
      emit({type:"step", service, reason, input, output, ms: Math.round(performance.now()-start)});
    const observation: Observation = {kind:"speech",source:"operator",text};
    step("Dvāra", "Receive a typed message as digital speech.", text, observation);
    const decision = interpretSpeech(text, identity);
    step("Cetanā",decision.reason,observation,{action:decision.action,needsAi:decision.needsAi});
    let reply: string;
    if (decision.action === "remember" || decision.action === "recall") {
      if (!process.env.DATABASE_URL) throw Error("Set DATABASE_URL for memory commands.");
      if (decision.action === "remember") {
        await pool.query("INSERT INTO runtime.portal_notes(conversation_id,message_id,body) VALUES ($1,$2,$3) ON CONFLICT(message_id) DO NOTHING",[conversationId,messageId,decision.body]);
        reply = "Saved your note.";
        step("Sati","Save the supplied note in this conversation.",decision.body,reply);
      } else {
        const {rows} = await pool.query("SELECT body FROM runtime.portal_notes WHERE conversation_id=$1 ORDER BY ordinal DESC LIMIT 1",[conversationId]);
        reply = rows[0]?.body ?? "You have no saved notes in this conversation.";
        step("Sati","Retrieve the most recent note for this conversation.",conversationId,reply);
      }
    } else if (decision.action === "ask") {
      step("Vācā", "Send this question to the local Codex CLI.", decision.body, "Dispatching");
      const advice = await askCodex(decision.body, identity);
      step("Dvāra", "Receive advice as attributed digital speech from Codex.", {source:"codex",kind:"speech"}, advice);
      reply = "I consulted Codex for this request. Its advice:\n\n" + advice;
    } else if (decision.action === "read") {
      const words = decision.body.trim().split(/\s+/u).length;
      reply = "Read " + words + " whitespace-delimited words and " + Array.from(decision.body).length + " characters.";
      step("Kamma","Count words and Unicode code points in the supplied content.",decision.body,reply);
    } else reply = decision.body;
    step("Response","Return the result to the operator.",decision.action,reply);
    emit({type:"done",reply});
    res.end();
  } catch (error) {
    const message=error instanceof Error ? error.message : "Request failed";
    if (res.headersSent) res.end(JSON.stringify({type:"error",message})+"\n");
    else res.writeHead(400,{"Content-Type":"text/plain"}).end(message);
  }
}).listen(4173,"127.0.0.1",()=>console.log("Citta portal: http://127.0.0.1:4173"));
