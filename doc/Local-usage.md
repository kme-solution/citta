# Local usage

Use Node.js 24, npm and PostgreSQL 17 (including the `psql` client). No AI provider or API key is needed. The portal listens at http://127.0.0.1:4173.

## First local setup

The repository includes `.nvmrc` for Node.js 24. If you use nvm, run `nvm install` and `nvm use` from the repository root. Then install dependencies with `npm install`.

A private `.env` file is prepared locally. If it is missing, copy `.env.example` to `.env`. Replace `CHANGE_ME` with your local PostgreSQL password, and adjust the username, host, port and database name to match your installation. Use a dedicated Citta database. URL-encode special characters in the username/password (for example, `@` becomes `%40`). Keep the URL on one quoted line. Never commit `.env` or share its password.

All npm application commands load `.env` automatically. An existing shell `DATABASE_URL` takes precedence; use `unset DATABASE_URL` before running the app if you want the file's value instead.

Create the database once using your local PostgreSQL administrator account. For a typical Linux PostgreSQL installation:

```bash
sudo -u postgres createuser --pwprompt citta
sudo -u postgres createdb --owner=citta citta
```

The password entered here must match `.env`. If you already have a database/user, use those credentials instead and skip creation.

After filling in `.env`, apply both migrations once, in order, from the repository root in Bash:

```bash
set -a
source .env
set +a
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f migrations/001_core.sql
# Continue only if the first command succeeds.
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f migrations/002_portal.sql
```

These migrations create tables and are not designed to be rerun. For an existing database, apply only migrations that have not already been applied.

## Start and check together

```bash
npm run eye
npm run catalog
npm run portal
```

The eye and catalog commands work without a database. Open http://127.0.0.1:4173 and enter `remember local setup works`, then `recall`, to check PostgreSQL persistence. Stop the portal with Ctrl+C. Port 4173 must be available; it is fixed in the current implementation.

Verification status (2026-11-20): Node.js 24.16.0 and npm 11.13.0 are available. `npm install` completed (18 packages added, no reported vulnerabilities), and `package-lock.json` records dependency versions. The installed PostgreSQL client/server is 16.15; this differs from the PostgreSQL 17 reference above, but the checks below passed on this version. The configured database was created and both migrations applied successfully.

- Passed: eye/catalog commands; TypeScript checking with `npx --no-install tsc --noEmit`; auto-recall through resolution and a subsequent already-resolved invocation; quote demo through all three steps and persisted trace retrieval.
- Passed: portal startup and HTTP retrieval of all three assets; remember/recall with direct database confirmation; duplicate-message retry without duplicate persistence; conversation isolation; text reading; rejection of foreign origins and invalid input.
- Fixed the existing auto-recall TypeScript union-access error by narrowing the returned cycle before reading its fields.
- Test data remains: the resolved lamp scenario, one quote demo run, and one synthetic portal note in a separate conversation.
- Browser automation was unavailable (no connected browsers), so visual rendering and browser interaction still need Kyaw's manual check at http://127.0.0.1:4173. The portal was left running for that check.

- `npm run eye` prints the complete eye-door reference sequence.
- `npm run catalog` shows the two classification totals and group sizes.
- `npm run recall` recalls the same unresolved demo question. Each separate invocation counts as another recall. At the third recall Citta forms a goal, reads local evidence and records the result. Further invocations show that the question is resolved. Each command represents one manually advanced cycle.

The threshold and the sample evidence are engineering choices for this first experiment.

## Automatic local scenarios

After applying the existing 001_core.sql migration, run `npm run demo` to start a new quote scenario. Save the printed run ID. The runner advances automatically from a remembered quote to its draft, a scripted conversation, and deployment notes. Each step commits its result and can resume with `npm run demo -- RUN_ID`. The conversation uses a local fixture and has no provider cost.

Use `npm run trace -- RUN_ID` to read the committed steps in order. Use `npm run auto-recall` to advance the existing lamp question once per second until the question is resolved. A previously completed lamp scenario exits immediately. Ctrl+C stops a running command and PostgreSQL retains committed progress.
