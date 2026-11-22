import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Calendar1, CalendarRange, Eye, Plus, User, Users, X } from 'lucide-react';
import { KINDS } from './planItemLogic';
import { addDays, canWriteAnyGroup, canWriteGroup, classGroup, classOf, classTerms, describeTerm, editItems, existingFor, facultyOf,
  laterTerms, newItems, SERIES_CHOICES, seriesOf, subjectDuration, subjectTerms, termError, termOfItem, termsLabel,
  writableGroups } from './planItemEditing';
import ChoiceSlider from '../schedule/components/ChoiceSlider';
import { subjectTextColor } from '../schedule/logic/subjectColors';
import { addMinutes, timeToMinutes } from '../../utils/time';

const MAX_TERMS = 20;
const groupLabel = group => (group == null ? 'Wszystkie grupy' : `Grupa ${group}`);
// Reports and projects are handed in by a date; everything else happens at a time.
const defaultTiming = kind => (kind === 'sprawozdanie' || kind === 'projekt' ? 'due' : 'slot');
const SCOPE_INFO = 'Dla siebie: wpis widzisz tylko Ty. Dla grupy: zobaczą go wszyscy z wybranej grupy (albo ze wszystkich grup '
  + 'przedmiotu). Dla grupy mogą dodawać tylko starości.';
