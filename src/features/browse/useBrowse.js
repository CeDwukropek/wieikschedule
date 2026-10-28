import { useCallback, useEffect, useState } from "react";
import { toIsoDate } from "../../utils/date";
import { loadDirectory, loadWeekAcrossPlans } from "./browseApi";

// The directory for the search (once asked for) and all plans' classes of the week being browsed.
export function useBrowse({ browsing, weekStart, wantDirectory }) {
  const monday = weekStart ? toIsoDate(weekStart) : "";
  const [week, setWeek] = useState({ monday: null, rows: [], error: null });
  const [directory, setDirectory] = useState({ data: null, error: null });
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt(value => value + 1), []);

  useEffect(() => {
    if (!browsing || !monday) return undefined;
    let active = true;
    loadWeekAcrossPlans(monday).then(
      rows => { if (active) setWeek({ monday, rows, error: null }); },
      error => { if (active) setWeek({ monday, rows: [], error: error.message || "Nie udało się pobrać planu." }); });
    return () => { active = false; };
  }, [browsing, monday, attempt]);

  useEffect(() => {
    if (!wantDirectory || directory.data) return undefined;
    let active = true;
    loadDirectory().then(
      data => { if (active) setDirectory({ data, error: null }); },
      error => { if (active) setDirectory({ data: null, error: error.message || "Nie udało się pobrać listy." }); });
    return () => { active = false; };
  }, [wantDirectory, directory.data, attempt]);

  const current = week.monday === monday;
  return {
    rows: current ? week.rows : [],
    loading: browsing && !current,
    error: current ? week.error : null,
    directory: directory.data,
    directoryError: directory.error,
    retry,
  };
}
