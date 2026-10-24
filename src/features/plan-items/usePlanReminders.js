import { useCallback, useEffect, useState } from 'react';
import { planItemsRequest } from './planItemsApi';

// The signed-in person's reminders by kind (or the defaults), saved at once on every change.
export function usePlanReminders({ enabled, uid }) {
  const [state, setState] = useState({ uid: null, data: null, error: '' });
  useEffect(() => {
    if (!enabled || !uid) return undefined;
    let active = true;
    planItemsRequest('preferences').then(data => { if (active) setState({ uid, data, error: '' }); },
      failure => { if (active) setState({ uid, data: null, error: failure.message }); });
    return () => { active = false; };
  }, [enabled, uid]);
  const save = useCallback(async reminders => {
    const data = await planItemsRequest('save-preferences', { method: 'POST', body: { reminders } });
    setState({ uid, data, error: '' });
    return data;
  }, [uid]);
  const current = enabled && uid && state.uid === uid ? state : { data: null, error: '' };
  return { reminders: current.data?.reminders || null, defaults: current.data?.defaults || null, custom: Boolean(current.data?.custom),
    error: current.error, save };
}
