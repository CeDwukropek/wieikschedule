import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Clock, MapPin, Users, UserRound, CalendarDays, CalendarPlus } from 'lucide-react';
import { splitTeacherDisplay } from '../logic/teacherDisplay';
import { eventSubject } from './EventCard';
import ClassPlanActions from '../../my-plan/ClassPlanActions';
import PlanItemSummary from '../../plan-items/PlanItemSummary';
import PlanItemForm from '../../plan-items/PlanItemForm';
import MakeupOptions from '../../plan-items/MakeupOptions';
import { timeToMinutes } from '../../../utils/time';

const isoDate = value => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;

export default function EventDetailsDialog({ ev, subjects, date, onClose, planActions, onItemState, itemActions, onBrowse }) {
  const dialog = useRef(null);
  const titleId = useId();
  const [busy, setBusy] = useState(false);
  // Adding a kolokwium or deadline on this class, or editing one of its entries, replaces the actions below.
  const [entryForm, setEntryForm] = useState(null);
  // Group entries on this class (also when the person moved or cancelled it, or hid the entry).
  const classEntries = (itemActions?.items || []).filter(item => item.scope === 'group' && item.timing === 'class'
    && ev.event_id && String(item.event_id) === String(ev.event_id));
  const changedHere = Boolean(ev.ghost || planActions?.overrideFor?.(ev.event_id));
  const subject = eventSubject(ev, subjects);
  const teachers = splitTeacherDisplay(ev.teacher);
  // The occurrence as shown, i.e. the university plan with the person's changes applied.
  const current = { date: isoDate(date), start_time: `${ev.start}:00`, duration_min: timeToMinutes(ev.end) - timeToMinutes(ev.start),
    room: ev.room || '', instructor: ev.teacher || '' };

  useEffect(() => {
    const node = dialog.current;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (typeof node.showModal === 'function') node.showModal();
    else node.setAttribute('open', '');
    return () => {
      if (typeof node.close === 'function') node.close();
      document.body.style.overflow = overflow;
      if (previous?.isConnected) previous.focus();
    };
  }, []);


  return createPortal(
    <dialog ref={dialog} className="event-details-dialog" aria-labelledby={titleId} aria-modal="true"
      onCancel={event => {event.preventDefault();if (!busy) onClose();}}
      onClick={event => {if (event.target === event.currentTarget && !busy) onClose();}}>
      <section className="event-details-content">
        <header className="event-details-header">
          <div>
            <p className="event-details-eyebrow">{ev.ghost ? 'Oryginalny termin uczelni' : 'Szczegóły zajęć'}</p>
            <h2 id={titleId}>{subject.name}</h2>
          </div>
          <button type="button" className="event-details-close" aria-label="Zamknij szczegóły zajęć" disabled={busy} onClick={onClose}><X size={20}/></button>
        </header>
        <div className="event-details-badges">
          {ev.type && <span>{ev.type}</span>}
          {ev.origin === 'added' && <span className="event-details-personal">Odrobienie</span>}
          {ev.ghost === 'cancelled' && <span className="event-details-ghost">Odwołane u mnie</span>}
          {ev.ghost === 'moved-from' && <span className="event-details-ghost">Przeniesione</span>}
          {ev.personal_override && !ev.ghost && <span className="event-details-personal">Zmienione u mnie</span>}
          {ev._isExternal && <span>Plan {ev._sourceScheduleId}</span>}
          {ev.plan && <span>Plan {ev.plan}</span>}
        </div>
        <dl className="event-details-list">
          <div><dt><CalendarDays size={17}/>Data</dt><dd>{date.toLocaleDateString('pl-PL', {weekday:'long',day:'numeric',month:'long',year:'numeric'})}</dd></div>
          <div><dt><Clock size={17}/>Godzina</dt><dd>{ev.start}–{ev.end}</dd></div>
          {/* An instructor or a room opens their plan across all plans. */}
          <div><dt><MapPin size={17}/>Sala</dt><dd>{ev.room ? (onBrowse ? <button type="button" className="event-details-browse"
            onClick={() => { onClose(); onBrowse({ room: ev.room }); }} aria-label={`Sala ${ev.room}: pokaż plan sali`}>{ev.room}</button> : ev.room) : 'Nie podano'}</dd></div>
          <div><dt><UserRound size={17}/>Prowadzący</dt><dd>{teachers.length ? teachers.map(teacher => onBrowse
            ? <button key={teacher} type="button" className="event-details-browse" onClick={() => { onClose(); onBrowse({ teacher }); }}
              aria-label={`${teacher}: pokaż plan prowadzącego`}>{teacher}</button>
            : <span key={teacher}>{teacher}</span>) : 'Nie podano'}</dd></div>
          <div><dt><Users size={17}/>Grupa</dt><dd>{ev.groups?.length ? ev.groups.join(', ') : 'Wszystkie grupy'}</dd></div>
        </dl>
        {entryForm ? <section className="event-details-actions" aria-label={entryForm.type === 'edit' ? 'Edycja terminu' : 'Nowy termin na tych zajęciach'}>
          <h3 className="plan-item-form-title">{entryForm.type === 'edit' ? `Edycja: ${entryForm.item.title}` : 'Nowy termin'}</h3>
          <PlanItemForm source={entryForm} actions={itemActions} onDone={() => setEntryForm(null)} onCancel={() => setEntryForm(null)}/>
        </section> : <>
          {ev.entries?.some(item => !item.draft) && <section className="event-details-entries" aria-label="Terminy na tych zajęciach">
            <h3>Na tych zajęciach</h3>
            {ev.entries.filter(item => !item.draft).map(item => <PlanItemSummary key={item.id} item={item} onState={onItemState} actions={itemActions}
              onEdit={entry => setEntryForm({ type: 'edit', item: entry })}/>)}
          </section>}
          {itemActions && ev.event_id && !ev.ghost && <button type="button" className="event-details-add-entry"
            onClick={() => setEntryForm({ type: 'class', ev, date: isoDate(date) })}>
            <CalendarPlus size={16}/>Dodaj kolokwium lub termin</button>}
          {planActions && ev.event_id && <ClassPlanActions ev={ev} current={current} planActions={planActions} onDone={onClose} onBusyChange={setBusy}
            entries={classEntries}/>}
          {planActions?.makeUp && classEntries.length > 0 && changedHere && <MakeupOptions entries={classEntries} items={itemActions.items}
            onMakeUp={planActions.makeUp}/>}
        </>}
      </section>
    </dialog>, document.body,
  );
}
