import { ComputerControl } from './ComputerControl.tsx';
import type { RuntimeState } from './types.ts';
import { ProposalCards } from './ProposalCards.tsx';
export function MindPage({
  state,
  onActivity,
  onReviewed,
}: {
  state: RuntimeState | null;
  onActivity: (id: string) => void;
  onReviewed: () => Promise<void>;
}) {
  if (!state)
    return (
      <section className="workspace">
        <p role="status">Loading recorded mind state…</p>
      </section>
    );
  const mind = state.mind;
  const selectingFocus =
    !!state.focus &&
    state.focus.turns === 0 &&
    !state.focus.last_outcome &&
    !state.focus.source_goal_id &&
    !state.focus.source_memory_id;
  const mindLabels: Record<string, string> = {
    considering: 'Considering',
    acting: 'Acting',
    reviewing: 'Reviewing feedback',
    ready: 'Selecting the next object',
    waiting_provider: 'Waiting for reasoning provider',
    budget_paused: 'Work allowance reached',
    paused: 'Paused',
    stopped: 'Stopped',
    unavailable: 'Runner unavailable',
    disabled: 'Cognition disabled',
    no_motive: 'No enabled interest',
  };
  const pending = state.actions.filter((a) => ['queued', 'running', 'unknown'].includes(a.state));
  const thoughts = state.thoughts?.slice(0, 10) || [];
  const topics = state.motives.filter((m) => m.last_topic);
  const names: Record<string, string> = {
    INFER: 'Considering',
    CONSULT_AI: 'External consultation',
    READ: 'Reading a source',
    COMPUTER: 'Using this computer',
  };
  return (
    <section className="workspace mind-workspace">
      <ComputerControl />
      <div className="note">
        Recorded application state, refreshed with runtime updates. Pending operations do not reveal
        a live inner monologue. Appraisals model feeling; they do not establish human experience.
      </div>
      <h2>{state.profile.name}’s continuing mind</h2>
      <section className="mind-focus" aria-live="polite">
        <strong>{mind ? mindLabels[mind.state] || mind.state : 'Reading current state…'}</strong>
        <p>{mind?.reason || 'Waiting for a confirmed runtime snapshot.'}</p>
        {mind?.since && <small>Since {new Date(mind.since).toLocaleTimeString()}</small>}
      </section>
      {state.focus && (
        <section className="card" aria-label="Retained focus">
          <div className="card-top">
            <h3>{selectingFocus ? 'Selecting a concrete concern' : 'Retained concern'}</h3>
            <span className="tag">{state.focus.state}</span>
          </div>
          <p>
            {selectingFocus ? 'Starting interest: ' : ''}
            {state.focus.topic}
          </p>
          {selectingFocus && (
            <p className="muted">
              No considered outcome is recorded for this starting interest yet.
            </p>
          )}
          {state.focus.last_outcome && (
            <p>
              <strong>Last recorded step:</strong> {state.focus.last_outcome}
            </p>
          )}
          {state.focus.next_step && (
            <p>
              <strong>Next step:</strong> {state.focus.next_step}
            </p>
          )}
          <p className="muted">{state.focus.reason}</p>
          <small>
            {state.focus.turns} considered turns ·{' '}
            {new Date(state.focus.updated_at).toLocaleString()}
          </small>
          {state.focus.source_goal_id && (
            <button onClick={() => onActivity(state.focus!.source_goal_id!)}>
              Open source activity →
            </button>
          )}
        </section>
      )}
      <div className="mind-status">
        <span className={'tag ' + state.agent.control}>{state.agent.control}</span>
        <span>
          {state.agent.quiet
            ? 'Proactive contact is quiet.'
            : 'Proactive contact is allowed, subject to timing and budget.'}
        </span>
        <small>
          Runner heartbeat:{' '}
          {state.agent.heartbeat_at
            ? new Date(state.agent.heartbeat_at).toLocaleString()
            : 'Not recorded'}
        </small>
      </div>
      {!pending.length ? (
        <p className="empty">
          No ability is currently queued or running. The continuing-mind state above shows what
          happens next.
        </p>
      ) : (
        <ul className="mind-operations">
          {pending.map((a) => {
            const goal = state.goals.find((g) => g.id === a.goal_id);
            return (
              <li key={a.id}>
                <div>
                  <span className={'tag ' + a.state}>{a.state}</span>
                  <strong>{names[a.kind] || a.kind.replaceAll('_', ' ')}</strong>
                </div>
                <p>
                  {goal?.description.startsWith('Internal opportunity ')
                    ? 'Considering ' + (a.motive || 'an internal interest')
                    : goal?.description || 'Commitment details are not in the current snapshot.'}
                </p>
                {a.state === 'unknown' && (
                  <p>Outcome is uncertain; this is not confirmed ongoing work.</p>
                )}
                <button onClick={() => onActivity(a.goal_id)}>Open activity →</button>
              </li>
            );
          })}
        </ul>
      )}
      <p className="muted">
        {mind?.workUsed ?? state.agent.work_used} work units this hour ·{' '}
        {mind?.hourlyLimit === 0
          ? 'No app hourly cutoff'
          : `${mind?.hourlyLimit ?? '—'} hourly allowance`}
        . Operator controls, per-goal budgets and provider availability still apply.
      </p>
      <h2>Recent autonomous thoughts</h2>
      <p className="muted">
        Latest 10 committed internal summaries across conversations, newest first. These stay
        visible after an operation finishes.
      </p>
      {!thoughts.length ? (
        <p className="muted">No internal decision summary recorded yet.</p>
      ) : (
        <div className="mind-topics">
          {thoughts.map((t) => (
            <article key={t.id}>
              <div className="card-top">
                <span className="tag">
                  {t.action === 'REVIEW'
                    ? 'Operation result'
                    : t.action.replaceAll('_', ' ').toLowerCase()}
                </span>
                <time>{new Date(t.created_at).toLocaleString()}</time>
              </div>
              <p>{t.text || 'A decision was recorded without a text summary.'}</p>
              <button onClick={() => onActivity(t.goal_id)}>View activity →</button>
            </article>
          ))}
        </div>
      )}
      <h2>Last recorded considerations</h2>
      <p className="muted">
        Topics retained for the selected conversation. These are previous considerations, not a
        claim about what is happening this instant.
      </p>
      {!topics.length ? (
        <p className="muted">No internal topic has been recorded for this conversation.</p>
      ) : (
        <div className="mind-topics">
          {topics.slice(0, 10).map((m) => (
            <article key={m.id}>
              <span className="eyebrow">{m.name}</span>
              <p>{m.last_topic}</p>
            </article>
          ))}
        </div>
      )}
      <h2>Recent modeled feelings</h2>
      <p className="muted">
        Agent-wide appraisals, newest first. Cause, tendency and uncertainty come from recorded
        state.
      </p>
      {!state.appraisals.length && <p className="muted">No appraisal recorded yet.</p>}
      {state.appraisals.slice(0, 10).map((a, i) => (
        <article className="appraisal" key={a.created_at + i}>
          <span className="tag">{a.tone}</span>
          <p>{a.cause}</p>
          <small>
            {a.tendency}
            {a.uncertainty ? ' · Uncertainty: ' + a.uncertainty : ''}
          </small>
          <time className="muted">{new Date(a.created_at).toLocaleString()}</time>
        </article>
      ))}
      {(['ambition', 'interest'] as const).map((category) => {
        const items = state.motives.filter(
          (m) =>
            (m.category ||
              (m.name === 'aspiration' && m.origin === 'configured-profile'
                ? 'ambition'
                : 'interest')) === category,
        );
        return (
          <section key={category} aria-label={category === 'ambition' ? 'Ambitions' : 'Interests'}>
            <h2>{category === 'ambition' ? 'Ambitions' : 'Interests'}</h2>
            {category === 'ambition' && (
              <p className="muted">
                Desired direction and outcomes. Recorded consideration is not verified progress
                toward an ambition.
              </p>
            )}
            <div className="mind-topics">
              {items.map((m) => (
                <article key={m.id}>
                  <div className="card-top">
                    <h3>{m.display_name || m.name}</h3>
                    <span className="tag">{m.enabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{m.description}</p>
                  <small>
                    {m.origin} · {m.turns} recorded internal turns
                  </small>
                </article>
              ))}
            </div>
            {!items.length && (
              <p className="muted">
                {category === 'ambition'
                  ? 'No ambitions configured. Interests may still supply independent curiosity.'
                  : 'No interests recorded.'}
              </p>
            )}
            {!!items.length && !items.some((m) => m.enabled) && (
              <p className="muted">
                All recorded {category === 'ambition' ? 'ambitions' : 'interests'} are disabled.
              </p>
            )}
          </section>
        );
      })}
      <h2>Improvement proposals</h2>
      {!state.proposals.length && (
        <p className="muted">
          No proposals recorded. An idea does not grant permission to change code or capabilities.
        </p>
      )}
      <ProposalCards proposals={state.proposals.slice(0, 10)} onReviewed={onReviewed} />
    </section>
  );
}
