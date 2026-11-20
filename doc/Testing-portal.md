# Local testing portal

Follow [Local usage](Local-usage.md) to fill in `.env`, install dependencies and apply the required migrations. Then run `npm run portal`, which loads `.env` automatically. Open http://127.0.0.1:4173.

Enter “remember ” followed by your own text. Enter “recall” to retrieve your latest saved note for this conversation. Enter “read ” followed by text to inspect its word and character counts. Other messages show the supported commands. Each message is digital speech. The payload after “read ” is treated as content.

Select an exchange to inspect its actual service events and expand a node for its input, output and decision. A database error appears on the trace. Memory is in PostgreSQL. The chat display and its traces stay in this tab's session storage. A private localhost session is the intended environment. The local commands use deterministic rules.

## Ask Codex

Start the portal from the same user account and environment where your Codex CLI is signed in. Enter `ask Suggest three ways to find a first customer.` Each ask sends only the supplied question as a fresh Codex conversation. The portal shows the outgoing speech and the returned digital speech in the trace. The CLI uses your local authentication and model configuration. You can configure its credentials later. Other commands work independently.

On Linux and macOS the portal looks for `codex` on PATH. On Windows with a global npm installation it looks for the Codex JavaScript entry point beside the npm command shim on PATH. For a native binary set `CITTA_CODEX_PATH` in `.env` to its absolute executable path. A `.js` entry point is also supported. Restart the portal after changing configuration. CLI errors appear on the trace. Each request uses a fresh temporary working directory and a read-only sandbox. The timeout is two minutes.
