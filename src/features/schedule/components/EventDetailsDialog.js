import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Clock, MapPin, Users, UserRound, CalendarDays, Pencil, Trash2 } from 'lucide-react';
import { splitTeacherDisplay } from '../logic/teacherDisplay';
import { eventSubject } from './EventCard';

export default function EventDetailsDialog({ ev, subjects, date, onClose, onEditEvent, onRemoveAddedEvent, removingAddedEventId }) {
  const dialog = useRef(null);
  const titleId = useId();
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const subject = eventSubject(ev, subjects);
  const teachers = splitTeacherDisplay(ev.teacher);
  const canRemove = ev.origin === 'added' && ev.added_event_id && onRemoveAddedEvent;
  const busy = pending || (canRemove && removingAddedEventId === ev.added_event_id);

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

  const edit = () => {
    onClose();
    onEditEvent(ev.event_id);
  };
  const remove = async () => {
    setPending(true);setError('');
    try { await onRemoveAddedEvent(ev.added_event_id);onClose(); }
    catch (failure) { setError(failure.message || 'Nie udało się usunąć dopisku. Spróbuj ponownie.'); }
    finally { setPending(false); }
  };

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
          {ev.personal_override && <span className="event-details-personal">Moja zmiana</span>}
          {ev._isExternal && <span>Plan {ev._sourceScheduleId}</span>}
        </div>
        <dl className="event-details-list">
          <div><dt><CalendarDays size={17}/>Data</dt><dd>{date.toLocaleDateString('pl-PL', {weekday:'long',day:'numeric',month:'long',year:'numeric'})}</dd></div>
          <div><dt><Clock size={17}/>Godzina</dt><dd>{ev.start}–{ev.end}</dd></div>
          <div><dt><MapPin size={17}/>Sala</dt><dd>{ev.room || 'Nie podano'}</dd></div>
          <div><dt><UserRound size={17}/>Prowadzący</dt><dd>{teachers.length ? teachers.map(teacher => <span key={teacher}>{teacher}</span>) : 'Nie podano'}</dd></div>
          <div><dt><Users size={17}/>Grupa</dt><dd>{ev.groups?.length ? ev.groups.join(', ') : 'Wszystkie grupy'}</dd></div>
        </dl>
        {(onEditEvent && ev.event_id) || canRemove ? <footer className="event-details-actions">
          {onEditEvent && ev.event_id && <>
            <p>Zmiana dotyczy tylko tego wystąpienia w Twoim planie.</p>
            <button type="button" className="event-details-edit" disabled={busy} onClick={edit}><Pencil size={16}/>{ev.personal_override ? 'Edytuj moją zmianę' : 'Przenieś lub zmień zajęcia'}</button>
          </>}
          {canRemove && <button type="button" className="event-details-remove" disabled={busy} onClick={remove}><Trash2 size={16}/>{busy ? 'Usuwanie…' : 'Usuń z mojego planu'}</button>}
        </footer> : null}
        {error && <p role="alert" className="event-details-error">{error}</p>}
      </section>
    </dialog>, document.body,
  );
}
