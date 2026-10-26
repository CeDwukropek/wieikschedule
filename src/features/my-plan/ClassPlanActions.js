import { useId, useMemo, useState } from 'react';
import { MoveRight, DoorOpen, Ban, RotateCcw, Trash2, AlertTriangle } from 'lucide-react';
import { addMinutes, normalizeTime, timeToMinutes } from '../../utils/time';
import { describeSlot, mergePatch, moveChanges, shortDate, startTimeOptions, validateMove } from './planEditing';
import { chooseMembers, MAX_SERIES_CHANGES, resultsOf, seriesChanges, SERIES_SCOPES } from './seriesChanges';

// "Odwołano 3 zajęcia", "Odwołano 5 zajęć".
const classes = count => `${count} ${[2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100) ? 'zajęcia' : 'zajęć'}`;

// "Na tych zajęciach Twoja grupa ma kolokwium": a private change never moves the group's term.
export function EntriesNotice({ entries }) {
  if (!entries?.length) return null;
  return <p className="plan-item-review" role="note"><AlertTriangle size={15} aria-hidden="true"/>
    Na tych zajęciach Twoja grupa ma: {entries.map(item => item.title).join(', ')}. Przeniesienie albo odwołanie zmienia tylko
    Twój plan — termin napisania ustal z prowadzącym.</p>;
}

