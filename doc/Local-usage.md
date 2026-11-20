# Local usage

Use Node.js 24, npm and PostgreSQL 17. From the repository root, install dependencies with `npm install`. Set DATABASE_URL to a dedicated Citta database in your shell. Apply migrations/001_core.sql once with psql. The eye and catalog commands work without a database.

- `npm run eye` prints the complete eye-door reference sequence.
- `npm run catalog` shows the two classification totals and group sizes.
- `npm run recall` recalls the same unresolved demo question. Each separate invocation counts as another recall. At the third recall Citta forms a goal, reads local evidence and records the result. Further invocations show that the question is resolved. Each command represents one manually advanced cycle.

The threshold and the sample evidence are engineering choices for this first experiment.

## Automatic local scenarios

After applying the existing 001_core.sql migration, run `npm run demo` to start a new quote scenario. Save the printed run ID. The runner advances automatically from a remembered quote to its draft, a scripted conversation, and deployment notes. Each step commits its result and can resume with `npm run demo -- RUN_ID`. The conversation uses a local fixture and has no provider cost.

Use `npm run trace -- RUN_ID` to read the committed steps in order. Use `npm run auto-recall` to advance the existing lamp question once per second until the question is resolved. A previously completed lamp scenario exits immediately. Ctrl+C stops a running command and PostgreSQL retains committed progress.
