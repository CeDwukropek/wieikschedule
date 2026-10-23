import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import PlanItemSummary from './PlanItemSummary';
import { kindOf } from './planItemLogic';

export default function PlanItemDialog({ item, onClose, onState }) {
  const dialog = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const node = dialog.current, previous = document.activeElement, overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (typeof node.showModal === 'function') node.showModal(); else node.setAttribute('open', '');
    return () => {
      if (typeof node.close === 'function') node.close();
      document.body.style.overflow = overflow;
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return createPortal(
    <dialog ref={dialog} className="event-details-dialog" aria-labelledby={titleId} aria-modal="true"
      onCancel={event => { event.preventDefault(); onClose(); }}
      onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="event-details-content">
        <header className="event-details-header">
          <div>
            <p className="event-details-eyebrow">{kindOf(item).label}</p>
            <h2 id={titleId}>{item.title}</h2>
          </div>
          <button type="button" className="event-details-close" aria-label="Zamknij szczegóły terminu" onClick={onClose}><X size={20}/></button>
        </header>
        <PlanItemSummary item={item} heading={false} onState={onState && (async (id, change) => {
          await onState(id, change);
          if (change.hidden) onClose();
        })}/>
      </section>
    </dialog>, document.body);
}
