# Citta testing portal

From the repository root with Node.js 24 and dependencies installed, run `npm run portal`. Open http://127.0.0.1:4173. The local server uses built-in Node HTTP. The portal is a rule-based diagnostic conversation with local evidence and a scripted partner.

Send “Why does the lamp come on?” three times. The first two visits show WAIT. The third reaches the curiosity threshold, selects READ and returns the lamp evidence. Send “Read the draft quote”, “Ask the quote partner” or “Read deployment notes” to compare direct reading and attributed speech. Other messages receive a help reply with supported options.

Select either bubble of an exchange to inspect the corresponding diagram. The server streams each step as it happens, including inputs, outputs, rule reason and elapsed time. Expand a node for details. The mind-door sequence is an illustrative simulation invoked during message processing. Conversation history and completed traces are kept in the browser tab's session storage. The portal runs independently of the PostgreSQL demos.
