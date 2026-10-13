// Selection rows are filters, not event identities. Dates distinguish separate
// occurrences in exports; source schedule scopes locally generated numeric IDs.
export function eventIdentity(event, scheduleId = "") {
  return JSON.stringify([
    event.event_id ? ["event", event.event_id] : ["schedule", scheduleId, event.id],
    event.day, event.start, event.end, event.room,
    [...(event.dates || [])].sort(),
  ]);
}
