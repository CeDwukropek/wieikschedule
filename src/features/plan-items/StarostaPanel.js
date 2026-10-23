import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Copy, Undo2, X } from 'lucide-react';
import { KindChip } from './PlanItemSummary';
import { describeItemTime, reviewNotice } from './planItemLogic';
import { describeChange, groupsOf, historyFaculties, historyUndo, inviteChoices, inviteMessage, reviewItems, roleLabel, ROLE_NAMES } from './planRoles';
import { planItemsRequest } from './planItemsApi';

const when = value => new Date(value).toLocaleString('pl-PL', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' });
const since = value => new Date(value).toLocaleDateString('pl-PL', { day: 'numeric', month: 'numeric', year: 'numeric' });

// One action with its own busy state and error, so a failure shows next to the button that caused it.
function useAction() {
  const [busy, setBusy] = useState(null), [error, setError] = useState(null);
  const run = useCallback(async (key, action) => {
    setBusy(key); setError(null);
    try { return await action(); } catch (failure) { setError({ key, message: failure.message || 'Nie udało się.' }); return undefined; }
    finally { setBusy(null); }
  }, []);
  return { busy, error, run, errorFor: key => (error?.key === key ? error.message : '') };
}

function Copyable({ text, label }) {
  const [done, setDone] = useState(false);
  return <button type="button" className="starosta-small" onClick={async () => {
    try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 2000); } catch { setDone(false); }
  }}><Copy size={14} aria-hidden="true"/>{done ? 'Skopiowano' : label}</button>;
}

