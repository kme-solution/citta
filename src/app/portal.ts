import { createServer } from "node:http";
import type { IncomingMessage } from "node:http";
import { readFile } from "node:fs/promises";
import { dvaraVithi } from "../modules/citta-vithi/dvara-vithi-service.ts";
import { desire } from "../modules/chanda/chanda-service.ts";
import { nextAction } from "../modules/cetana/cetana-service.ts";
import { readLampEvidence } from "../modules/kamma/kamma-service.ts";
import { readQuoteFile, consultQuotePartner } from "../modules/kamma/quote-service.ts";
import type { Observation } from "../modules/dvara/dvara-service.ts";

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
      !Number.isSafeInteger(data.priorLampVisits) || data.priorLampVisits < 0) throw Error("Invalid message.");
  return { text: data.text.trim() as string, priorLampVisits: Number(data.priorLampVisits) };
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
    const {text, priorLampVisits} = await requestData(req);
    res.writeHead(200, {"Content-Type":"application/x-ndjson","Cache-Control":"no-store"});
    const start = performance.now();
    const emit = (event: object) => res.write(JSON.stringify(event) + "\n");
    const step = (service: string, reason: string, input: unknown, output: unknown) =>
      emit({type:"step", service, reason, input, output, ms: Math.round(performance.now()-start)});
    const observation: Observation = {kind:"speech",source:"operator",text};
    step("Dvāra", "Receive a typed message as digital speech.", text, observation);
    const moments = dvaraVithi("mind","clear");
    step("Citta-vīthi", "Model attention to the meaning as a clear mind-door scenario.", observation, moments);
    const lamp = /\blamp\b/i.test(text);
    let action: string, reason: string, decisionInput: unknown = text;
    if (lamp) {
      const drive = desire(priorLampVisits + 1);
      step("Chanda","Each lamp visit raises curiosity toward the three-visit threshold.",{visit:priorLampVisits+1},drive);
      action = nextAction(drive.formGoal);
      reason = drive.formGoal ? "Curiosity reached the threshold." : "Curiosity is below the threshold.";
      decisionInput = drive;
    } else if (/\b(partner|consult)\b/i.test(text)) {
      action="SPEAK"; reason="The message asks for the quote partner.";
    } else if (/\b(deployment|notes)\b/i.test(text)) {
      action="READ_NOTES"; reason="The message refers to deployment notes.";
    } else if (/\b(quote|draft)\b/i.test(text)) {
      action="READ_DRAFT"; reason="The message refers to the quote draft.";
    } else {
      action="HELP"; reason="The message has no matching local scenario.";
    }
    step(lamp ? "Cetanā" : "Portal router",reason,decisionInput,action);
    let reply: string;
    if (action === "WAIT") reply="I’ll keep the lamp question open. Visit " + (priorLampVisits+1) + " of 3.";
    else if (action === "HELP") reply="Ask about the lamp, the draft quote, deployment notes, or the quote partner.";
    else {
      const result = action === "SPEAK" ? consultQuotePartner() : action === "READ" ? await readLampEvidence()
        : await readQuoteFile(action === "READ_NOTES" ? "deployment-notes.txt" : "quote-draft.txt");
      step("Kamma",result.kind === "speech" ? "Received the scripted partner’s reply." : "Read the local evidence file.",action,result);
      reply=result.text;
    }
    step("Response","Return the selected response to the conversation.",action,reply);
    emit({type:"done",reply,lamp});
    res.end();
  } catch (error) {
    const message=error instanceof Error ? error.message : "Request failed";
    if (res.headersSent) res.end(JSON.stringify({type:"error",message})+"\n");
    else res.writeHead(400,{"Content-Type":"text/plain"}).end(message);
  }
}).listen(4173,"127.0.0.1",()=>console.log("Citta portal: http://127.0.0.1:4173"));
