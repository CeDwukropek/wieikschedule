import { useState } from 'react';
import { AlertTriangle, EyeOff } from 'lucide-react';
import { PROGRESS, describeAudience, describeItemTime, kindOf, reviewNotice } from './planItemLogic';

export function KindChip({ item }) {
  const kind = kindOf(item);
  return <span className="plan-item-chip" style={{ '--kind': kind.color }}>{kind.label}</span>;
}

// One entry with its own progress for the signed-in user; onState is absent for guests.
export default function PlanItemSummary({ item, onState, heading = true }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const run = async change => {
    setBusy(true); setError('');
    try { await onState(item.id, change); } catch (failure) { setError(failure.message || 'Nie udało się zapisać.'); } finally { setBusy(false); }
  };
  const notice = reviewNotice(item), progress = item.my_state?.progress || 'todo';
  return <div className="plan-item-summary">
    <div className="plan-item-meta"><KindChip item={item}/><span>{describeAudience(item)}</span></div>
    {heading && <strong className="plan-item-title">{item.title}</strong>}
    <span className="plan-item-when">{describeItemTime(item)}{item.subject ? ` · ${item.subject}` : ''}</span>
    {notice && <p className="plan-item-review" role="note"><AlertTriangle size={15} aria-hidden="true"/>{notice}</p>}
    {item.details && <p className="plan-item-details">{item.details}</p>}
    {onState && <div className="plan-item-progress" role="group" aria-label="Twój postęp">
      {Object.entries(PROGRESS).map(([value, label]) => <button key={value} type="button" aria-pressed={progress === value}
        disabled={busy} onClick={() => progress !== value && run({ progress: value })}>{label}</button>)}
      <button type="button" className="plan-item-hide" disabled={busy} onClick={() => run({ hidden: true })}>
        <EyeOff size={14} aria-hidden="true"/>Ukryj u mnie</button>
    </div>}
    {error && <p role="alert" className="event-details-error">{error}</p>}
  </div>;
}
