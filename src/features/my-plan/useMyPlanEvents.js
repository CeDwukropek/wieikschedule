import { useCallback, useEffect, useRef, useState } from "react";
import { getWeekStart, toIsoDate } from "../../utils/date";
import { getAddedEventsFromMyPlan, removeAddedEventFromMyPlan } from "./myPlanApi";
import { mapAddedEvent } from "./eventMappers";
import { readMyPlanCache, writeMyPlanCache, removeMyPlanCache } from "./myPlanCache";

const EMPTY_WEEKS = {};

export function useMyPlanEvents({ scheduleName, scopeId, enabled, viewedWeekStart, selectedDayWeekStart }) {
  const scope = JSON.stringify([scopeId, scheduleName]);
  const scopeRef = useRef(scope);
  scopeRef.current = scope;
  const [state, setState] = useState({ scope, weeks: {} });
  const stateRef = useRef(state);
  const revision = useRef(0);
  const mounted = useRef(true);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [removing, setRemoving] = useState(null);
  const weeks = state.scope === scope && enabled ? state.weeks : EMPTY_WEEKS;
  const weekKeys = [...new Set([toIsoDate(viewedWeekStart), toIsoDate(selectedDayWeekStart)].filter(Boolean))].join("|");

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const updateWeeks = useCallback(updater => {
    if (!mounted.current || scopeRef.current !== scope) return;
    const previous = stateRef.current.scope === scope ? stateRef.current.weeks : {};
    const next = { scope, weeks: updater(previous) };
    stateRef.current = next;
    setState(next);
    if (scheduleName && enabled) {
      Object.entries(next.weeks).forEach(([week, events]) => writeMyPlanCache(scopeId, scheduleName, week, events));
    }
  }, [scope, scopeId, scheduleName, enabled]);

  const refresh = useCallback(() => {
    if (mounted.current && scopeRef.current === scope) setRefreshNonce(value => value + 1);
  }, [scope]);

  useEffect(() => {
    if (!enabled || !scheduleName) return;
    let active = true;
    const requestRevision = revision.current;
    const current = () => active && scopeRef.current === scope && revision.current === requestRevision;

    weekKeys.split("|").filter(Boolean).forEach(async week => {
      const cached = readMyPlanCache(scopeId, scheduleName, week);
      if (cached) updateWeeks(previous => previous[week] ? previous : { ...previous, [week]: cached });
      const end = new Date(`${week}T12:00:00`);
      end.setDate(end.getDate() + 6);
      try {
        const response = await getAddedEventsFromMyPlan({ scheduleName, dateFrom: week, dateTo: toIsoDate(end) });
        if (!current()) return;
        const events = (response?.events || []).map(event => mapAddedEvent(event)).filter(Boolean);
        updateWeeks(previous => ({ ...previous, [week]: events }));
      } catch (error) {
        if (!current()) return;
        if (/zalogowany|autoryz|unauthorized/i.test(String(error?.message || ""))) {
          updateWeeks(previous => ({ ...previous, [week]: [] }));
          removeMyPlanCache(scopeId, scheduleName, week);
        }
        // Network failures retain the current confirmed cache.
      }
    });
    return () => { active = false; };
  }, [enabled, scheduleName, scopeId, scope, weekKeys, refreshNonce, updateWeeks]);

  const optimisticAdd = useCallback(slot => {
    if (!enabled || !scheduleName || scopeRef.current !== scope) return null;
    const event = mapAddedEvent(slot, { optimistic: true });
    if (!event) return null;
    const week = toIsoDate(getWeekStart(new Date(`${event.dates[0]}T12:00:00`)));
    revision.current += 1;
    updateWeeks(previous => ({ ...previous, [week]: [event, ...(previous[week] || [])] }));
    return event;
  }, [enabled, scheduleName, scope, updateWeeks]);

  const confirmAdd = useCallback(({ temporaryAddedEventId, confirmedAddedEvent }) => {
    const id = String(confirmedAddedEvent?.id || "").trim();
    if (!temporaryAddedEventId || !id || scopeRef.current !== scope) return;
    revision.current += 1;
    updateWeeks(previous => Object.fromEntries(Object.entries(previous).map(([week, events]) => [week,
      events.map(event => {
        if (event.added_event_id !== temporaryAddedEventId) return event;
        const { __optimistic, ...confirmed } = event;
        return {
          ...confirmed, id: `added-${id}`, added_event_id: id,
          event_id: String(confirmedAddedEvent.event_id || "").trim() || event.event_id,
          reason: String(confirmedAddedEvent.reason || "").trim() || event.reason,
          status: String(confirmedAddedEvent.status || "").trim() || event.status,
        };
      }),
    ])));
    refresh();
  }, [scope, updateWeeks, refresh]);

  const rollbackAdd = useCallback(temporaryAddedEventId => {
    if (scopeRef.current !== scope) return;
    revision.current += 1;
    updateWeeks(previous => Object.fromEntries(Object.entries(previous).map(([week, events]) => [
      week, events.filter(event => event.added_event_id !== temporaryAddedEventId),
    ])));
    refresh();
  }, [scope, updateWeeks, refresh]);

  const removeEvent = useCallback(async addedEventId => {
    const id = String(addedEventId || "").trim();
    if (!id) throw new Error("Brak identyfikatora dopisanego wydarzenia.");
    if (!scheduleName) throw new Error("Brak nazwy aktualnego planu.");
    if (scopeRef.current !== scope) return;
    revision.current += 1;
    const removedByWeek = {};
    updateWeeks(previous => Object.fromEntries(Object.entries(previous).map(([week, events]) => {
      removedByWeek[week] = events.filter(event => event.added_event_id === id);
      return [week, events.filter(event => event.added_event_id !== id)];
    })));
    setRemoving({ scope, id });
    try {
      await removeAddedEventFromMyPlan({ addedEventId: id, scheduleName });
    } catch (error) {
      updateWeeks(previous => {
        const next = { ...previous };
        Object.entries(removedByWeek).forEach(([week, events]) => {
          next[week] = [...(previous[week] || []), ...events.filter(event =>
            !(previous[week] || []).some(current => current.added_event_id === event.added_event_id))];
        });
        return next;
      });
      throw error;
    } finally {
      refresh();
      if (mounted.current) setRemoving(current => current?.scope === scope && current.id === id ? null : current);
    }
  }, [scheduleName, scope, updateWeeks, refresh]);

  return {
    addedEventsByWeek: weeks,
    removingAddedEventId: removing?.scope === scope ? removing.id : null,
    refresh, optimisticAdd, confirmAdd, rollbackAdd, removeEvent,
  };
}
