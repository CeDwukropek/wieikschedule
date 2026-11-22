import { useEffect, useState } from 'react';
import { loadDirectory } from './browseApi';

// All rooms and instructors (the search's list, kept on the device for half a day), loaded once it is needed.
export function useDirectory(enabled) {
  const [state, setState] = useState({ data: null, error: null });
  useEffect(() => {
    if (!enabled || state.data) return undefined;
    let active = true;
    loadDirectory().then(data => { if (active) setState({ data, error: null }); },
      error => { if (active) setState({ data: null, error: error.message || 'Nie udało się pobrać listy.' }); });
    return () => { active = false; };
  }, [enabled, state.data]);
  return state;
}
