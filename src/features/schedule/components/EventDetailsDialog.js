import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Clock, MapPin, Users, UserRound, CalendarDays } from 'lucide-react';
import { splitTeacherDisplay } from '../logic/teacherDisplay';
import { eventSubject } from './EventCard';
import ClassPlanActions from '../../my-plan/ClassPlanActions';
import { timeToMinutes } from '../../../utils/time';

const isoDate = value => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;

export default function EventDetailsDialog({ ev, subjects, date, onClose, planActions }) {
  const dialog = useRef(null);
  const titleId = useId();
  const [busy, setBusy] = useState(false);
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
            <p className="event-details-eyebrow">Szczegóły zajęć</p>
            <h2 id={titleId}>{subject.name}</h2>
          </div>
          <button type="button" className="event-details-close" aria-label="Zamknij szczegóły zajęć" disabled={busy} onClick={onClose}><X size={20}/></button>
        </header>
        <div className="event-details-badges">
          {ev.type && <span>{ev.type}</span>}
          {ev.origin === 'added' && <span className="event-details-personal">Odrobienie</span>}
          {ev.personal_override && <span className="event-details-personal">Zmienione u mnie</span>}
          {ev._isExternal && <span>Plan {ev._sourceScheduleId}</span>}
        </div>
        <dl className="event-details-list">
          <div><dt><CalendarDays size={17}/>Data</dt><dd>{date.toLocaleDateString('pl-PL', {weekday:'long',day:'numeric',month:'long',year:'numeric'})}</dd></div>
          <div><dt><Clock size={17}/>Godzina</dt><dd>{ev.start}–{ev.end}</dd></div>
          <div><dt><MapPin size={17}/>Sala</dt><dd>{ev.room || 'Nie podano'}</dd></div>
          <div><dt><UserRound size={17}/>Prowadzący</dt><dd>{teachers.length ? teachers.map(teacher => <span key={teacher}>{teacher}</span>) : 'Nie podano'}</dd></div>
          <div><dt><Users size={17}/>Grupa</dt><dd>{ev.groups?.length ? ev.groups.join(', ') : 'Wszystkie grupy'}</dd></div>
        </dl>
        {planActions && ev.event_id && <ClassPlanActions ev={ev} current={current} planActions={planActions} onDone={onClose} onBusyChange={setBusy}/>}
      </section>
    </dialog>, document.body,
  );
}
