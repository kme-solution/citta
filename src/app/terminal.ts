import { randomUUID } from 'node:crypto';
import { createInterface, cursorTo, clearScreenDown } from 'node:readline';
import { config } from './config.ts';
import type { RuntimeState } from '../contracts/portal.ts';

/** Application text is data: never let an API/model response issue terminal controls. */
function safe(text: unknown) {
  return String(text ?? '')
    .replace(/[\x00-\x08\x0b-\x1f\x7f-\x9f\u202a-\u202e\u2066-\u2069]/g, '')
    .replace(/\t/g, ' ');
}
export async function terminalChat() {
  if (!process.stdin.isTTY || !process.stdout.isTTY)
    throw Error(
      'Citta chat needs an interactive terminal. Use the portal for noninteractive access.',
    );
  const restoreScreen = () => process.stdout.write('\x1b[?1049l');
  process.stdout.write('\x1b[?1049h');
  process.once('exit', restoreScreen);
  const base = `http://127.0.0.1:${config.port}`;
  const rl = createInterface({ input: process.stdin, output: process.stdout, prompt: 'You > ' });
  let state: RuntimeState | undefined;
  let conversationId: string = randomUUID();
  let selected = false;
  let contextVersion = 0;
  let closed = false;
  let refreshing = false;
  let sending = false;
  let notice = 'Connecting to the local Citta API. Services and cognition will not be started.';
  let disconnected = true;
  let pending: { conversationId: string; messageId: string; text: string } | undefined;
  const requests = new Set<AbortController>();
  async function request(path: string, body?: unknown) {
    const controller = new AbortController();
    requests.add(controller);
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(base + path, {
        cache: 'no-store',
        method: body === undefined ? 'GET' : 'POST',
        headers: { 'Content-Type': 'application/json', Origin: base },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        signal: controller.signal,
      });
      if (!response.ok) throw Error(`Local API returned HTTP ${response.status}.`);
      return await response.json();
    } finally {
      clearTimeout(timeout);
      requests.delete(controller);
    }
  }
  function draw() {
    if (closed) return;
    const width = Math.max(20, (process.stdout.columns || 80) - 1);
    const height = Math.max(10, process.stdout.rows || 24);
    const row = (value: unknown) => safe(value).replace(/\n/g, ' ').slice(0, width);
    const focus = state?.focus;
    const active =
      state?.actions.filter((a) => ['queued', 'running', 'unknown'].includes(a.state)) || [];
    const header = [
      row(
        `${state?.profile.name || 'Citta'} | ${disconnected ? 'Disconnected — last recorded state' : 'Connected'} | ${state?.agent.control || 'unknown'}`,
      ),
      row(
        `Mind: ${state?.mind?.state || 'unavailable'} · ${state?.mind?.reason || 'No recorded status'}`,
      ),
      row(`Focus: ${focus?.topic || 'No retained concern'}`),
      row(`Next: ${focus?.next_step || 'No next step recorded'}`),
      row(
        `Operations: ${active.map((a) => `${a.kind} ${a.state}`).join(', ') || 'none recorded'} | Work units: ${state?.mind?.workUsed ?? 'unknown'} | Tokens/cost: unavailable`,
      ),
    ];
    if (height >= 18) {
      const thoughts =
        state?.thoughts
          ?.filter((t) => t.action === 'REFLECT' || t.action === 'INITIATE')
          .slice(0, 2) || [];
      header.push(row('Recent recorded thoughts (excerpts; not a live inner monologue):'));
      header.push(
        ...(thoughts.length ? thoughts.map((t) => row('  ' + t.text)) : ['  None recorded.']),
      );
    }
    const available = Math.max(1, height - header.length - 5);
    const messages = (state?.messages || [])
      .filter((m) => m.role === 'operator' || m.role === 'citta' || m.role === 'adviser')
      .slice(-12);
    const history = messages
      .map((m) =>
        row(
          `${m.role === 'operator' ? 'You' : m.role === 'adviser' ? 'Adviser (reported)' : state?.profile.name || 'Citta'}: ${m.text}`,
        ),
      )
      .slice(-available);
    cursorTo(process.stdout, 0, 0);
    clearScreenDown(process.stdout);
    process.stdout.write(
      [
        ...header,
        '-'.repeat(width),
        ...history,
        '',
        row(notice),
        row(
          '/help · /new · /retry · /discard · /quit | Conversation excerpts; full history in portal',
        ),
      ].join('\n') + '\n',
    );
    rl.prompt(true);
  }
  async function refresh() {
    if (closed || refreshing) return;
    refreshing = true;
    const version = contextVersion;
    try {
      const snapshot = (await request(
        '/api/state' + (selected ? '?conversationId=' + encodeURIComponent(conversationId) : ''),
      )) as RuntimeState;
      if (closed || version !== contextVersion) return;
      if (!selected) {
        conversationId = snapshot.conversations[0]?.id || conversationId;
        selected = true;
        // Never display the unfiltered multi-conversation history as one conversation.
        state = undefined;
        const scoped = (await request(
          '/api/state?conversationId=' + encodeURIComponent(conversationId),
        )) as RuntimeState;
        if (!closed && version === contextVersion) state = scoped;
      } else state = snapshot;
      if (version === contextVersion) {
        const reconnected = disconnected;
        disconnected = false;
        if (reconnected && !pending && !sending)
          notice =
            'Connected. Showing recorded state; Enter sends a message under current backend controls.';
      }
    } catch {
      if (version !== contextVersion) return;
      disconnected = true;
      if (!pending && !sending)
        notice = `Backend unavailable at ${base}; no service or inference was started.`;
    } finally {
      refreshing = false;
      draw();
    }
  }
  async function sendPending() {
    if (!pending || sending || closed) return;
    sending = true;
    notice = 'Sending message; a receipt is not an answer.';
    draw();
    try {
      await request('/api/messages', pending);
      if (closed) return;
      pending = undefined;
      notice = 'Message accepted. Waiting for the backend response under its current controls.';
      await refresh();
    } catch {
      notice =
        'Delivery unconfirmed. Use /retry with the same message ID, or /discard. A message may already have been accepted.';
    } finally {
      sending = false;
      draw();
    }
  }
  function close() {
    rl.close();
  }
  rl.on('line', (input) => {
    const text = input.trim();
    if (closed) return;
    if (text === '/quit' || text === '/exit') {
      close();
      return;
    }
    if (text === '/help')
      notice =
        'Enter sends chat. /new changes conversation; /retry retains the message ID; /discard clears local retry only; /quit exits. Text is never executed as shell code.';
    else if (sending)
      notice = 'Sending is still in progress. Wait for the receipt before another message.';
    else if (text === '/retry') {
      void sendPending();
      if (!pending) notice = 'No uncertain message is waiting for retry.';
    } else if (text === '/discard') {
      pending = undefined;
      notice = 'Local retry cleared; this does not delete a possibly accepted backend message.';
    } else if (pending)
      notice =
        'Resolve the uncertain delivery with /retry or /discard before changing context or sending another message.';
    else if (text === '/new') {
      contextVersion++;
      conversationId = randomUUID();
      selected = true;
      state = undefined;
      notice = 'New communication context; individual memory is preserved.';
      void refresh();
    } else if (text.startsWith('/'))
      notice = 'Unknown command. Use /help; terminal commands are not executed.';
    else if (text) {
      if (text.length > 6000)
        notice = 'Message exceeds the 6000-character limit; shorten it before sending.';
      else {
        if (!selected) contextVersion++;
        selected = true;
        pending = { conversationId, messageId: randomUUID(), text };
        void sendPending();
      }
    }
    draw();
  });
  const onResize = () => draw();
  process.stdout.on('resize', onResize);
  const timer = setInterval(() => void refresh(), 2000);
  const finished = new Promise<void>((resolve) =>
    rl.once('close', () => {
      closed = true;
      clearInterval(timer);
      process.stdout.off('resize', onResize);
      for (const controller of requests) controller.abort();
      process.off('exit', restoreScreen);
      restoreScreen();
      process.stdout.write(
        '\nCitta terminal closed. Accepted backend work is not cancelled by closing this client.\n',
      );
      resolve();
    }),
  );
  rl.on('SIGINT', close);
  draw();
  void refresh();
  await finished;
}
