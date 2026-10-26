import { useId, useState } from 'react';
import { AlertTriangle, EyeOff, Pencil, Trash2 } from 'lucide-react';
import { PROGRESS, describeAudience, describeItemTime, kindOf, reviewNotice } from './planItemLogic';
import { groupDuplicateOf, SERIES_CHOICES, seriesOf } from './planItemEditing';

export function KindChip({ item }) {
  const kind = kindOf(item);
  return <span className="plan-item-chip" style={{ '--kind': kind.color }}>{kind.label}</span>;
}

// One entry with its own progress for the signed-in user; onState is absent for guests. With actions, whoever
// may change the entry can edit it (onEdit) or remove it, with the rest of its series if they choose.
export default function PlanItemSummary({ item, onState, heading = true, actions, onEdit }) {
  const id = useId();
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [removing, setRemoving] = useState(false), [which, setWhich] = useState('one');
  const attempt = async action => {
    setBusy(true); setError('');
    try { await action(); } catch (failure) { setError(failure.message || 'Nie udało się zapisać.'); } finally { setBusy(false); }
  };
  const run = change => attempt(() => onState(item.id, change));
  const editable = Boolean(actions && onEdit && item.can_edit);
  const seriesSize = editable && item.series_id ? actions.items.filter(other => other.series_id === item.series_id).length : 1;
  const chosen = editable ? seriesOf(actions.items, item, which) : [];
  const duplicate = editable ? groupDuplicateOf(actions.items, item) : null;
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
    {duplicate && !removing && <div className="plan-item-duplicate" role="note">
      <span>Grupa ma już ten termin: „{duplicate.title}”. Twój prywatny wpis nie jest potrzebny.</span>
      <button type="button" disabled={busy} onClick={() => attempt(() => actions.remove([item]))}>Usuń mój wpis</button>
    </div>}
    {editable && !removing && <div className="plan-item-manage">
      <button type="button" disabled={busy} onClick={() => onEdit(item)}><Pencil size={14} aria-hidden="true"/>Edytuj</button>
      <button type="button" disabled={busy} onClick={() => setRemoving(true)}><Trash2 size={14} aria-hidden="true"/>Usuń</button>
    </div>}
    {removing && <div className="plan-item-removing" role="group" aria-label="Usuwanie terminu">
      {seriesSize > 1 && <div className="plan-item-scope">{Object.entries(SERIES_CHOICES).map(([value, label]) => <label key={value}>
        <input type="radio" name={`${id}-remove`} checked={which === value} onChange={() => setWhich(value)}/>{label}</label>)}</div>}
      {item.scope === 'group' && <p>Termin zniknie z planu całej grupy. Można to cofnąć.</p>}
      <div className="plan-form-buttons">
        <button type="button" className="event-details-remove" disabled={busy}
          onClick={() => attempt(() => actions.remove(chosen))}>{busy ? 'Usuwanie…' : chosen.length > 1 ? `Usuń (${chosen.length})` : 'Usuń'}</button>
        <button type="button" className="plan-action" disabled={busy} onClick={() => setRemoving(false)}>Anuluj</button>
      </div>
    </div>}
    {error && <p role="alert" className="event-details-error">{error}</p>}
  </div>;
}
