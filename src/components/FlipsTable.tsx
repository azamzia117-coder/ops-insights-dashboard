import { useMemo, useState } from 'react';
import { filterFlips } from '../lib/impact';
import type { Flip } from '../lib/types';

interface Props {
  flips: Flip[];
  transitions: Record<string, number>;
}

export function FlipsTable({ flips, transitions }: Props) {
  const [transition, setTransition] = useState('ALL');
  const [search, setSearch] = useState('');
  const rows = useMemo(() => filterFlips(flips, transition, search), [flips, transition, search]);

  return (
    <section className="card">
      <h2 className="card__title">Changed decisions</h2>
      <div className="filters">
        <label>
          Transition{' '}
          <select value={transition} onChange={(e) => setTransition(e.target.value)}>
            <option value="ALL">All ({flips.length})</option>
            {Object.entries(transitions).map(([key, count]) => (
              <option key={key} value={key}>
                {key} ({count})
              </option>
            ))}
          </select>
        </label>
        <label>
          Search{' '}
          <input
            type="search"
            placeholder="Applicant or reason code"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>
      <table>
        <thead>
          <tr>
            <th>Applicant</th>
            <th>Before</th>
            <th>After</th>
            <th>New reason codes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((f) => (
            <tr key={f.applicantId}>
              <td>{f.applicantId}</td>
              <td><span className={`pill pill--${f.before.toLowerCase()}`}>{f.before}</span></td>
              <td><span className={`pill pill--${f.after.toLowerCase()}`}>{f.after}</span></td>
              <td>{f.newReasonCodes.join(', ') || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p className="empty">No changed decisions match these filters.</p>}
      <p className="muted">{rows.length} of {flips.length} shown</p>
    </section>
  );
}