// Roles, invites, entries waiting for review and the history of changes, for admins and starostas.
// request is the plan-items API (replaceable in tests); onChanged reloads the plan's entries.
export default function StarostaPanel({ roles, items, scheduleId, timetableOptions, groupsFor, onOpenItem, onChanged, onClose,
  request = planItemsRequest }) {
  const dialog = useRef(null);
  const id = useId();
  useEffect(() => {
    const node = dialog.current, previous = document.activeElement;
    if (typeof node.showModal === 'function') node.showModal(); else node.setAttribute('open', '');
    return () => { if (typeof node.close === 'function') node.close(); if (previous?.isConnected) previous.focus(); };
  }, []);
  const action = useAction();
  const [managed, setManaged] = useState(null), [own, setOwn] = useState(roles);
  const loadRoles = useCallback(() => request('roles').then(data => { setManaged(data.managed); setOwn(data.roles); },
    failure => setManaged({ error: failure.message })), [request]);
  useEffect(() => { loadRoles(); }, [loadRoles]);

  const choices = useMemo(() => inviteChoices(own, timetableOptions), [own, timetableOptions]);
  const [invite, setInvite] = useState(() => ({ role: 'group_starosta', faculty: choices.faculties.includes(scheduleId) ? scheduleId : choices.faculties[0] || '', group: '' }));
  const [created, setCreated] = useState(null);
  const inviteGroups = useMemo(() => groupsOf(groupsFor(invite.faculty)), [groupsFor, invite.faculty]);
  const [confirming, setConfirming] = useState(null);

  const faculties = useMemo(() => historyFaculties(own, scheduleId), [own, scheduleId]);
  const [historyOf, setHistoryOf] = useState(() => (faculties.includes(scheduleId) ? scheduleId : faculties[0]));
  const [history, setHistory] = useState(null);
  const loadHistory = useCallback(() => {
    if (!historyOf) return;
    setHistory(null);
    request('history', { query: { faculty: historyOf } }).then(data => setHistory(data.changes), failure => setHistory({ error: failure.message }));
  }, [request, historyOf]);
  useEffect(() => { loadHistory(); }, [loadHistory]);

  const reviews = reviewItems(items);
  const createInvite = event => {
    event.preventDefault();
    action.run('invite', async () => {
      const body = { role: invite.role, faculty: invite.faculty, ...(invite.role === 'group_starosta' ? { group: invite.group.trim() } : {}) };
      const data = await request('invite', { method: 'POST', body });
      setCreated(data.invite);
    });
  };
  const revoke = role => action.run(`revoke-${role.id}`, async () => {
    await request('revoke', { method: 'POST', body: { role_id: role.id } });
    setConfirming(null);
    await loadRoles(); onChanged();
  });
  const confirmReview = item => action.run(`review-${item.id}`, async () => {
    await request('save', { method: 'POST', body: { items: [{ id: item.id, revision: item.revision }] } });
    onChanged(); loadHistory();
  });
  const undo = (change, plan) => action.run(`undo-${change.id}`, async () => {
    if (plan.action === 'save') await request('save', { method: 'POST', body: { items: plan.items } });
    else await request('remove', { method: 'POST', body: { items: plan.items, ...(plan.action === 'restore' ? { restore: true } : {}) } });
    onChanged(); loadHistory();
  });
  // Groups of the shown plan nobody leads yet, to invite someone with one click.
  const ledGroups = new Set((Array.isArray(managed) ? managed : []).filter(role => role.role === 'group_starosta' && role.faculty === invite.faculty).map(role => role.group));
  const freeGroups = choices.roles.length && Array.isArray(managed) ? inviteGroups.filter(group => !ledGroups.has(group)) : [];
  // Own roles first (with dates when the managed list has them), then the others one manages.
  const ownRoleIds = new Set(own.map(role => role.id));
  const managedList = Array.isArray(managed) ? managed : [];
  const roleRows = [...own.map(role => ({ ...managedList.find(other => other.id === role.id), ...role, mine: true })),
    ...managedList.filter(role => !ownRoleIds.has(role.id))];

  return <dialog ref={dialog} className="plan-panel starosta-panel" aria-labelledby={`${id}-title`} aria-modal="true"
    onCancel={event => { event.preventDefault(); onClose(); }}
    onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="plan-panel-content">
      <header className="event-details-header">
        <div>
          <p className="event-details-eyebrow">{own.map(roleLabel).join(' · ')}</p>
          <h2 id={`${id}-title`}>Panel starosty</h2>
        </div>
        <button type="button" className="event-details-close" aria-label="Zamknij panel starosty" onClick={onClose}><X size={20}/></button>
      </header>

      <section className="plan-panel-section" aria-labelledby={`${id}-review`}>
        <h3 id={`${id}-review`}>Do sprawdzenia ({reviews.length})</h3>
        {!reviews.length ? <p className="plan-panel-empty">Uczelnia nie zmieniła zajęć, na których są Twoje wpisy.</p>
          : <ul>{reviews.map(item => <li key={item.id} className="plan-panel-row">
            <span className="plan-item-meta"><KindChip item={item}/><span>{item.group ? `Grupa ${item.group}` : 'Wszystkie grupy'}</span></span>
            <strong>{item.title}</strong>
            <span className="starosta-muted">{describeItemTime(item)} · {item.subject}</span>
            <p className="plan-item-review">{reviewNotice(item)}</p>
            <div className="starosta-actions">
              {item.review_reason !== 'cancelled' && <button type="button" className="starosta-primary" disabled={Boolean(action.busy)}
                onClick={() => confirmReview(item)}>Potwierdź termin</button>}
              <button type="button" className="starosta-small" onClick={() => onOpenItem(item)}>Zmień lub usuń</button>
            </div>
            {action.errorFor(`review-${item.id}`) && <p role="alert" className="plan-item-alert">{action.errorFor(`review-${item.id}`)}</p>}
          </li>)}</ul>}
      </section>

      {choices.roles.length > 0 && <section className="plan-panel-section" aria-labelledby={`${id}-invite`}>
        <h3 id={`${id}-invite`}>Zaproś starostę</h3>
        <form className="plan-form starosta-invite" onSubmit={createInvite}>
          <div className="plan-form-row starosta-invite-row">
            {choices.roles.length > 1 && <label>Rola<select value={invite.role} onChange={event => setInvite({ ...invite, role: event.target.value })}>
              {choices.roles.map(role => <option key={role} value={role}>{ROLE_NAMES[role]}</option>)}</select></label>}
            <label>Plan<select value={invite.faculty} onChange={event => setInvite({ ...invite, faculty: event.target.value, group: '' })}>
              {choices.faculties.map(faculty => <option key={faculty} value={faculty}>{faculty}</option>)}</select></label>
            {invite.role === 'group_starosta' && <label>Grupa<input value={invite.group} list={`${id}-groups`} maxLength={128}
              placeholder="np. Lk4" onChange={event => setInvite({ ...invite, group: event.target.value })}/></label>}
            <datalist id={`${id}-groups`}>{inviteGroups.map(group => <option key={group} value={group}/>)}</datalist>
          </div>
          {freeGroups.length > 0 && invite.role === 'group_starosta' && <p className="starosta-muted">Bez starosty: {freeGroups.map(group =>
            <button key={group} type="button" className="starosta-chip" aria-pressed={invite.group === group}
              onClick={() => setInvite({ ...invite, group })}>{group}</button>)}</p>}
          <p className="starosta-muted">Kod jest jednorazowy, ważny 7 dni i widoczny tylko teraz. Kto go wpisze, przejmie rolę; jeśli ktoś już ją ma, straci ją.</p>
          <button type="submit" className="starosta-primary" disabled={Boolean(action.busy) || (invite.role === 'group_starosta' && !invite.group.trim())}>
            {action.busy === 'invite' ? 'Tworzenie…' : 'Utwórz kod'}</button>
          {action.errorFor('invite') && <p role="alert" className="plan-item-alert">{action.errorFor('invite')}</p>}
        </form>
        {created && <div className="starosta-code" role="status" aria-label="Nowy kod zaproszenia">
          <span>{created.role === 'starosta' ? `Starosta ${created.faculty}` : `Starosta grupy ${created.group} (${created.faculty})`}</span>
          <strong>{created.code}</strong>
          <span className="starosta-muted">Ważny do {since(created.expires_at)}</span>
          <div className="starosta-actions"><Copyable text={created.code} label="Kopiuj kod"/><Copyable text={inviteMessage(created)} label="Kopiuj z instrukcją"/></div>
        </div>}
      </section>}

      <section className="plan-panel-section" aria-labelledby={`${id}-roles`}>
        <h3 id={`${id}-roles`}>Role</h3>
        {managed?.error && <p role="alert" className="plan-item-alert">{managed.error}</p>}
        <ul>{roleRows.map(role => {
            const mine = role.mine, key = `revoke-${role.id}`;
            return <li key={role.id} className="plan-panel-row starosta-role">
              <span><strong>{roleLabel(role)}</strong>{mine && <span className="starosta-you"> · Ty</span>}</span>
              {role.created_at && <span className="starosta-muted">od {since(role.created_at)}{role.carried_from ? ` · przeniesiona z ${role.carried_from}` : ''}</span>}
              {role.role !== 'admin' && (confirming === role.id
                ? <div className="starosta-actions">
                  <button type="button" className="event-details-remove starosta-small" disabled={Boolean(action.busy)} onClick={() => revoke(role)}>
                    {mine ? 'Tak, rezygnuję' : 'Tak, odbierz'}</button>
                  <button type="button" className="starosta-small" onClick={() => setConfirming(null)}>Anuluj</button></div>
                : <button type="button" className="starosta-small" onClick={() => setConfirming(role.id)}>{mine ? 'Zrezygnuj' : 'Odbierz rolę'}</button>)}
              {action.errorFor(key) && <p role="alert" className="plan-item-alert">{action.errorFor(key)}</p>}
            </li>;
          })}</ul>
        {own.some(role => role.role === 'admin') && <p className="starosta-muted">Rolę admina zmienia się poza aplikacją.</p>}
      </section>

      {faculties.length > 0 && <section className="plan-panel-section" aria-labelledby={`${id}-history`}>
        <h3 id={`${id}-history`}>Historia zmian</h3>
        {faculties.length > 1 && <label className="plan-form starosta-history-plan">Plan<select value={historyOf} onChange={event => setHistoryOf(event.target.value)}>
          {faculties.map(faculty => <option key={faculty} value={faculty}>{faculty}</option>)}</select></label>}
        {history === null ? <p role="status" className="plan-panel-empty">Wczytywanie…</p>
          : history.error ? <p role="alert" className="plan-item-alert">{history.error}</p>
          : !history.length ? <p className="plan-panel-empty">Nie ma jeszcze zmian we wpisach grupowych.</p>
          : <ul>{history.map(change => {
            const { what, lines } = describeChange(change), plan = historyUndo(change), key = `undo-${change.id}`;
            return <li key={change.id} className="plan-panel-row starosta-change">
              <span className="starosta-muted">{when(change.created_at)} · {change.actor}</span>
              <span><strong>{what}:</strong> {change.item.title}</span>
              {lines.map(line => <span key={line} className="starosta-line">{line}</span>)}
              {plan && <button type="button" className="starosta-small" disabled={Boolean(action.busy)} onClick={() => undo(change, plan)}>
                <Undo2 size={14} aria-hidden="true"/>{plan.label}</button>}
              {action.errorFor(key) && <p role="alert" className="plan-item-alert">{action.errorFor(key)}</p>}
            </li>;
          })}</ul>}
      </section>}
    </section>
  </dialog>;
}
