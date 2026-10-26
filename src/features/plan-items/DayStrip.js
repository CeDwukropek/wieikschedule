import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { kindOf } from './planItemLogic';

// Whole-day entries and deadlines of one day, under its date (like all-day events in a calendar).
export default function DayStrip({ items = [], onOpen, limit = 2 }) {
  const [expanded, setExpanded] = useState(false);
  if (!items.length) return null;
  const shown = expanded ? items : items.slice(0, limit), hidden = items.length - shown.length;
  return <ul className="day-strip">
    {shown.map(item => <li key={item.id}>
      <button type="button" className="day-strip-item" style={{ '--kind': kindOf(item).color }} aria-haspopup="dialog"
        data-done={item.my_state?.progress === 'done' || undefined} data-draft={item.draft || undefined} onClick={() => onOpen(item)}
        aria-label={`${kindOf(item).label}: ${item.title}${item.due_time ? `, do ${item.due_time.slice(0, 5)}` : ''}${item.state === 'review' ? ', do sprawdzenia' : ''}. Pokaż szczegóły`}>
        {item.state === 'review' && <AlertTriangle size={11} aria-hidden="true"/>}
        <span>{item.due_time && <b>{item.due_time.slice(0, 5)} </b>}{item.title}</span>
      </button>
    </li>)}
    {hidden > 0 && <li><button type="button" className="day-strip-more" onClick={() => setExpanded(true)}>+{hidden} więcej</button></li>}
  </ul>;
}
