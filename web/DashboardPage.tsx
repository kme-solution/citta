import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api.ts';
import type { DashboardFeed, DashboardMessage, RuntimeState } from './types.ts';
type Filter = 'all' | 'questions' | 'reports';
export function DashboardPage({
  state,
  onOpen,
  onActivity,
  onMind,
  replyDisabled,
}: {
  state: RuntimeState | null;
  onOpen: (message: DashboardMessage, reply: boolean) => void;
  onActivity: (goalId: string) => void;
  onMind: () => void;
  replyDisabled: boolean;
}) {
  const [filter, setFilter] = useState<Filter>('all');
  const [cursors, setCursors] = useState<string[]>([]);
  const [feed, setFeed] = useState<DashboardFeed | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const version = useRef(0);
  const before = cursors.at(-1);
  const refresh = useCallback(async () => {
    const request = ++version.current;
    setLoading(true);
    try {
      const data = await api<DashboardFeed>(
        '/api/dashboard?filter=' + filter + (before ? '&before=' + before : ''),
      );
      if (request === version.current) {
        setFeed(data);
        setError('');
      }
    } catch (e) {
      if (request === version.current)
        setError(e instanceof Error ? e.message : 'Updates unavailable.');
    } finally {
      if (request === version.current) setLoading(false);
    }
  }, [filter, before]);
  useEffect(() => {
    setFeed(null);
    setError('');
    void refresh();
    const timer = setInterval(() => void refresh(), 10000);
    return () => {
      clearInterval(timer);
      version.current++;
    };
  }, [refresh]);
  useEffect(() => {
    if (state?.events.length) void refresh();
  }, [state?.events.at(-1)?.ordinal, refresh]);
  return (
    <section className="workspace dashboard-workspace" aria-label="Dashboard">
      <div className="dashboard-intro">
        <h2>From {state?.profile.name || 'Kyaw2'}</h2>
        <p>
          Ideas, questions and milestone reports chosen for you, with their original conversations.
        </p>
      </div>
      {state?.focus && (
        <section className="dashboard-concern">
          <div>
            <strong>Retained concern · {state.focus.state}</strong>
            <p>
              {state.focus.topic.length > 300
                ? state.focus.topic.slice(0, 300) + '…'
                : state.focus.topic}
            </p>
            {state.focus.next_step && <small>Next: {state.focus.next_step}</small>}
          </div>
          <button onClick={onMind}>Open Mind →</button>
        </section>
      )}
      <div className="dashboard-filters" aria-label="Filter updates">
        {(
          [
            ['all', 'All updates'],
            ['questions', 'Needs your reply'],
            ['reports', 'Milestone reports'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            aria-pressed={filter === value}
            onClick={() => {
              setFilter(value);
              setCursors([]);
            }}
          >
            {label}
          </button>
        ))}
        <button onClick={() => void refresh()} disabled={loading}>
          Refresh
        </button>
      </div>
      <p className="muted">
        Up to 10 updates per page.{cursors.length ? ' Viewing earlier updates.' : ''}
      </p>
      {error && (
        <div className="error" role="alert">
          <span>{error}</span>
          <button onClick={() => void refresh()}>Retry</button>
        </div>
      )}
      {!feed && loading && <p role="status">Loading shared updates…</p>}
      {feed && !feed.items.length && (
        <div className="empty">
          {filter === 'questions'
            ? 'No published question is currently waiting for your answer.'
            : filter === 'reports'
              ? 'No milestone report on this page yet. Reports appear when substantial work reaches a milestone.'
              : 'No shared updates yet. Private reflections stay in Mind until Kyaw2 chooses to share something.'}
        </div>
      )}
      <div className="dashboard-updates">
        {feed?.items.map((m) => (
          <article className="card" key={m.id}>
            <div className="card-top">
              <span className="tag">
                {m.needs_reply
                  ? 'Needs your reply'
                  : m.source === 'milestone'
                    ? 'Milestone report'
                    : 'Idea / update'}
              </span>
              <time>{new Date(m.created_at).toLocaleString()}</time>
            </div>
            <p className="dashboard-conversation">
              {m.conversation_title}
              {m.contact_state === 'answered'
                ? ' · answered'
                : m.contact_state === 'seen'
                  ? ' · seen'
                  : ''}
            </p>
            <div className="message-text">{m.text}</div>
            <div className="dashboard-actions">
              <button onClick={() => onOpen(m, false)}>Open conversation</button>
              <button disabled={replyDisabled} onClick={() => onOpen(m, true)}>
                Reply
              </button>
              {m.goal_id && <button onClick={() => onActivity(m.goal_id)}>View activity →</button>}
            </div>
          </article>
        ))}
      </div>
      <div className="dashboard-paging">
        <button
          disabled={!cursors.length || loading}
          onClick={() => setCursors((current) => current.slice(0, -1))}
        >
          ← Newer
        </button>
        <button
          disabled={!feed?.hasOlder || loading}
          onClick={() => {
            if (feed?.nextBefore) setCursors((current) => [...current, feed.nextBefore!]);
          }}
        >
          Older →
        </button>
      </div>
      {!!feed?.queued.length && (
        <details className="dashboard-queued">
          <summary>
            Waiting to share · {feed.queued.length}
            {feed.queued.length === 10 ? ' latest' : ''}
          </summary>
          <p className="muted">
            These are queued proposals, not delivered messages.
            {state?.agent.quiet
              ? ' Quiet mode is on.'
              : ' Delivery still follows timing and contact limits.'}
          </p>
          {feed.queued.map((q) => (
            <article key={q.id}>
              <span className="tag">{q.state}</span>
              <p>{q.text}</p>
              <small>Why proposed: {q.reason}</small>
              <button onClick={() => onActivity(q.goal_id)}>View activity →</button>
            </article>
          ))}
        </details>
      )}
    </section>
  );
}
