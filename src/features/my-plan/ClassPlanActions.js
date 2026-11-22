import { useEffect, useId, useMemo, useState } from 'react';
import { Pencil, Ban, RotateCcw, Trash2, AlertTriangle, CalendarDays, CalendarPlus, Clock, MapPin, UserRound, MessageSquare } from 'lucide-react';
import ChoiceSlider, { InfoTip } from '../schedule/components/ChoiceSlider';
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
// occurrences or all of them, saved together. "Zmień" makes the date, hours, room and instructor editable in place
// (onEditingChange lets the dialog hide its read-only rows meanwhile); whom a change concerns is asked only then.
const SCOPE_INFO = 'Tylko te zajęcia: zmiana dotyczy tego jednego terminu. Te i następne: także późniejszych zajęć z tej serii. '
  + 'Wszystkie: całej serii, również wcześniejszych terminów. Zmiany widzisz tylko Ty, w swoim planie.';

// onAddEntry: adding a kolokwium or deadline on this class, shown with the other actions.
export default function ClassPlanActions({ ev, current, planActions, onDone, onBusyChange, onEditingChange, onAddEntry, entries = [] }) {
  const id = useId();
  const override = planActions.overrideFor(ev.event_id);
  const original = override?.action === 'modify' ? override.events : null;
  const isAdded = ev.origin === 'added' && ev.added_event_id;
  // view | change | cancel (going back to the university plan is done in "Mój plan")
  const [mode, setModeState] = useState('view');
  const [busy, setBusyState] = useState(false), [error, setError] = useState('');
  const start0 = normalizeTime(current.start_time);
  const initial = () => ({ date: current.date, start: start0, end: addMinutes(start0, current.duration_min),
    room: current.room || '', instructor: current.instructor || '', reason: override?.reason || '' });
  const [form, setForm] = useState(initial);
  const times = useMemo(() => startTimeOptions(planActions.startTimes.map(time => ({ start_time: time })), start0),
    [planActions.startTimes, start0]);
  // The university series of this class; a scope other than "Tylko te zajęcia" changes several occurrences at once.
  const members = useMemo(() => (isAdded || !planActions.seriesFor ? [] : planActions.seriesFor(ev)), [isAdded, planActions, ev]);
  const hasSeries = members.length > 1;
  const [which, setWhich] = useState('one');
  const chosen = which === 'one' ? [] : chooseMembers(members, ev.event_id, which);
  const series = which !== 'one';
  const edited = { ...form, room: form.room.trim() };
  const plan = kind => seriesChanges(kind, chosen, { current, form: edited, reason: form.reason.trim() });
  const conflicts = mode === 'change' && !series && !validateMove(form, planActions.bounds)
    ? planActions.conflictsFor(ev.event_id, form) : [];
  const moves = mode === 'change' && series ? plan('move') : [];
  const targets = resultsOf(moves, chosen);
  const seriesMoveError = targets.map(target => validateMove(target, planActions.bounds) && `${shortDate(target.date)}: ${validateMove(target, planActions.bounds)}`).find(Boolean) || '';
  const seriesConflicts = mode === 'change' && series && !seriesMoveError
    ? targets.filter(target => planActions.conflictsFor(target.event_id, target).length).map(target => shortDate(target.date)) : [];

  const setMode = next => { setModeState(next); setError(''); if (next === 'view') { setWhich('one'); setForm(initial()); } };
  useEffect(() => { onEditingChange?.(mode === 'change'); }, [mode, onEditingChange]);
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
  const cancelOne = () => run(() => planActions.apply({ event_id: ev.event_id, operation: 'upsert', action: 'cancel', patch: {} }));
  const restoreOne = () => run(() => planActions.apply({ event_id: ev.event_id, operation: 'delete' }));
  // Changing the start keeps the length; the end can still be adjusted.
  const setStart = start => setForm(previous => ({ ...previous, start,
    end: addMinutes(start, timeToMinutes(previous.end) - timeToMinutes(previous.start)) }));

  const moveError = validateMove(form, planActions.bounds) || seriesMoveError;
  const changes = { ...moveChanges(current, form), ...(edited.room !== (current.room || '') ? { room: edited.room || null } : {}) };
  const scope = hasSeries && <ChoiceSlider label="Dotyczy" info={SCOPE_INFO} value={which} onChange={setWhich} disabled={busy} options={
    Object.entries(SERIES_SCOPES).map(([value, label]) => ({ value,
      label: value === 'one' ? label : `${label} (${chooseMembers(members, ev.event_id, value).length})` }))}/>;
  const back = <button type="button" className="plan-action" disabled={busy} onClick={() => setMode('view')}>Anuluj</button>;

  if (ev.ghost) return <div className="event-details-actions">
    <EntriesNotice entries={entries}/>
    <p>{ev.ghost === 'cancelled' ? 'Te zajęcia są odwołane tylko w Twoim planie.' : `Zajęcia przeniesiono na ${describeSlot(ev.movedTo)}.`}</p>
    <button type="button" className="event-details-edit" disabled={busy} onClick={restoreOne}>
      <RotateCcw size={16}/>{ev.ghost === 'cancelled' ? 'Przywróć zajęcia' : 'Przywróć ten termin'}
    </button>
    {error && <p role="alert" className="event-details-error">{error}</p>}
  </div>;

  return <div className={`event-details-actions ${mode === 'change' ? 'is-changing' : ''}`}>
    {original && <p className="plan-original">Oryginalnie: {describeSlot(original)}</p>}
    <EntriesNotice entries={entries}/>
    {mode === 'view' && <>
      <p className="plan-scope-note">Zmiany dotyczą tylko Twojego planu.
        <InfoTip label="przyciski" text={[
          isAdded ? 'Usuń z mojego planu: dopisane zajęcia znikają z Twojego planu.' : 'Odwołaj u mnie: zajęcia znikają tylko z Twojego planu.',
          onAddEntry && 'Dodaj kolokwium lub termin: wpis na tych zajęciach, dla siebie albo (starosta) dla grupy.',
          'Zmień: inna data, godziny, sala lub prowadzący, tylko u Ciebie.',
          'Twoje zmiany cofniesz w „Mój plan” w ustawieniach.',
        ].filter(Boolean).join('\n')}/></p>
      <div className="plan-icon-actions">
        {isAdded
          ? <button type="button" className="event-details-remove" disabled={busy} aria-label="Usuń z mojego planu" title="Usuń z mojego planu"
            onClick={() => run(() => planActions.removeAdded(ev.added_event_id))}><Trash2 size={18}/></button>
          : <button type="button" className="event-details-remove" disabled={busy} aria-label="Odwołaj u mnie" title="Odwołaj u mnie"
            onClick={() => hasSeries ? setMode('cancel') : cancelOne()}><Ban size={18}/></button>}
        {onAddEntry && <button type="button" className="plan-icon-add" disabled={busy} aria-label="Dodaj kolokwium lub termin"
          title="Dodaj kolokwium lub termin" onClick={onAddEntry}><CalendarPlus size={18}/></button>}
        <button type="button" className="event-details-edit" disabled={busy} aria-label="Zmień" title="Zmień" onClick={() => setMode('change')}>
          <Pencil size={18}/></button>
      </div>
    </>}
    {mode === 'cancel' && <>
      {scope}
      <p>{series ? `Odwołasz ${classes(chosen.length)} z tej serii, tylko w Twoim planie.` : 'Odwołasz tylko te zajęcia, tylko w Twoim planie.'}</p>
      <div className="plan-form-buttons">
        <button type="button" className="event-details-remove" disabled={busy} onClick={() => series
          ? saveSeries('cancel', n => `Odwołano ${classes(n)} w Twoim planie.`) : cancelOne()}>
          <Ban size={16}/>Odwołaj u mnie{series ? ` (${chosen.length})` : ''}</button>
        {back}
      </div>
    </>}
    {mode === 'change' && <form className="plan-form" aria-label="Zmiana zajęć" onSubmit={event => { event.preventDefault();
      if (moveError) return;
      if (series) saveSeries('move', n => `Zmieniono ${classes(n)} w Twoim planie.`);
      else if (Object.keys(changes).length) save(changes); }}>
      <dl className="event-details-list plan-change-list">
        <div><dt title="Data"><CalendarDays size={17} aria-hidden="true"/><span className="sr-only">Data</span></dt><dd><input type="date" aria-label="Data" value={form.date}
          min={planActions.bounds.min || undefined} max={planActions.bounds.max || undefined}
          onChange={event => setForm({ ...form, date: event.target.value })}/></dd></div>
        <div><dt title="Godzina"><Clock size={17} aria-hidden="true"/><span className="sr-only">Godzina</span></dt><dd className="plan-change-hours">
          <input type="time" aria-label="Początek" step="300" list={`${id}-times`} value={form.start}
            onChange={event => event.target.value && setStart(event.target.value)}/>
          <span aria-hidden="true">–</span>
          <input type="time" aria-label="Koniec" step="300" value={form.end} onChange={event => setForm({ ...form, end: event.target.value })}/>
          <datalist id={`${id}-times`}>{times.map(time => <option key={time} value={time}/>)}</datalist>
        </dd></div>
        <div><dt title="Sala"><MapPin size={17} aria-hidden="true"/><span className="sr-only">Sala</span></dt><dd><input aria-label="Sala" value={form.room} maxLength={256} placeholder="Puste pole usuwa salę"
          onChange={event => setForm({ ...form, room: event.target.value })}/></dd></div>
        <div><dt title="Prowadzący"><UserRound size={17} aria-hidden="true"/><span className="sr-only">Prowadzący</span></dt><dd><input aria-label="Prowadzący" value={form.instructor} maxLength={256}
          onChange={event => setForm({ ...form, instructor: event.target.value })}/></dd></div>
        <div><dt title="Powód"><MessageSquare size={17} aria-hidden="true"/><span className="sr-only">Powód</span></dt><dd><textarea aria-label="Powód (opcjonalnie)" placeholder="Opcjonalnie" rows={2}
          value={form.reason} maxLength={1000} onChange={event => setForm({ ...form, reason: event.target.value })}/></dd></div>
      </dl>
      {scope}
      {series && <p>Każde z wybranych zajęć przesunie się o tyle samo dni; nowe godziny, sala i prowadzący dotyczą wszystkich, jeśli je zmienisz.</p>}
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
        {back}
      </div>
    </form>}
    {error && <p role="alert" className="event-details-error">{error}</p>}
  </div>;
}
