import { useEffect, useId, useState } from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import { KindChip } from '../plan-items/PlanItemSummary';

const terms = count => `${count} ${count === 1 ? 'termin' : [2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100) ? 'terminy' : 'terminów'}`;

// An agent's preview of kolokwia or deadlines: short rows with warnings, chosen by the person, saved only by the
// button. A term without a class that day waits for an hour, which the agent never guesses.
export default function PlanItemsPreview({ proposal, onConfirm, onDrafts }) {
  const id = useId();
  const [checked, setChecked] = useState(() => new Set(proposal.items.filter(entry => entry.selectable && !entry.needs_time).map(entry => entry.index)));
  const [times, setTimes] = useState({});
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [saved, setSaved] = useState(null);
  const expired = Date.parse(proposal.expires_at) <= Date.now();
  // The chosen rows are shown as drafts in the grid until they are saved or the conversation is cleared.
  useEffect(() => {
    if (!onDrafts) return undefined;
    const drafts = saved || expired ? [] : proposal.items.filter(entry => checked.has(entry.index) && entry.when?.date).map(entry => {
      const start = entry.needs_time ? (times[entry.index] ? `${times[entry.index]}:00` : null) : entry.when.start_time ?? null;
      return { ...entry.item, ...entry.when, start_time: start, id: `draft-${proposal.id}-${entry.index}`, draft: true, state: 'active', my_state: null };
    }).filter(draft => draft.timing === 'due' || draft.start_time);
    onDrafts(proposal.id, drafts);
    return () => onDrafts(proposal.id, []);
  }, [onDrafts, proposal, checked, times, saved, expired]);
  const toggle = index => setChecked(previous => { const next = new Set(previous); next.has(index) ? next.delete(index) : next.add(index); return next; });
  const ready = [...checked].every(index => !proposal.items.find(entry => entry.index === index)?.needs_time || times[index]);
  const confirm = async () => {
    setBusy(true); setError('');
    try {
      const indexes = [...checked].sort((a, b) => a - b);
      const result = await onConfirm({ proposal, indexes, times: Object.fromEntries(indexes.filter(index => times[index]).map(index => [index, times[index]])) });
      setSaved(result?.items?.length ?? indexes.length);
    } catch (failure) { setError(failure.message || 'Nie udało się dodać terminów.'); }
    finally { setBusy(false); }
  };
  return <div className="plan-preview" role="group" aria-label={`Podgląd: ${proposal.subject}`}>
    <p className="plan-preview-title">{proposal.subject}</p>
    <ul>{proposal.items.map(entry => {
      const disabled = !entry.selectable || Boolean(saved) || expired || (entry.needs_time && !times[entry.index]);
      return <li key={entry.index} data-disabled={!entry.selectable || undefined}>
        <label>
          <input type="checkbox" checked={checked.has(entry.index)} disabled={disabled && !checked.has(entry.index)}
            onChange={() => toggle(entry.index)}/>
          <span className="plan-preview-text">
            <span className="plan-item-meta"><KindChip item={entry.item}/><span>{entry.audience}</span></span>
            <strong>{entry.item.title}</strong>
            <span>{entry.label}</span>
          </span>
        </label>
        {entry.needs_time && entry.selectable && !saved && <label className="plan-preview-time">Godzina
          <input type="time" step="300" value={times[entry.index] || ''} aria-label={`Godzina: ${entry.label}`}
            onChange={event => {
              const value = event.target.value;
              setTimes(previous => ({ ...previous, [entry.index]: value }));
              if (value) setChecked(previous => new Set(previous).add(entry.index));
            }}/></label>}
        {entry.warnings.map(warning => <p key={warning} className="plan-preview-warning"><AlertTriangle size={13} aria-hidden="true"/>{warning}</p>)}
      </li>;
    })}</ul>
    {proposal.items[0]?.item.details && <p className="plan-preview-details">Zakres: {proposal.items[0].item.details}</p>}
    {saved ? <p className="plan-preview-done" role="status"><Check size={14} aria-hidden="true"/>Dodano {terms(saved)}. Zmienisz je albo usuniesz w oknie terminu.</p>
      : <div className="plan-preview-footer">
        {expired && <p role="alert">Podgląd wygasł. Poproś agenta o nowy.</p>}
        <button type="button" id={`${id}-confirm`} disabled={busy || expired || !checked.size || !ready} onClick={confirm}>
          {busy ? 'Zapisywanie…' : `Zatwierdź zaznaczone (${checked.size})`}</button>
      </div>}
    {error && <p role="alert" className="plan-preview-error">{error}</p>}
  </div>;
}
