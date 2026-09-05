import { filterEvents } from "./filterEvents";
import { selectExternalEvents } from "./externalEvents";

export function mergeEvents({
  schedule, groups, hideLectures, showAll, weekStart,
  externalSelections = [], timetables = {}, addedEvents = [],
}) {
  const base = filterEvents(schedule, groups, hideLectures, showAll, weekStart);
  const baseIds = new Set(base.map(event => String(event.event_id || "").trim()).filter(Boolean));
  const merged = new Map();
  base.forEach(event => {
    const key = ["base", event.id, event.day, event.start, event.end, event.room].join("::");
    merged.set(key, { ...event, origin: "base" });
  });
  selectExternalEvents(externalSelections, timetables, hideLectures, weekStart)
    .forEach(({ key, event }) => merged.set(key, event));
  addedEvents.forEach(event => {
    if (baseIds.has(String(event.event_id || "").trim())) return;
    const key = ["added", event.added_event_id || "", event.event_id || "",
      event.day, event.start, event.end, event.room].join("::");
    merged.set(key, event);
  });
  return [...merged.values()].sort((a, b) => a.day - b.day ||
    a.start.localeCompare(b.start) || String(a.id).localeCompare(String(b.id)));
}
