// Selection rows are filters, not event identities. Dates distinguish separate
// occurrences in exports; source schedule scopes locally generated numeric IDs.
export function eventIdentity(event, scheduleId = "") {
  return JSON.stringify([
    event.event_id ? ["event", event.event_id] : ["schedule", scheduleId, event.id],
    event.day, event.start, event.end, event.room,
    [...(event.dates || [])].sort(),
  ]);
}

// Finds the same tile again after the week's events were recomputed (e.g. an entry's progress changed).
export function tileKey(ev) {
  return [ev.day, ev.start, ev._sourceScheduleId || "", ev.event_id || ev.id, ev.ghost || "", ev.origin || ""].join("|");
}
