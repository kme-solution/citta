import { catalogView, listTypes } from "../modules/citta-sangaha/citta-sangaha-service.ts";
import { eyeDoorProcess } from "../modules/citta-vithi/citta-vithi-service.ts";

switch (process.argv[2]) {
  case "eye": console.table(eyeDoorProcess()); break;
  case "catalog": {
    const view = process.argv[3];
    if (view === undefined) console.log(catalogView());
    else if (view === "cetasika" || view === "kicca") {
      const { readFile } = await import("node:fs/promises");
      const catalog = view === "kicca" ? "functions" : "cetasikas";
      const file = new URL(`../../data/catalog/v1/${catalog}.json`, import.meta.url);
      console.table(JSON.parse(await readFile(file, "utf8")));
    }
    else if (view === "89" || view === "121") console.table(listTypes(view === "89" ? 89 : 121));
    else throw new Error("Choose catalog view 89, 121, cetasika, or kicca.");
    break;
  }
  case "recall": {
    const { runRecall } = await import("../infra/postgres/recall-cycle.ts");
    console.log(JSON.stringify(await runRecall(), null, 2));
    break;
  }
  case "demo":
  case "trace": {
    const { quoteCommand } = await import("../infra/postgres/quote-cycle.ts");
    await quoteCommand(process.argv[2], process.argv[3]);
    break;
  }
  case "auto-recall": {
    const { runRecall } = await import("../infra/postgres/recall-cycle.ts");
    const { setTimeout: pause } = await import("node:timers/promises");
    for (let tick = 0; tick < 3; tick++) {
      const cycle = await runRecall();
      console.log(JSON.stringify(cycle, null, 2));
      if (cycle.status === "already resolved" || cycle.result) break;
      await pause(1000);
    }
    break;
  }
  default: throw new Error("Choose eye, catalog, recall, auto-recall, demo, or trace.");
}
