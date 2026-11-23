switch (process.argv[2]) {
  case 'chat': {
    const { terminalChat } = await import('./terminal.ts');
    await terminalChat();
    break;
  }
  case 'eye': {
    const { eyeDoorProcess } = await import('../modules/citta-vithi/citta-vithi-service.ts');
    const door = process.argv[3] ?? 'eye';
    const grade = process.argv[4] ?? (door === 'mind' ? 'clear' : 'very-great');
    if (door === 'eye' && grade === 'very-great') console.table(eyeDoorProcess());
    else {
      const { dvaraVithi } = await import('../modules/citta-vithi/dvara-vithi-service.ts');
      console.table(dvaraVithi(door, grade));
    }
    break;
  }
  case 'catalog': {
    const { catalogView, listTypes } =
      await import('../modules/citta-sangaha/citta-sangaha-service.ts');
    const view = process.argv[3];
    if (view === undefined) console.log(catalogView());
    else if (view === 'cetasika' || view === 'kicca') {
      const { readFile } = await import('node:fs/promises');
      const catalog = view === 'kicca' ? 'functions' : 'cetasikas';
      const file = new URL(`../../data/catalog/v1/${catalog}.json`, import.meta.url);
      console.table(JSON.parse(await readFile(file, 'utf8')));
    } else if (view === 'factors') {
      const { sampayoga } = await import('../modules/cetasika/sampayoga-service.ts');
      if (!process.argv[4]) throw new Error('Pass a citta type ID after factors.');
      console.log(JSON.stringify(sampayoga(process.argv[4]), null, 2));
    } else if (view === '89' || view === '121') console.table(listTypes(view === '89' ? 89 : 121));
    else throw new Error('Choose catalog view 89, 121, cetasika, kicca, or factors.');
    break;
  }
  case 'recall': {
    const { runRecall } = await import('../infra/postgres/recall-cycle.ts');
    console.log(JSON.stringify(await runRecall(), null, 2));
    break;
  }
  case 'demo':
  case 'trace': {
    const { quoteCommand } = await import('../infra/postgres/quote-cycle.ts');
    await quoteCommand(process.argv[2], process.argv[3]);
    break;
  }
  case 'auto-recall': {
    const { runRecall } = await import('../infra/postgres/recall-cycle.ts');
    const { setTimeout: pause } = await import('node:timers/promises');
    for (let tick = 0; tick < 3; tick++) {
      const cycle = await runRecall();
      console.log(JSON.stringify(cycle, null, 2));
      if (
        ('status' in cycle && cycle.status === 'already resolved') ||
        ('result' in cycle && cycle.result)
      )
        break;
      await pause(1000);
    }
    break;
  }
  default:
    throw new Error('Choose chat, eye, catalog, recall, auto-recall, demo, or trace.');
}
