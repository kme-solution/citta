# Local prototype operations

**Scope:** commands and configuration supported by the current source. This is not the target runtime specification. See [current status](../delivery/status.md) for dated verification and [development plan](../delivery/plan.md) for work still required. Follow `AGENTS.md`; do not run setup, migrations or tests automatically during ordinary implementation.

## Requirements and installation

Use Node.js 24, npm, a local PostgreSQL server and the `psql` client. `.nvmrc` selects Node 24. PostgreSQL 16.15 was used for earlier prototype checks; a newer database version is not required by this guide or the new architecture. The reference runtime has not been certified against every version.

From the repository root, use `nvm install` and `nvm use` if managing Node through nvm, then `npm ci` when the lockfile is present. Installation is Kyaw's local step unless explicitly delegated. Local catalog, fixture and note commands require no external AI provider. Codex consultation uses the local CLI's authentication and model/provider configuration.

## Environment

Use the private root `.env`; copy `.env.example` if it is absent. Never overwrite a populated file. All current npm application commands use Node's `.env` loading. Exported shell values take precedence; unset a stale variable to use the file value. Restart the portal after changing configuration.

| Variable | Meaning |
|---|---|
| `DATABASE_URL` | Dedicated local Citta PostgreSQL URL; quote it and URL-encode special credential characters |
| `CITTA_CODEX_PATH` | Optional absolute Codex executable or JavaScript entry point; blank uses discovery/PATH |
| `CITTA_NAME` | Conventional application name; blank defaults to Citta |
| `CITTA_AGE` | Optional whole number from 0 to 150; static configured age, not automatically incremented |
| `CITTA_GENDER` | Optional declared background; no inferred behavioral stereotypes |
| `CITTA_BACKGROUND` | Optional configured background |
| `CITTA_OCCUPATION` | Optional declared occupation |
| `CITTA_LOCATION` | Optional declared location |
| `CITTA_LANGUAGE` | Optional preferred language background; not a guarantee the current rules understand every language |
| `CITTA_VALUES` | Optional declared values; not executable permissions |
| `CITTA_GOALS` | Optional declared goals; current profile text does not create durable runtime commitments |

Blank profile attributes remain unknown. The current prototype includes the configured profile in Codex consultation prompts; include only information intended for that adviser. The target design minimizes permitted context and versions the profile. Neither a chat message nor Codex output changes the current environment profile.

To find the Linux/macOS executable, use `command -v codex` and put that absolute path in `.env` if needed. On Windows, the adapter supports a native executable or the npm JavaScript entry point. Paths vary by installation; no machine-specific path is shared as a default. Never paste credentials into chat or commit `.env`.

## Database initialization

Use an existing dedicated local database/user or create them through your local PostgreSQL administrator account. A typical Linux setup is:

```bash
sudo -u postgres createuser --pwprompt citta
sudo -u postgres createdb --owner=citta citta
```

Set the matching connection URL in `.env`. From the repository root in Bash, load only your trusted local configuration, then apply each missing migration once:

```bash
set -a
source .env
set +a
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f migrations/001_core.sql
```

After the first migration succeeds, apply the second if it is not already present:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f migrations/002_portal.sql
```

These current SQL files are not rerunnable migration commands. Existing local installations may already have both applied. Do not run them again blindly or replace existing tables. Future runtime migrations must be additive and ledger-managed under the contracts; this guide does not claim those migrations exist.

## Current entry points

| Command | Current behavior |
|---|---|
| `npm run portal` | Local portal at `http://127.0.0.1:4173`; fixed loopback port |
| `npm run catalog` | Group totals; see [catalog reference](../reference/catalog.md) for views |
| `npm run eye` | Reference eye-door fixture; additional door/grade arguments in catalog reference |
| `npm run recall` | One manually advanced lamp-question recall; third unresolved recall reads sample evidence |
| `npm run auto-recall` | Bounded lamp progression once per second; exits if already resolved |
| `npm run demo` | New scripted quote progression; prints its run ID |
| `npm run demo -- RUN_ID` | Resume that quote scenario's committed progress |
| `npm run trace -- RUN_ID` | Read quote scenario history; this is not offline replay |

Catalog/eye views do not require PostgreSQL. Notes and scenario progress do. Ctrl+C stops a command; committed database changes remain. Existing scripts do not include a build, migration runner, general replay, unit-test or integration-test command; do not copy commands from a retired plan and assume they exist.

## Current portal workflow and limitations

Open the loopback URL after starting the portal. Enter sends; Shift+Enter inserts a newline; input-method composition should not send prematurely. The composer stays outside conversation scrolling. New messages/results follow the latest turn. These UI changes require visual acceptance; see status.

- `remember <text>` saves a note in the current conversation; `recall` retrieves the latest note.
- `read <text>` counts words and Unicode code points in the supplied text; it is not the target fixture-reading ability.
- `help` describes the local commands. Supported profile questions and greetings can be answered from local rules.
- `ask <question>` explicitly requests Codex. Some ordinary questions also route by current regex rules; these are a prototype limitation, not the accepted gap-based consideration design.

Each Codex consultation is a fresh process/conversation with the supplied question and configured profile, not the full previous chat. The CLI runs in a temporary directory with a read-only sandbox and a two-minute deadline. A local CLI may contact an external provider. Authentication, timeout and unavailable errors appear in the trace.

The current portal's chat and trace remain in tab session storage; notes are in PostgreSQL. It lacks the target durable full history, foreground continuations, controls and nonblocking consideration runtime. Browser refresh/disconnection behavior must not be described as those completed capabilities. Select an exchange to inspect the actual emitted service events.

For a local persistence smoke check when testing is requested, send `remember local setup works`, then `recall`. For a live adviser check, explicitly request one small `ask` message. Those checks do not verify the continuing-runtime requirements or doctrinal correctness.
