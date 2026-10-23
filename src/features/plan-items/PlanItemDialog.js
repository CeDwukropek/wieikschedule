import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import PlanItemSummary from './PlanItemSummary';
import PlanItemForm from './PlanItemForm';
import { kindOf } from './planItemLogic';
import { describeTerm } from './planItemEditing';

// One entry (with editing for whoever may change it), or a new entry at a free slot chosen in the grid (draft).
export default function PlanItemDialog({ item, draft, onClose, onState, actions }) {
  const dialog = useRef(null);
  const titleId = useId();
  const [editing, setEditing] = useState(false);
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
  const form = draft || editing;
  return createPortal(
    <dialog ref={dialog} className="event-details-dialog" aria-labelledby={titleId} aria-modal="true"
      onCancel={event => { event.preventDefault(); onClose(); }}
      onClick={event => { if (event.target === event.currentTarget && !form) onClose(); }}>
      <section className="event-details-content">
        <header className="event-details-header">
          <div>
            <p className="event-details-eyebrow">{draft ? describeTerm(draft.term) : editing ? 'Edycja terminu' : kindOf(item).label}</p>
            <h2 id={titleId}>{draft ? 'Nowy termin' : item.title}</h2>
          </div>
          <button type="button" className="event-details-close" aria-label={draft ? 'Zamknij nowy termin' : 'Zamknij szczegóły terminu'} onClick={onClose}><X size={20}/></button>
        </header>
        {form ? <PlanItemForm source={draft ? { type: 'slot', ...draft } : { type: 'edit', item }} actions={actions}
          onDone={draft ? onClose : () => setEditing(false)} onCancel={draft ? onClose : () => setEditing(false)}/>
          : <PlanItemSummary item={item} heading={false} actions={actions} onEdit={() => setEditing(true)}
            onState={onState && (async (id, change) => {
              await onState(id, change);
              if (change.hidden) onClose();
            })}/>}
      </section>
    </dialog>, document.body);
}
