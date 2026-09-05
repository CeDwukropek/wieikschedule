import { addMinutes, normalizeTime } from "../../utils/time";

export function mapAddedEvent(event, { optimistic = false } = {}) {
  const date = String(event?.date || "").trim().slice(0, 10);
  const dateValue = new Date(`${date}T12:00:00`);
  const day = (dateValue.getDay() + 6) % 7;
  const start = normalizeTime(event?.start_time);
  if (!Number.isFinite(day) || day > 4 || !start) return null;

  const eventId = String(event?.event_id || "").trim();
  const addedId = String(event?.added_event_id || (optimistic
    ? `pending-${eventId || Math.random().toString(36).slice(2, 8)}-${Date.now()}` : "")).trim();
  const subject = String(event?.subject || (optimistic ? event?.title : "") || "").trim();

  return {
    id: `added-${addedId || eventId || [date, start, subject].filter(Boolean).join("-")}`,
    event_id: eventId || undefined,
    added_event_id: addedId || undefined,
    origin: "added",
    reason: String(event?.reason || "makeup").trim() || "makeup",
    subj: subject || "ADDED_EVENT",
    title: subject || "Dopisane zajecia",
    type: String(event?.type || "").trim() || "Zajecia",
    status: String(event?.status || "").trim() || "aktywne",
    teacher: String(event?.instructor || "").trim(),
    groups: event?.group ? [String(event.group).trim()] : [],
    appliesToAllGroups: false,
    day,
    start,
    end: addMinutes(start, event?.duration_min),
    room: String(event?.room || "").trim(),
    dates: [date],
    ...(optimistic ? { __optimistic: "adding" } : {}),
  };
}
