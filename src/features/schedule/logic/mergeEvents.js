import { filterEvents } from "./filterEvents";
import { selectExternalEvents } from "./externalEvents";
import { eventIdentity } from "./eventIdentity";

export function mergeEvents({
  schedule, scheduleId = "", groups, hideLectures, showAll, weekStart,
  externalSelections = [], timetables = {}, addedEvents = [],
}) {
  const base = filterEvents(schedule, groups, hideLectures, showAll, weekStart);
  const baseIds = new Set(base.map(event => String(event.event_id || "").trim()).filter(Boolean));
  const merged = new Map();
  base.forEach(event => {
    const key = eventIdentity(event, scheduleId);
    merged.set(key, { ...event, origin: "base" });
  });
  selectExternalEvents(externalSelections, timetables, hideLectures, weekStart)
    .forEach(({ key, event }) => {
      if (!merged.has(key)) merged.set(key, event);
      if (event.event_id) baseIds.add(String(event.event_id).trim());
    });
  addedEvents.forEach(event => {
    if (weekStart && !filterEvents([event], {}, false, true, weekStart).length) return;
    if (baseIds.has(String(event.event_id || "").trim())) return;
    const key = event.event_id ? `added::${event.event_id}` : ["added", event.added_event_id || "", event.event_id || "",
      event.day, event.start, event.end, event.room].join("::");
    merged.set(key, event);
  });
  return [...merged.values()].sort((a, b) => a.day - b.day ||
    a.start.localeCompare(b.start) || String(a.id).localeCompare(String(b.id)));
}
