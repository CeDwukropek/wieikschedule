import { useCallback, useEffect, useState } from 'react';
import { groupChangesRequest } from './groupChangesApi';
import { readCache, writeCache } from '../../lib/deviceCache';

const EMPTY = [];
export const groupChangesEnabled = () => process.env.REACT_APP_GROUP_CHANGES === 'true';
// Starostas' changes of the shown plans' classes (moved, another room or instructor, cancelled), for everyone.
// The device's copy shows at once; a failed load keeps it (or shows the university plan) and says so.
export function useGroupChanges({ enabled, faculties }) {
  const plans = enabled && faculties.length ? [...faculties].sort().join(',') : '';
  const [state, setState] = useState({ plans: '', changes: EMPTY, error: null });
  const [version, setVersion] = useState(0);
  useEffect(() => {
    if (!plans) return undefined;
    let active = true;
    setState(previous => {
      if (previous.plans === plans) return previous;
      const cached = readCache('groupChanges', 'all');
      return { plans, changes: cached?.plans === plans ? cached.data : EMPTY, error: null };
    });
    groupChangesRequest('group-changes', { query: { faculties: plans } }).then(
      data => { if (active) { setState({ plans, changes: data.changes, error: null }); writeCache('groupChanges', 'all', data.changes, { plans }); } },
      error => { if (active) setState(previous => ({ ...previous, plans, error: error.message })); });
    return () => { active = false; };
  }, [plans, version]);
  const refresh = useCallback(() => setVersion(value => value + 1), []);
  // Saved at once for everyone; returns the changes that undo it.
  const apply = useCallback(async changes => {
    const data = await groupChangesRequest('group-apply', { method: 'POST', body: { changes } });
    setState(previous => {
      const byEvent = new Map(previous.changes.map(change => [change.event_id, change]));
      data.results.forEach(({ event_id: id, current }) => (current ? byEvent.set(id, current) : byEvent.delete(id)));
      return { ...previous, changes: [...byEvent.values()] };
    });
    refresh();
    return data.undo;
  }, [refresh]);
  const current = plans && state.plans === plans;
  return { changes: current ? state.changes : EMPTY, error: current ? state.error : null, refresh, apply };
}
