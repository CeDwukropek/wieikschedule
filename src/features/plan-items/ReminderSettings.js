import { useState } from 'react';
import { X } from 'lucide-react';
import { KINDS } from './planItemLogic';
import { MAX_REMINDERS, REMINDER_PRESETS, reminderKey, reminderLabel } from './reminders';

// Reminders by kind, used by the Odysseus calendar and the ICS export. Every change is saved at once.
export default function ReminderSettings({ reminders, custom, onSave }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const save = async next => {
    setBusy(true); setError('');
    try { await onSave(next); } catch (failure) { setError(failure.message || 'Nie udało się zapisać przypomnień.'); }
    finally { setBusy(false); }
  };
  const change = (kind, list) => save({ ...reminders, [kind]: list });
  return <div className="reminder-settings">
    <p className="reminder-settings-title">Przypomnienia <span>— w kalendarzu Odysseusa i w eksporcie ICS</span></p>
    <ul>{Object.entries(KINDS).map(([kind, { label, color }]) => {
      const list = reminders[kind] || [], used = new Set(list.map(reminderKey));
      return <li key={kind}>
        <span className="reminder-kind" style={{ '--kind': color }}>{label}</span>
        <span className="reminder-list">
          {!list.length && <span className="reminder-none">bez przypomnień</span>}
          {list.map(reminder => <span key={reminderKey(reminder)} className="reminder-chip">{reminderLabel(reminder)}
            <button type="button" disabled={busy} aria-label={`Usuń przypomnienie: ${label}, ${reminderLabel(reminder)}`}
              onClick={() => change(kind, list.filter(other => reminderKey(other) !== reminderKey(reminder)))}><X size={12}/></button></span>)}
          {list.length < MAX_REMINDERS && <select aria-label={`Dodaj przypomnienie: ${label}`} disabled={busy} value=""
            onChange={event => event.target.value && change(kind, [...list, JSON.parse(event.target.value)])}>
            <option value="">+ Dodaj</option>
            {REMINDER_PRESETS.filter(preset => !used.has(reminderKey(preset))).map(preset =>
              <option key={reminderKey(preset)} value={reminderKey(preset)}>{reminderLabel(preset)}</option>)}
          </select>}
        </span>
      </li>;
    })}</ul>
    {custom && <button type="button" className="reminder-reset" disabled={busy} onClick={() => save(null)}>Przywróć domyślne</button>}
    {error && <p role="alert" className="plan-item-alert">{error}</p>}
  </div>;
}