const COUNT_INFO = 'Jeden termin: dodajesz jedno wydarzenie. Kilka terminów: zaznaczasz kilka zajęć albo dat i zapisują się jako seria, '
  + 'którą potem zmienisz lub usuniesz za jednym razem.';


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
  // The whole plan of the faculty (every group) and one's own classes in it, for the next classes and their length.
  const events = useMemo(() => actions.scheduleFor?.(faculty) || [], [actions, faculty]);
  const own = useMemo(() => planEvents.filter(ev => facultyOf(ev, scheduleId) === faculty), [planEvents, scheduleId, faculty]);

  const [form, setForm] = useState(() => {
    if (editing) return { kind: editing.kind, scope: editing.scope, title: editing.title, details: editing.details || '',
      subject: editing.subject || '', group: editing.group ?? null, faculty };
    const scope = (host ? canWriteGroup(roles, faculty, classGroup(host)) : canWriteAnyGroup(roles, faculty)) ? 'group' : 'personal';
    return { kind: 'kolokwium', scope, title: '', details: '', subject: host?.title || '', group: host ? classGroup(host) : undefined, faculty };
  });
  const set = change => setForm(previous => ({ ...previous, ...change }));

  const [picked, setPicked] = useState(() => new Set(source.type === 'class'
    ? [classTerms(planEvents, host, { scheduleId, from: source.date })[0]?.key].filter(Boolean)
    : editing?.timing === 'class' ? [`class:${editing.event_id}`] : []));
  const [customs, setCustoms] = useState(() => source.type === 'slot' ? [{ ...source.term, key: 'custom-0' }]
    : editing && editing.timing !== 'class' ? [{ ...termOfItem(editing), key: 'custom-0' }] : []);
  const [which, setWhich] = useState('one');
  // One event by default; several terms are saved as one series.
  const [count, setCount] = useState('one');
  const single = !editing && count === 'one';
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const alert = useRef(null);
  // A refusal from the server shows where the person is looking, not below the fold.
  useEffect(() => { if (error) alert.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' }); }, [error]);

  const groupOptions = useMemo(() => {
    if (onClass) return [];
    const groups = subjects.find(item => item.subject === form.subject)?.groups || [];
    return writableGroups(roles, faculty, groups);
  }, [onClass, subjects, form.subject, roles, faculty]);
  const mayGroup = editing ? editing.scope === 'group' : host ? canWriteGroup(roles, faculty, classGroup(host)) : canWriteAnyGroup(roles, faculty);
  const group = form.scope === 'group' && !onClass && !groupOptions.includes(form.group) ? groupOptions[0] : form.group;
  // A group entry can only be about a subject with a group one may write for.
  const subjectChoices = form.scope === 'group' && !editing
    ? subjects.filter(item => item.subject === form.subject || writableGroups(roles, faculty, item.groups).length) : subjects;

  // Suggestions: the group's next classes (from a class), the next classes of the chosen subject and group (from a free
  // slot), or one and two weeks later when the subject has no classes then.
  const { suggestions, suggestionsLabel } = useMemo(() => {
    if (host) return { suggestionsLabel: 'Najbliższe zajęcia grupy',
      suggestions: classTerms(planEvents, host, { scheduleId, from: editing ? (editing.date < today ? editing.date : today) : source.date }) };
    // The class is not in the loaded plan: the entry keeps its own class.
    if (editing?.timing === 'class') return { suggestionsLabel: 'Zajęcia', suggestions: [termOfItem(editing)] };
    if (source.type !== 'slot') return { suggestions: [] };
    const from = source.term.date;
    const classes = form.scope === 'group' ? subjectTerms(events, { subject: form.subject, group, from })
      : subjectTerms(own, { subject: form.subject, anyGroup: true, from });
    return classes.length ? { suggestionsLabel: 'Najbliższe zajęcia przedmiotu', suggestions: classes }
      : { suggestionsLabel: 'Tydzień i dwa tygodnie później', suggestions: laterTerms(source.term) };
  }, [host, planEvents, scheduleId, editing, today, source, form.scope, form.subject, group, events, own]);
  // How long the subject's classes last, for the group if it has its own (lectures often take longer).
  const duration = form.subject ? (form.scope === 'group' && !onClass
    ? subjectDuration(events, form.subject, group) ?? subjectDuration(own, form.subject)
    : subjectDuration(own, form.subject) ?? subjectDuration(events, form.subject)) : null;
  // A new subject or group gives own hours the length of its classes, unless the end was set by hand.
  useEffect(() => {
    if (editing || !duration) return;
    setCustoms(previous => previous.map(term => term.timing === 'slot' && !term.manualEnd && term.start
      && timeToMinutes(term.end) - timeToMinutes(term.start) !== duration ? { ...term, end: addMinutes(term.start, duration) } : term));
  }, [editing, duration]);

  // Terms that already have such an entry cannot be added again; a hidden one can be shown instead.
  const values = { ...form, group };
  const takenBy = term => existingFor(actions.items, term, values, editing?.id);
  const chosen = suggestions.filter(term => picked.has(term.key) && !takenBy(term));
  // One term: the suggestion picked, or else the own date.
  const terms = single ? (chosen.length ? chosen.slice(0, 1) : customs.slice(0, 1)) : [...chosen, ...customs];
  const takenCustom = customs.filter(term => terms.includes(term)).map(takenBy).find(Boolean);
  const members = editing ? seriesOf(actions.items, editing, which) : [];
  const seriesSize = editing?.series_id ? actions.items.filter(item => item.series_id === editing.series_id).length : 1;
  const problem = !terms.length ? 'Wybierz co najmniej jeden termin.'
    : terms.length > MAX_TERMS ? `Seria może mieć najwyżej ${MAX_TERMS} terminów.`
    : form.scope === 'group' && !onClass && !form.subject ? 'Wybierz przedmiot.'
    : form.scope === 'group' && !onClass && group === undefined ? 'Nie możesz dodawać wpisów grupowych z tego przedmiotu.'
    : terms.map(termError).find(Boolean)
    || (takenCustom ? `${KINDS[form.kind].label} ${describeTerm(termOfItem(takenCustom))} już jest wpisane${takenCustom.my_state?.hidden ? ' (ukryte u Ciebie)' : ''}.` : '');

  // Editing keeps one term: picking a suggestion drops the own date and the other way round.
  const toggle = term => {
    if (editing) { setPicked(new Set([term.key])); setCustoms([]); return; }
    if (single) { setPicked(new Set([term.key])); return; }
    setPicked(previous => { const next = new Set(previous); next.has(term.key) ? next.delete(term.key) : next.add(term.key); return next; });
  };
  const addCustom = () => {
    // A week after the latest term chosen so far, at the same time.
    const last = [...terms].sort((a, b) => a.date.localeCompare(b.date)).pop();
    // Dates already on the list (ticked or not) are skipped.
    const listed = new Set([...suggestions, ...customs].map(term => term.date));
    let date = last ? addDays(last.date, 7) : today;
    while (last && listed.has(date)) date = addDays(date, 7);
    const base = last ? { ...last, date } : { date, start: '08:00', end: '09:30' };
    const timing = last?.timing === 'due' || (!last && defaultTiming(form.kind) === 'due') ? 'due' : 'slot';
    const term = { timing, date: base.date, start: base.start || '08:00', end: base.end || '09:30', due_time: base.due_time || '', key: `custom-${Date.now()}` };
    if (editing || single) setPicked(new Set());
    setCustoms(previous => editing ? [term] : [...previous, term]);
  };
  // A new start keeps the class length of the subject (or the term's own length); an end set by hand stays.
  const setCustom = (key, change) => setCustoms(previous => previous.map(term => {
    if (term.key !== key) return term;
    if (change.start && term.timing === 'slot') {
      const length = duration || timeToMinutes(term.end) - timeToMinutes(term.start);
      return { ...term, ...change, end: addMinutes(change.start, length > 0 ? length : 90), manualEnd: false };
    }
    return { ...term, ...change, ...(change.end ? { manualEnd: true } : {}) };
  }));
  // Back to one term: the first one chosen stays.
  const chooseCount = value => {
    setCount(value);
    if (value !== 'one') return;
    const first = suggestions.find(term => picked.has(term.key));
    setPicked(new Set(first ? [first.key] : []));
    setCustoms(previous => previous.slice(0, 1));
  };
  const color = name => subjectTextColor(actions.colorOf?.(name)) || undefined;

  const submit = async event => {
    event.preventDefault();
    if (problem || busy) return;
    setBusy(true); setError('');
    try {
      if (editing) {
        const result = editItems(editing, members, values, terms[0], { planEvents, scheduleId });
        if (result.error) { setError(result.error); setBusy(false); return; }
        if (result.changes.length) await actions.update(result.changes, result.undo);
      } else await actions.create(newItems(values, terms));
      onDone();
    } catch (failure) {
      setError(failure.code === 'DUPLICATE'
        ? 'Ten termin jest już wpisany. Jeśli go nie widać, może być ukryty u Ciebie: „Nadchodzące terminy” → „Ukryte u mnie”.'
        : failure.message || 'Nie udało się zapisać.');
      setBusy(false);
    }
  };

  return <form className="plan-form plan-item-form" onSubmit={submit} aria-label={editing ? 'Edycja terminu' : 'Nowy termin'}>
    <fieldset className="plan-item-kinds">
      <legend>Rodzaj</legend>
      {Object.entries(KINDS).map(([kind, { label, color }]) => <label key={kind} className="plan-item-kind" style={{ '--kind': color }}>
        <input type="radio" name={`${id}-kind`} value={kind} checked={form.kind === kind} onChange={() => set({ kind })}/>{label}
      </label>)}
    </fieldset>
    {editing ? <p className="plan-item-scope-fixed">{form.scope === 'group' ? groupLabel(editing.group) : 'Tylko dla Ciebie'}</p>
      : mayGroup && <ChoiceSlider label="Dla kogo" info={SCOPE_INFO} value={form.scope} onChange={scope => set({ scope })} options={[
        { value: 'personal', label: 'Dla siebie', icon: User },
        { value: 'group', label: onClass ? (classGroup(host) == null ? 'Dla wszystkich grup' : `Dla grupy ${classGroup(host)}`) : 'Dla grupy', icon: Users },
      ]}/>}
    {!onClass && <div className="plan-form-row plan-item-subject">
      {/* Each subject in the colour the person gave it in the plan. */}
      <label>Przedmiot<select value={form.subject} style={{ color: color(form.subject) }} onChange={event => set({ subject: event.target.value })}>
        <option value="" style={{ color: '#f5f5f5' }}>{form.scope === 'group' ? 'Wybierz przedmiot' : 'Bez przedmiotu'}</option>
        {subjectChoices.map(item => <option key={item.subject} value={item.subject} style={{ color: color(item.subject) }}>{item.subject}</option>)}
      </select></label>
      {form.scope === 'group' && groupOptions.length > 0 && <label>Grupa<select value={group ?? ''}
        onChange={event => set({ group: event.target.value || null })}>
        {groupOptions.map(value => <option key={value ?? ''} value={value ?? ''}>{value ?? 'Wszystkie grupy'}</option>)}
      </select></label>}
    </div>}
    <label>Tytuł<input value={form.title} maxLength={200} placeholder={`np. ${KINDS[form.kind].label} 1`} onChange={event => set({ title: event.target.value })}/></label>
    <label>Zakres materiału (opcjonalnie)<textarea value={form.details} maxLength={4000} rows={2}
      onChange={event => set({ details: event.target.value })}/></label>

    {!editing && <ChoiceSlider label="Ile terminów" info={COUNT_INFO} value={count} onChange={chooseCount} options={[
      { value: 'one', label: 'Jeden termin', icon: Calendar1 }, { value: 'many', label: 'Kilka terminów', icon: CalendarRange }]}/>}
    <fieldset className="plan-item-terms">
      <legend>{editing || single ? 'Termin' : 'Terminy'}</legend>
      {suggestions.length > 0 && <ul className="plan-item-suggestions" aria-label={suggestionsLabel}>
        {suggestions.map(term => {
          const taken = takenBy(term);
          return <li key={term.key} data-taken={taken ? true : undefined}><label>
            <input type={editing || single ? 'radio' : 'checkbox'} name={`${id}-term`} disabled={Boolean(taken)}
              checked={!taken && (single ? terms[0]?.key === term.key : picked.has(term.key))} onChange={() => toggle(term)}/>
            {describeTerm(term)}{taken && <span className="plan-item-taken">
              {taken.my_state?.hidden ? ' · już wpisane, ukryte u Ciebie' : ` · już wpisane: ${taken.title}`}</span>}</label>
            {taken?.my_state?.hidden && actions.show && <button type="button" className="plan-item-show"
              onClick={() => actions.show(taken.id)}><Eye size={14} aria-hidden="true"/>Pokaż</button>}
          </li>;
        })}
      </ul>}
      {(single ? customs.slice(0, 1) : customs).map(term => <div key={term.key} className="plan-item-custom"
        data-single={single && suggestions.length > 0 ? true : undefined} onFocus={single ? () => setPicked(new Set()) : undefined}>
        {single && suggestions.length > 0 && <input type="radio" name={`${id}-term`} aria-label="Własny termin" checked={terms[0]?.key === term.key}
          onChange={() => setPicked(new Set())}/>}
        <select aria-label="Rodzaj terminu" value={term.timing} onChange={event => setCustom(term.key, { timing: event.target.value })}>
          <option value="slot">O godzinie</option><option value="due">Do oddania</option>
        </select>
        <input type="date" aria-label="Data" value={term.date} onChange={event => setCustom(term.key, { date: event.target.value })}/>
        {term.timing === 'slot' ? <>
          <input type="time" aria-label="Początek" step="300" value={term.start} onChange={event => setCustom(term.key, { start: event.target.value })}/>
          <input type="time" aria-label="Koniec" step="300" value={term.end} onChange={event => setCustom(term.key, { end: event.target.value })}/>
        </> : <input type="time" aria-label="Godzina oddania (opcjonalnie)" step="300" value={term.due_time || ''}
          onChange={event => setCustom(term.key, { due_time: event.target.value })}/>}
        {!single && (!editing || suggestions.length > 0) && <button type="button" className="plan-item-custom-remove" aria-label={`Usuń termin ${describeTerm(term)}`}
          onClick={() => setCustoms(previous => previous.filter(other => other.key !== term.key))}><X size={14}/></button>}
      </div>)}
      {(editing || single ? !customs.length : true) && <button type="button" className="plan-action plan-item-add-term" onClick={addCustom}>
        <Plus size={15}/>{editing || single ? 'Własna data' : suggestions.length || customs.length ? 'Kolejny termin' : 'Dodaj termin'}</button>}
    </fieldset>

    {editing && seriesSize > 1 && <fieldset className="plan-item-scope">
      <legend>Zmień w serii ({termsLabel(seriesSize)})</legend>
      {Object.entries(SERIES_CHOICES).map(([value, label]) => <label key={value}>
        <input type="radio" name={`${id}-series`} checked={which === value} onChange={() => setWhich(value)}/>{label}</label>)}
    </fieldset>}
    {form.scope === 'group' && !editing && group !== undefined && <p className="plan-item-hint">
      {(onClass ? classGroup(host) : group) == null ? 'Zobaczą go wszystkie grupy przedmiotu.' : `Zobaczy go cała grupa ${onClass ? classGroup(host) : group}.`}</p>}
    {error ? <p role="alert" ref={alert} className="plan-item-alert"><AlertTriangle size={16} aria-hidden="true"/>{error}</p>
      : problem && terms.length > 0 && <p role="status" className="plan-item-problem">{problem}</p>}
    <div className="plan-form-buttons">
      <button type="submit" className="event-details-edit" disabled={busy || Boolean(problem)}>
        {busy ? 'Zapisywanie…' : editing ? 'Zapisz' : terms.length > 1 ? `Dodaj ${termsLabel(terms.length)}` : 'Dodaj'}</button>
      <button type="button" className="plan-action" disabled={busy} onClick={onCancel}>Anuluj</button>
    </div>
  </form>;
}
