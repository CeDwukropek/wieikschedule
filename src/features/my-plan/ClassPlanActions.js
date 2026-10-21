import { useMemo, useState } from 'react';
import { MoveRight, DoorOpen, Ban, RotateCcw, Trash2 } from 'lucide-react';
import { addMinutes, normalizeTime, timeToMinutes } from '../../utils/time';
import { describeSlot, mergePatch, moveChanges, startTimeOptions, validateMove } from './planEditing';

// Private changes of one class occurrence, made from its details dialog.
export default function ClassPlanActions({ ev, current, planActions, onDone, onBusyChange }) {
  const override = planActions.overrideFor(ev.event_id);
  const original = override?.action === 'modify' ? override.events : null;
  const isAdded = ev.origin === 'added' && ev.added_event_id;
  const [mode, setMode] = useState('view');
  const [busy, setBusyState] = useState(false), [error, setError] = useState('');
  const start0 = normalizeTime(current.start_time);
  const [form, setForm] = useState({ date: current.date, start: start0, end: addMinutes(start0, current.duration_min),
    room: current.room || '', instructor: current.instructor || '', reason: override?.reason || '' });
  const times = useMemo(() => startTimeOptions(planActions.startTimes.map(time => ({ start_time: time })), start0),
    [planActions.startTimes, start0]);
  const conflicts = mode === 'move' && !validateMove(form, planActions.bounds)
    ? planActions.conflictsFor(ev.event_id, form) : [];

  const setBusy = value => { setBusyState(value); onBusyChange?.(value); };
  const run = async action => {
    setBusy(true); setError('');
    try { await action(); onDone(); } catch (failure) { setError(failure.message || 'Nie udało się zapisać zmiany.'); setBusy(false); }
  };
  const save = patchChanges => run(() => planActions.apply({ event_id: ev.event_id, operation: 'upsert', action: 'modify',
    patch: mergePatch(override, patchChanges), reason: form.reason.trim() || null }));
  // Changing the start keeps the length; the end can still be adjusted.
  const setStart = start => setForm(previous => ({ ...previous, start,
    end: addMinutes(start, timeToMinutes(previous.end) - timeToMinutes(previous.start)) }));

  const moveError = validateMove(form, planActions.bounds);
  const changes = moveChanges(current, form);

  return <div className="event-details-actions">
    {original && <p className="plan-original">Oryginalnie: {describeSlot(original)}</p>}
    {mode === 'view' && <>
      <p>Zmiany dotyczą tylko tego wystąpienia i tylko Twojego planu.</p>
      <div className="plan-action-grid">
        <button type="button" className="event-details-edit" disabled={busy} onClick={() => setMode('move')}><MoveRight size={16}/>Przenieś</button>
        <button type="button" className="plan-action" disabled={busy} onClick={() => setMode('room')}><DoorOpen size={16}/>Zmień salę</button>
        {isAdded
          ? <button type="button" className="event-details-remove" disabled={busy} onClick={() => run(() => planActions.removeAdded(ev.added_event_id))}><Trash2 size={16}/>Usuń z mojego planu</button>
          : <button type="button" className="event-details-remove" disabled={busy} onClick={() => run(() => planActions.apply({ event_id: ev.event_id, operation: 'upsert', action: 'cancel', patch: {} }))}><Ban size={16}/>Odwołaj u mnie</button>}
        {override && <button type="button" className="plan-action" disabled={busy} onClick={() => run(() => planActions.apply({ event_id: ev.event_id, operation: 'delete' }))}><RotateCcw size={16}/>Przywróć plan uczelni</button>}
      </div>
    </>}
    {mode === 'move' && <form className="plan-form" onSubmit={event => { event.preventDefault(); if (!moveError && Object.keys(changes).length) save(changes); }}>
      <div className="plan-form-row">
        <label>Data<input type="date" value={form.date} min={planActions.bounds.min || undefined} max={planActions.bounds.max || undefined}
          onChange={event => setForm({ ...form, date: event.target.value })}/></label>
        <label>Początek<select value={form.start} onChange={event => setStart(event.target.value)}>
          {(times.includes(form.start) ? times : [...times, form.start]).map(time => <option key={time} value={time}>{time}</option>)}
        </select></label>
        <label>Koniec<input type="time" step="300" value={form.end} onChange={event => setForm({ ...form, end: event.target.value })}/></label>
      </div>
      <details className="plan-more">
        <summary>Więcej</summary>
        <label>Inna godzina rozpoczęcia<input type="time" step="300" value={form.start} onChange={event => event.target.value && setStart(event.target.value)}/></label>
        <label>Prowadzący<input value={form.instructor} maxLength={256} onChange={event => setForm({ ...form, instructor: event.target.value })}/></label>
        <label>Powód (opcjonalnie)<textarea value={form.reason} maxLength={1000} onChange={event => setForm({ ...form, reason: event.target.value })}/></label>
      </details>
      {moveError ? <p role="alert" className="event-details-error">{moveError}</p>
        : conflicts.length > 0 && <div className="plan-conflicts" role="status">
          <strong>Koliduje z:</strong>
          <ul>{conflicts.map(item => <li key={`${item.title}-${item.start}`}>{item.title} ({item.start}–{item.end}{item.room ? `, ${item.room}` : ''})</li>)}</ul>
        </div>}
      <div className="plan-form-buttons">
        <button type="submit" className="event-details-edit" disabled={busy || Boolean(moveError) || !Object.keys(changes).length}>{busy ? 'Zapisywanie…' : 'Zapisz'}</button>
        <button type="button" className="plan-action" disabled={busy} onClick={() => { setMode('view'); setError(''); }}>Anuluj</button>
      </div>
    </form>}
    {mode === 'room' && <form className="plan-form" onSubmit={event => { event.preventDefault(); save({ room: form.room.trim() || null }); }}>
      <label>Sala<input value={form.room} maxLength={256} autoFocus placeholder="Puste pole usuwa salę"
        onChange={event => setForm({ ...form, room: event.target.value })}/></label>
      <div className="plan-form-buttons">
        <button type="submit" className="event-details-edit" disabled={busy || form.room.trim() === (current.room || '')}>{busy ? 'Zapisywanie…' : 'Zapisz'}</button>
        <button type="button" className="plan-action" disabled={busy} onClick={() => { setMode('view'); setError(''); }}>Anuluj</button>
      </div>
    </form>}
    {error && <p role="alert" className="event-details-error">{error}</p>}
  </div>;
}
