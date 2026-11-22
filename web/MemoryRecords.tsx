import { useState } from 'react';
import type { RuntimeState } from './types.ts';
export function MemoryRecords({
  memories,
  onCorrection,
}: {
  memories: RuntimeState['memories'];
  onCorrection: (text: string) => void;
}) {
  const [editing, setEditing] = useState('');
  const [value, setValue] = useState('');
  return (
    <section>
      <h2>Sourced memory</h2>
      {!memories.length && (
        <p className="muted">
          No saved memory in this conversation. Use “remember” to save an operator-reported note.
        </p>
      )}
      {memories.map((m) => (
        <article className={'card memory-record ' + (!m.valid ? 'superseded' : '')} key={m.id}>
          <div className="card-top">
            <span className="tag">
              {m.kind}
              {!m.valid ? ' · superseded' : ''}
            </span>
            <small>{new Date(m.created_at).toLocaleDateString()}</small>
          </div>
          <p>{m.content}</p>
          <small>
            Source: {m.source_id}
            {m.supersedes ? ' · corrects ' + m.supersedes : ''}
          </small>
          {m.valid && m.kind === 'reported' && (
            <div>
              {editing === m.id ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (value.trim()) {
                      onCorrection(`Correct saved note ${m.id}: ${value.trim()}`);
                      setEditing('');
                    }
                  }}
                >
                  <label className="sr-only" htmlFor={'correction-' + m.id}>
                    Corrected reported note
                  </label>
                  <textarea
                    id={'correction-' + m.id}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    maxLength={4000}
                  />
                  <button disabled={!value.trim()}>Prepare correction</button>
                  <button type="button" onClick={() => setEditing('')}>
                    Cancel
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => {
                    setEditing(m.id);
                    setValue(m.content);
                  }}
                >
                  Correct this note
                </button>
              )}
            </div>
          )}
        </article>
      ))}
    </section>
  );
}
