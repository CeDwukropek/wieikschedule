import { useState } from 'react';
import { KindChip } from './PlanItemSummary';
import { describeItemTime } from './planItemLogic';
import { makeupCandidates } from './planItemEditing';

// After a private move or cancellation of a class with a kolokwium: the same kolokwium at other groups within
// 14 days, to write down as one's own makeup (and add that class to the plan).
export default function MakeupOptions({ entries, items, onMakeUp }) {
  const [busy, setBusy] = useState(null), [error, setError] = useState('');
  const options = entries.flatMap(entry => makeupCandidates(items, entry).map(candidate => ({ entry, candidate })));
  const written = new Set(items.filter(item => item.scope === 'personal' && item.timing === 'class').map(item => String(item.event_id)));
  const run = async ({ entry, candidate }) => {
    setBusy(candidate.id); setError('');
    try { await onMakeUp(entry, candidate); } catch (failure) { setError(failure.message || 'Nie udało się wpisać odrobienia.'); }
    finally { setBusy(null); }
  };
  return <section className="event-details-entries plan-makeup" aria-label="Odrobienie u innej grupy">
    <h3>Odrobienie u innej grupy</h3>
    {!options.length ? <p className="plan-panel-empty">Żadna inna grupa nie ma wpisanego takiego terminu w ciągu 14 dni.</p>
      : <ul>{options.map(option => {
        const { candidate } = option, done = written.has(String(candidate.event_id));
        return <li key={candidate.id} className="plan-panel-row">
          <span className="plan-item-meta"><KindChip item={candidate}/><span>Grupa {candidate.group}</span></span>
          <strong>{candidate.title}</strong>
          <span className="starosta-muted">{describeItemTime(candidate)}</span>
          {done ? <span className="plan-makeup-done">Wpisane jako Twoje odrobienie</span>
            : <button type="button" className="starosta-small" disabled={Boolean(busy)} onClick={() => run(option)}>
              {busy === candidate.id ? 'Wpisywanie…' : 'Wpisz mi jako odrobienie'}</button>}
        </li>;
      })}</ul>}
    <p className="starosta-muted">Wpis u innej grupy ani brak kolizji nie oznacza zgody prowadzącego — zapytaj go o odrobienie.</p>
    {error && <p role="alert" className="plan-item-alert">{error}</p>}
  </section>;
}
