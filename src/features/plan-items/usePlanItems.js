import { useCallback, useEffect, useState } from 'react';
import { planItemsRequest } from './planItemsApi';

const EMPTY = [];
// Entries of the shown plans in one date window; reloaded when the account, the plans or the window change.
export function usePlanItems({ enabled, uid, faculties, window }) {
  const key = enabled && faculties.length ? JSON.stringify([uid || null, faculties, window.from, window.to]) : null;
  const [state, setState] = useState({ key: null, items: EMPTY, roles: EMPTY, error: null });
  const [version, setVersion] = useState(0);
  useEffect(() => {
    if (!key) return undefined;
    let active = true;
    const [, list, from, to] = JSON.parse(key);
    planItemsRequest('list', { query: { faculties: list.join(','), from, to } }).then(
      data => { if (active) setState({ key, items: data.items, roles: data.roles, error: null }); },
      // A failed reload keeps what was shown for the same plans; other plans show nothing stale.
      error => { if (active) setState(previous => previous.key === key ? { ...previous, error: error.message }
        : { key, items: EMPTY, roles: EMPTY, error: error.message }); });
    return () => { active = false; };
  }, [key, version]);
  const refresh = useCallback(() => setVersion(value => value + 1), []);
  // Progress, note and hiding are saved at once and shown without reloading the list.
  const setItemState = useCallback(async (itemId, change) => {
    const { state: saved } = await planItemsRequest('state', { method: 'POST', body: { item_id: itemId, ...change } });
    setState(previous => ({ ...previous, items: previous.items.map(item => item.id === itemId
      ? { ...item, my_state: { hidden: saved.hidden, progress: saved.progress, note: saved.note ?? null } } : item) }));
  }, []);
  const current = key && state.key === key;
  return { items: current ? state.items : EMPTY, roles: current ? state.roles : EMPTY,
    ready: Boolean(current && !state.error), error: current ? state.error : null, refresh, setItemState };
}
