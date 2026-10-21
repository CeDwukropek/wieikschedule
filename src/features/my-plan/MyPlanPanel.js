import { useEffect, useId, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { describeChange, describeSlot } from './planEditing';

const SECTIONS = [
  ['modified', 'Przeniesione i zmienione'],
  ['cancelled', 'Odwołane u mnie'],
  ['added', 'Odrabiania'],
];

function Row({ title, detail, note, children }) {
  return <li className="plan-panel-row">
    <div className="plan-panel-text">
      <strong>{title}</strong>
      <span>{detail}</span>
      {note && <em>{note}</em>}
    </div>
    <div className="plan-panel-buttons">{children}</div>
  </li>;
}

// Side panel listing every personal entry with its actions.
export default function MyPlanPanel({ items, proposals, today, onClose, onApply, onRemoveAdded, onConfirmProposal, onDismissProposal, onShow }) {
  const dialog = useRef(null);
  const titleId = useId();
  const [busy, setBusy] = useState(''), [error, setError] = useState('');
  useEffect(() => {
    const node = dialog.current;
    const previous = document.activeElement;
    if (typeof node.showModal === 'function') node.showModal(); else node.setAttribute('open', '');
    return () => { if (typeof node.close === 'function') node.close(); if (previous?.isConnected) previous.focus(); };
  }, []);
  const run = async (key, action) => {
    setBusy(key); setError('');
    try { await action(); } catch (failure) { setError(failure.message || 'Nie udało się zapisać zmiany.'); } finally { setBusy(''); }
  };
  const when = item => (item.current || item.original).date;
  const upcoming = items.filter(item => when(item) >= today), past = items.filter(item => when(item) < today);
  const actions = item => <>
    {item.kind !== 'cancelled' && <button type="button" disabled={Boolean(busy)} onClick={() => onShow(item)}>Pokaż</button>}
    {item.kind === 'added'
      ? <button type="button" disabled={Boolean(busy)} onClick={() => run(item.event_id, () => onRemoveAdded(item.added_event_id))}>Usuń z planu</button>
      : <button type="button" disabled={Boolean(busy)} onClick={() => run(item.event_id, () => onApply({ event_id: item.event_id, operation: 'delete' }))}>{busy === item.event_id ? 'Przywracanie…' : 'Przywróć'}</button>}
  </>;
  const detail = item => item.kind === 'added'
    ? describeSlot(item.current) + (item.override ? ' (zmienione u Ciebie)' : '')
    : item.kind === 'cancelled' ? describeSlot(item.original) : describeChange(item.original, item.current);
  const list = rows => <ul>{rows.map(item => <Row key={`${item.kind}:${item.event_id}`} title={`${item.subject}${item.type ? ` · ${item.type}` : ''}`}
    detail={detail(item)} note={item.override?.reason}>{actions(item)}</Row>)}</ul>;

  return <dialog ref={dialog} className="plan-panel" aria-labelledby={titleId} aria-modal="true"
    onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}
    onClick={event => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <section className="plan-panel-content">
      <header className="event-details-header">
        <div>
          <p className="event-details-eyebrow">Zmiany tylko w Twoim planie</p>
          <h2 id={titleId}>Mój plan</h2>
        </div>
        <button type="button" className="event-details-close" aria-label="Zamknij Mój plan" disabled={Boolean(busy)} onClick={onClose}><X size={20}/></button>
      </header>
      {error && <p role="alert" className="event-details-error">{error}</p>}
      {proposals.length > 0 && <section className="plan-panel-section plan-panel-proposals">
        <h3>Do zatwierdzenia ({proposals.length})</h3>
        <ul>{proposals.map(proposal => <Row key={proposal.id} title={proposal.subject}
          detail={proposal.operation === 'delete' ? 'przywrócenie planu uczelni' : describeChange(proposal.before || proposal.original, proposal.after)}
          note={proposal.reason ? `Agent: ${proposal.reason}` : 'Propozycja agenta, ważna kilka minut'}>
          <button type="button" className="plan-panel-primary" disabled={Boolean(busy)} onClick={() => run(proposal.id, () => onConfirmProposal(proposal))}>{busy === proposal.id ? 'Zapisywanie…' : 'Zatwierdź'}</button>
          <button type="button" disabled={Boolean(busy)} onClick={() => onDismissProposal(proposal.id)}>Odrzuć</button>
        </Row>)}</ul>
      </section>}
      {SECTIONS.map(([kind, label]) => {
        const rows = upcoming.filter(item => item.kind === kind);
        return rows.length > 0 && <section key={kind} className="plan-panel-section"><h3>{label} ({rows.length})</h3>{list(rows)}</section>;
      })}
      {past.length > 0 && <details className="plan-panel-section"><summary>Wcześniejsze ({past.length})</summary>{list(past)}</details>}
      {!items.length && !proposals.length && <p className="plan-panel-empty">Nie masz prywatnych zmian. Kliknij zajęcia w kalendarzu, aby je przenieść, zmienić salę albo odwołać u siebie.</p>}
    </section>
  </dialog>;
}