// Private changes of a class occurrence, made from its details dialog; with a series, also of the following
// occurrences or all of them, saved together.
export default function ClassPlanActions({ ev, current, planActions, onDone, onBusyChange, entries = [] }) {
  const id = useId();
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
  // The university series of this class; a scope other than "Tylko te zajęcia" changes several occurrences at once.
  const members = useMemo(() => (isAdded || !planActions.seriesFor ? [] : planActions.seriesFor(ev)), [isAdded, planActions, ev]);
  const [which, setWhich] = useState('one');
  const chosen = which === 'one' ? [] : chooseMembers(members, ev.event_id, which);
  const series = which !== 'one';
  const plan = kind => seriesChanges(kind, chosen, { current, form: { ...form, room: form.room.trim() }, reason: form.reason.trim() });
  const conflicts = mode === 'move' && !series && !validateMove(form, planActions.bounds)
    ? planActions.conflictsFor(ev.event_id, form) : [];
  const moves = mode === 'move' && series ? plan('move') : [];
  const targets = resultsOf(moves, chosen);
  const seriesMoveError = targets.map(target => validateMove(target, planActions.bounds) && `${shortDate(target.date)}: ${validateMove(target, planActions.bounds)}`).find(Boolean) || '';
  const seriesConflicts = mode === 'move' && series && !seriesMoveError
    ? targets.filter(target => planActions.conflictsFor(target.event_id, target).length).map(target => shortDate(target.date)) : [];

  const setBusy = value => { setBusyState(value); onBusyChange?.(value); };
  const run = async action => {
    setBusy(true); setError('');
    try { await action(); onDone(); } catch (failure) { setError(failure.message || 'Nie udało się zapisać zmiany.'); setBusy(false); }
  };
  const save = patchChanges => run(() => planActions.apply({ event_id: ev.event_id, operation: 'upsert', action: 'modify',
    patch: mergePatch(override, patchChanges), reason: form.reason.trim() || null }));
  const saveSeries = (kind, message) => {
    const changes = kind === 'move' ? moves : plan(kind);
    if (!changes.length) { setError('W wybranych zajęciach nie ma czego zmienić.'); return; }
    if (changes.length > MAX_SERIES_CHANGES) { setError(`Naraz można zmienić najwyżej ${MAX_SERIES_CHANGES} zajęć.`); return; }
    run(() => planActions.applyBatch(changes, message(changes.length)));
  };
  // Changing the start keeps the length; the end can still be adjusted.
  const setStart = start => setForm(previous => ({ ...previous, start,
    end: addMinutes(start, timeToMinutes(previous.end) - timeToMinutes(previous.start)) }));

  const moveError = validateMove(form, planActions.bounds) || seriesMoveError;
  const changes = moveChanges(current, form);
  const scope = members.length > 1 && <fieldset className="plan-series-scope">
    <legend>Dotyczy</legend>
    {Object.entries(SERIES_SCOPES).map(([value, label]) => {
      const count = value === 'one' ? 1 : chooseMembers(members, ev.event_id, value).length;
      return <label key={value}><input type="radio" name={`${id}-scope`} checked={which === value} onChange={() => setWhich(value)}/>
        {label}{value !== 'one' && ` (${count})`}</label>;
    })}
  </fieldset>;

  if (ev.ghost) return <div className="event-details-actions">
    <EntriesNotice entries={entries}/>
    <p>{ev.ghost === 'cancelled' ? 'Te zajęcia są odwołane tylko w Twoim planie.' : `Zajęcia przeniesiono na ${describeSlot(ev.movedTo)}.`}</p>
    <button type="button" className="event-details-edit" disabled={busy} onClick={() => run(() => planActions.apply({ event_id: ev.event_id, operation: 'delete' }))}>
      <RotateCcw size={16}/>{ev.ghost === 'cancelled' ? 'Przywróć zajęcia' : 'Przywróć ten termin'}
    </button>
    {error && <p role="alert" className="event-details-error">{error}</p>}
  </div>;

  return <div className="event-details-actions">
    {original && <p className="plan-original">Oryginalnie: {describeSlot(original)}</p>}
    <EntriesNotice entries={entries}/>
    {mode === 'view' && <>
      {scope}
      <p>{series ? `Zmiany dotyczą ${chosen.length} zajęć z tej serii i tylko Twojego planu.` : 'Zmiany dotyczą tylko tego wystąpienia i tylko Twojego planu.'}</p>
      <div className="plan-action-grid">
        <button type="button" className="event-details-edit" disabled={busy} onClick={() => setMode('move')}><MoveRight size={16}/>Przenieś</button>
        {isAdded
          ? <button type="button" className="event-details-remove" disabled={busy} onClick={() => run(() => planActions.removeAdded(ev.added_event_id))}><Trash2 size={16}/>Usuń z mojego planu</button>
          : <button type="button" className="event-details-remove" disabled={busy} onClick={() => series
            ? saveSeries('cancel', n => `Odwołano ${classes(n)} w Twoim planie.`)
            : run(() => planActions.apply({ event_id: ev.event_id, operation: 'upsert', action: 'cancel', patch: {} }))}><Ban size={16}/>Odwołaj u mnie{series ? ` (${chosen.length})` : ''}</button>}
        {(series ? chosen.some(member => member.override) : override) && <button type="button" className="plan-action" disabled={busy}
          onClick={() => series ? saveSeries('restore', n => `Przywrócono plan uczelni dla ${n} zajęć.`)
            : run(() => planActions.apply({ event_id: ev.event_id, operation: 'delete' }))}><RotateCcw size={16}/>Przywróć plan uczelni</button>}
      </div>
      <details className="plan-more">
        <summary>Więcej</summary>
        <button type="button" className="plan-action" disabled={busy} onClick={() => setMode('room')}><DoorOpen size={16}/>Zmień salę</button>
      </details>
    </>}
    {mode === 'move' && <form className="plan-form" onSubmit={event => { event.preventDefault();
      if (moveError) return;
      if (series) saveSeries('move', n => `Przeniesiono ${classes(n)} w Twoim planie.`);
      else if (Object.keys(changes).length) save(changes); }}>
      {scope}
      {series && <p>Każde z wybranych zajęć przesunie się o tyle samo dni; nowe godziny dotyczą wszystkich, jeśli je zmienisz.</p>}
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
        : conflicts.length > 0 ? <div className="plan-conflicts" role="status">
          <strong>Koliduje z:</strong>
          <ul>{conflicts.map(item => <li key={`${item.title}-${item.start}`}>{item.title} ({item.start}–{item.end}{item.room ? `, ${item.room}` : ''})</li>)}</ul>
        </div> : seriesConflicts.length > 0 && <div className="plan-conflicts" role="status">
          <strong>Kolizje w {seriesConflicts.length} {seriesConflicts.length === 1 ? 'terminie' : 'terminach'}:</strong> {seriesConflicts.join(', ')}
        </div>}
      <div className="plan-form-buttons">
        <button type="submit" className="event-details-edit" disabled={busy || Boolean(moveError) || (series ? !moves.length : !Object.keys(changes).length)}>
          {busy ? 'Zapisywanie…' : series ? `Zapisz (${moves.length})` : 'Zapisz'}</button>
        <button type="button" className="plan-action" disabled={busy} onClick={() => { setMode('view'); setError(''); }}>Anuluj</button>
      </div>
    </form>}
    {mode === 'room' && <form className="plan-form" onSubmit={event => { event.preventDefault();
      if (series) saveSeries('room', n => `Zmieniono salę w ${n} zajęciach Twojego planu.`);
      else save({ room: form.room.trim() || null }); }}>
      {scope}
      <label>Sala<input value={form.room} maxLength={256} autoFocus placeholder="Puste pole usuwa salę"
        onChange={event => setForm({ ...form, room: event.target.value })}/></label>
      <div className="plan-form-buttons">
        <button type="submit" className="event-details-edit" disabled={busy || (!series && form.room.trim() === (current.room || ''))}>{busy ? 'Zapisywanie…' : 'Zapisz'}</button>
        <button type="button" className="plan-action" disabled={busy} onClick={() => { setMode('view'); setError(''); }}>Anuluj</button>
      </div>
    </form>}
    {error && <p role="alert" className="event-details-error">{error}</p>}
  </div>;
}
