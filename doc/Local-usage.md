# Local usage

Use Node.js 24, npm and PostgreSQL 17. From the repository root, install dependencies with `npm install`. Set DATABASE_URL to a dedicated Citta database in your shell. Apply migrations/001_core.sql once with psql. The eye and catalog commands work without a database.

- `npm run eye` prints the complete eye-door reference sequence.
- `npm run catalog` shows the two classification totals and group sizes.
- `npm run recall` recalls the same unresolved demo question. Each separate invocation counts as another recall. At the third recall Citta forms a goal, reads local evidence and records the result. Further invocations show that the question is resolved. Each command represents one manually advanced cycle.

The threshold and the sample evidence are engineering choices for this first experiment.
