import { catalogView, listTypes } from "../modules/citta-sangaha/citta-sangaha-service.ts";
import { eyeDoorProcess } from "../modules/citta-vithi/citta-vithi-service.ts";

switch (process.argv[2]) {
  case "eye": console.table(eyeDoorProcess()); break;
  case "catalog": {
    const view = process.argv[3];
    if (view === undefined) console.log(catalogView());
    else if (view === "89" || view === "121") console.table(listTypes(view === "89" ? 89 : 121));
    else throw new Error("Choose catalog view 89 or 121.");
    break;
  }
  case "recall": {
    const { runRecall } = await import("../infra/postgres/recall-cycle.ts");
    console.log(JSON.stringify(await runRecall(), null, 2));
    break;
  }
  default: throw new Error("Choose eye, catalog, or recall.");
}
