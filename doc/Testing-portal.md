# Local testing portal

Use Node.js 24, npm and PostgreSQL 17. Set DATABASE_URL, apply migrations/002_portal.sql once, and run npm run portal. Open http://127.0.0.1:4173.

Enter “remember ” followed by your own text. Enter “recall” to retrieve your latest saved note for this conversation. Enter “read ” followed by text to inspect its word and character counts. Other messages show the supported commands. Each message is digital speech. The payload after “read ” is treated as content.

Select an exchange to inspect its actual service events and expand a node for its input, output and decision. A database error appears on the trace. Memory is in PostgreSQL. The chat display and its traces stay in this tab's session storage. A private localhost session is the intended environment. The portal uses deterministic command rules and requires no AI provider.
