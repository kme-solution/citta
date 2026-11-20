import { catalogView } from "../modules/citta-sangaha/citta-sangaha-service.ts";
import { eyeDoorProcess } from "../modules/citta-vithi/citta-vithi-service.ts";

switch (process.argv[2]) {
  case "eye": console.table(eyeDoorProcess()); break;
  case "catalog": console.log(catalogView()); break;
  case "recall": {
    const { runRecall } = await import("../infra/postgres/recall-cycle.ts");
    console.log(JSON.stringify(await runRecall(), null, 2));
    break;
  }
  default: throw new Error("Choose eye, catalog, or recall.");
}
