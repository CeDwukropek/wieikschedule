import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { KindChip } from './PlanItemSummary';
import { countdown, describeAudience, describeItemTime, upcomingItems } from './planItemLogic';

// Kolokwia, deadlines and other entries of the next two weeks, and deadlines missed recently.
export default function UpcomingPanel({ items, today, onClose, onOpen }) {
  const dialog = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const node = dialog.current, previous = document.activeElement;
    if (typeof node.showModal === 'function') node.showModal(); else node.setAttribute('open', '');
    return () => { if (typeof node.close === 'function') node.close(); if (previous?.isConnected) previous.focus(); };
  }, []);
  const { upcoming, overdue } = upcomingItems(items, today);
  const list = rows => <ul>{rows.map(item => <li key={item.id}>
    <button type="button" className="plan-panel-row upcoming-row" aria-haspopup="dialog" onClick={() => onOpen(item)}
      data-done={item.my_state?.progress === 'done' || undefined}>
      <span className="plan-item-meta"><KindChip item={item}/><span>{countdown(item.date, today)}</span>
        {item.state === 'review' && <span className="upcoming-review">do sprawdzenia</span>}</span>
      <strong>{item.title}</strong>
      <span>{describeItemTime(item)} · {item.subject || describeAudience(item)}</span>
    </button>
  </li>)}</ul>;
  return <dialog ref={dialog} className="plan-panel" aria-labelledby={titleId} aria-modal="true"
    onCancel={event => { event.preventDefault(); onClose(); }}
    onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="plan-panel-content">
      <header className="event-details-header">
        <div>
          <p className="event-details-eyebrow">Najbliższe 14 dni</p>
          <h2 id={titleId}>Nadchodzące terminy</h2>
        </div>
        <button type="button" className="event-details-close" aria-label="Zamknij nadchodzące terminy" onClick={onClose}><X size={20}/></button>
      </header>
      {overdue.length > 0 && <section className="plan-panel-section"><h3>Zaległe ({overdue.length})</h3>{list(overdue)}</section>}
      {upcoming.length > 0 && <section className="plan-panel-section"><h3>Wkrótce ({upcoming.length})</h3>{list(upcoming)}</section>}
      {!upcoming.length && !overdue.length && <p className="plan-panel-empty">W najbliższych dwóch tygodniach nie ma kolokwiów ani terminów.</p>}
    </section>
  </dialog>;
}
