import { useId, useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { KINDS } from './planItemLogic';
import { addDays, canWriteAnyGroup, canWriteGroup, classGroup, classOf, classTerms, describeTerm, editItems, facultyOf,
  laterTerms, newItems, SERIES_CHOICES, seriesOf, termError, termOfItem, termsLabel, writableGroups } from './planItemEditing';

const MAX_TERMS = 20;
const groupLabel = group => (group == null ? 'Wszystkie grupy' : `Grupa ${group}`);
// Reports and projects are handed in by a date; everything else happens at a time.
const defaultTiming = kind => (kind === 'sprawozdanie' || kind === 'projekt' ? 'due' : 'slot');


// Adds entries (from a class or a free slot in the grid) or edits one, optionally with the rest of its series.
// source: { type: 'class', ev, date } | { type: 'slot', term, faculty } | { type: 'edit', item }.
export default function PlanItemForm({ source, actions, onDone, onCancel }) {
  const id = useId();
  const { roles, scheduleId, planEvents, today } = actions;
  const editing = source.type === 'edit' ? source.item : null;
  const host = source.type === 'class' ? source.ev : editing?.timing === 'class' ? classOf(planEvents, editing.event_id) : null;
  const faculty = editing?.faculty || (host ? facultyOf(host, scheduleId) : source.faculty);
  const onClass = source.type === 'class' || editing?.timing === 'class';
  const subjects = useMemo(() => actions.subjectsFor(faculty), [actions, faculty]);

  const [form, setForm] = useState(() => {
    if (editing) return { kind: editing.kind, scope: editing.scope, title: editing.title, details: editing.details || '',
      subject: editing.subject || '', group: editing.group ?? null, faculty };
    const scope = (host ? canWriteGroup(roles, faculty, classGroup(host)) : canWriteAnyGroup(roles, faculty)) ? 'group' : 'personal';
    return { kind: 'kolokwium', scope, title: '', details: '', subject: host?.title || '', group: host ? classGroup(host) : undefined, faculty };
  });
  const set = change => setForm(previous => ({ ...previous, ...change }));

  // Suggestions: the group's next classes (from a class) or one and two weeks later (from a free slot).
  const suggestions = useMemo(() => {
    if (host) return classTerms(planEvents, host, { scheduleId, from: editing ? (editing.date < today ? editing.date : today) : source.date });
    // The class is not in the loaded plan: the entry keeps its own class.
    if (editing?.timing === 'class') return [termOfItem(editing)];
    if (source.type === 'slot') return laterTerms(source.term);
    return [];
  }, [host, planEvents, scheduleId, editing, today, source]);
  const [picked, setPicked] = useState(() => new Set(source.type === 'class' ? [suggestions[0]?.key].filter(Boolean)
    : editing?.timing === 'class' ? [`class:${editing.event_id}`] : []));
  const [customs, setCustoms] = useState(() => source.type === 'slot' ? [{ ...source.term, key: 'custom-0' }]
    : editing && editing.timing !== 'class' ? [{ ...termOfItem(editing), key: 'custom-0' }] : []);
  const [which, setWhich] = useState('one');
  const [busy, setBusy] = useState(false), [error, setError] = useState('');

  const groupOptions = useMemo(() => {
    if (onClass) return [];
    const groups = subjects.find(item => item.subject === form.subject)?.groups || [];
    return writableGroups(roles, faculty, groups);
  }, [onClass, subjects, form.subject, roles, faculty]);
  const mayGroup = editing ? editing.scope === 'group' : host ? canWriteGroup(roles, faculty, classGroup(host)) : canWriteAnyGroup(roles, faculty);
  const group = form.scope === 'group' && !onClass && !groupOptions.includes(form.group) ? groupOptions[0] : form.group;

  const terms = [...suggestions.filter(term => picked.has(term.key)), ...customs];
  const members = editing ? seriesOf(actions.items, editing, which) : [];
  const seriesSize = editing?.series_id ? actions.items.filter(item => item.series_id === editing.series_id).length : 1;
  const problem = !terms.length ? 'Wybierz co najmniej jeden termin.'
    : terms.length > MAX_TERMS ? `Seria może mieć najwyżej ${MAX_TERMS} terminów.`
    : form.scope === 'group' && !onClass && !form.subject ? 'Wybierz przedmiot.'
    : form.scope === 'group' && !onClass && group === undefined ? 'Nie możesz dodawać wpisów grupowych z tego przedmiotu.'
    : terms.map(termError).find(Boolean) || '';

  // Editing keeps one term: picking a suggestion drops the own date and the other way round.
  const toggle = term => {
    if (editing) { setPicked(new Set([term.key])); setCustoms([]); return; }
    setPicked(previous => { const next = new Set(previous); next.has(term.key) ? next.delete(term.key) : next.add(term.key); return next; });
  };
  const addCustom = () => {
    // A week after the latest term chosen so far, at the same time.
    const last = [...terms].sort((a, b) => a.date.localeCompare(b.date)).pop();
    const base = last ? { ...last, date: addDays(last.date, 7) } : { date: today, start: '08:00', end: '09:30' };
    const timing = last?.timing === 'due' || (!last && defaultTiming(form.kind) === 'due') ? 'due' : 'slot';
    const term = { timing, date: base.date, start: base.start || '08:00', end: base.end || '09:30', due_time: base.due_time || '', key: `custom-${Date.now()}` };
    if (editing) setPicked(new Set());
    setCustoms(previous => editing ? [term] : [...previous, term]);
  };
  const setCustom = (key, change) => setCustoms(previous => previous.map(term => term.key === key ? { ...term, ...change } : term));

  const submit = async event => {
    event.preventDefault();
    if (problem || busy) return;
    const values = { ...form, group };
    setBusy(true); setError('');
    try {
      if (editing) {
        const result = editItems(editing, members, values, terms[0], { planEvents, scheduleId });
        if (result.error) { setError(result.error); setBusy(false); return; }
        if (result.changes.length) await actions.update(result.changes, result.undo);
      } else await actions.create(newItems(values, terms));
      onDone();
    } catch (failure) { setError(failure.message || 'Nie udało się zapisać.'); setBusy(false); }
  };

  return <form className="plan-form plan-item-form" onSubmit={submit} aria-label={editing ? 'Edycja terminu' : 'Nowy termin'}>
    <fieldset className="plan-item-kinds">
      <legend>Rodzaj</legend>
      {Object.entries(KINDS).map(([kind, { label, color }]) => <label key={kind} className="plan-item-kind" style={{ '--kind': color }}>
        <input type="radio" name={`${id}-kind`} value={kind} checked={form.kind === kind} onChange={() => set({ kind })}/>{label}
      </label>)}
    </fieldset>
    {editing ? <p className="plan-item-scope-fixed">{form.scope === 'group' ? groupLabel(editing.group) : 'Tylko dla Ciebie'}</p>
      : mayGroup && <fieldset className="plan-item-scope">
        <legend>Dla kogo</legend>
        <label><input type="radio" name={`${id}-scope`} checked={form.scope === 'group'} onChange={() => set({ scope: 'group' })}/>
          {onClass ? groupLabel(classGroup(host)) : 'Dla grupy'}</label>
        <label><input type="radio" name={`${id}-scope`} checked={form.scope === 'personal'} onChange={() => set({ scope: 'personal' })}/>Tylko dla mnie</label>
      </fieldset>}
    {!onClass && <div className="plan-form-row plan-item-subject">
      <label>Przedmiot<select value={form.subject} onChange={event => set({ subject: event.target.value })}>
        <option value="">{form.scope === 'group' ? 'Wybierz przedmiot' : 'Bez przedmiotu'}</option>
        {subjects.map(item => <option key={item.subject} value={item.subject}>{item.subject}</option>)}
      </select></label>
      {form.scope === 'group' && groupOptions.length > 0 && <label>Grupa<select value={group ?? ''}
        onChange={event => set({ group: event.target.value || null })}>
        {groupOptions.map(value => <option key={value ?? ''} value={value ?? ''}>{value ?? 'Wszystkie grupy'}</option>)}
      </select></label>}
    </div>}
    <label>Tytuł<input value={form.title} maxLength={200} placeholder={`np. ${KINDS[form.kind].label} 1`} onChange={event => set({ title: event.target.value })}/></label>
    <label>Zakres materiału (opcjonalnie)<textarea value={form.details} maxLength={4000} rows={2}
      onChange={event => set({ details: event.target.value })}/></label>

    <fieldset className="plan-item-terms">
      <legend>{editing ? 'Termin' : 'Terminy'}</legend>
      {suggestions.length > 0 && <ul className="plan-item-suggestions" aria-label={host ? 'Najbliższe zajęcia grupy' : 'Tydzień i dwa tygodnie później'}>
        {suggestions.map(term => <li key={term.key}><label>
          <input type={editing ? 'radio' : 'checkbox'} name={`${id}-term`} checked={picked.has(term.key)} onChange={() => toggle(term)}/>
          {describeTerm(term)}</label></li>)}
      </ul>}
      {customs.map(term => <div key={term.key} className="plan-item-custom">
        <select aria-label="Rodzaj terminu" value={term.timing} onChange={event => setCustom(term.key, { timing: event.target.value })}>
          <option value="slot">O godzinie</option><option value="due">Do oddania</option>
        </select>
        <input type="date" aria-label="Data" value={term.date} onChange={event => setCustom(term.key, { date: event.target.value })}/>
        {term.timing === 'slot' ? <>
          <input type="time" aria-label="Początek" step="300" value={term.start} onChange={event => setCustom(term.key, { start: event.target.value })}/>
          <input type="time" aria-label="Koniec" step="300" value={term.end} onChange={event => setCustom(term.key, { end: event.target.value })}/>
        </> : <input type="time" aria-label="Godzina oddania (opcjonalnie)" step="300" value={term.due_time || ''}
          onChange={event => setCustom(term.key, { due_time: event.target.value })}/>}
        {(!editing || suggestions.length > 0) && <button type="button" className="plan-item-custom-remove" aria-label={`Usuń termin ${describeTerm(term)}`}
          onClick={() => setCustoms(previous => previous.filter(other => other.key !== term.key))}><X size={14}/></button>}
      </div>)}
      {(!editing || !customs.length) && <button type="button" className="plan-action plan-item-add-term" onClick={addCustom}>
        <Plus size={15}/>{editing ? 'Własna data' : suggestions.length || customs.length ? 'Kolejny termin' : 'Dodaj termin'}</button>}
    </fieldset>

    {editing && seriesSize > 1 && <fieldset className="plan-item-scope">
      <legend>Zmień w serii ({termsLabel(seriesSize)})</legend>
      {Object.entries(SERIES_CHOICES).map(([value, label]) => <label key={value}>
        <input type="radio" name={`${id}-series`} checked={which === value} onChange={() => setWhich(value)}/>{label}</label>)}
    </fieldset>}
    {form.scope === 'group' && !editing && group !== undefined && <p className="plan-item-hint">
      {(onClass ? classGroup(host) : group) == null ? 'Zobaczą go wszystkie grupy przedmiotu.' : `Zobaczy go cała grupa ${onClass ? classGroup(host) : group}.`}</p>}
    {(error || (problem && terms.length > 0)) && <p role="alert" className="event-details-error">{error || problem}</p>}
    <div className="plan-form-buttons">
      <button type="submit" className="event-details-edit" disabled={busy || Boolean(problem)}>
        {busy ? 'Zapisywanie…' : editing ? 'Zapisz' : terms.length > 1 ? `Dodaj ${termsLabel(terms.length)}` : 'Dodaj'}</button>
      <button type="button" className="plan-action" disabled={busy} onClick={onCancel}>Anuluj</button>
    </div>
  </form>;
}
