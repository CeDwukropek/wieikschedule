// exportICS.js
import { describeAudience, itemEnd, kindOf } from "../../plan-items/planItemLogic";
import { reminderTimes } from "../../plan-items/reminders";

// Zwraca "YYYYMMDDTHHMMSS" (bez "Z") — tzw. "floating time" w lokalnej strefie,
// dzięki czemu kalendarze nie przesuwają godzin o strefy/DST.
function toICSDateLocal(date) {
  const pad = (n) => String(n).padStart(2, "0");
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${y}${m}${d}T${hh}${mm}${ss}`;
}

// Escapowanie pól tekstowych wg RFC 5545
function icsEscape(text = "") {
  return String(text)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

// UID dość stabilny: id_zajec + subject + stały sufiks
function makeUid(e, dateStr) {
  if (e.event_id) return `${e.event_id}@wieikschedule`;
  const base = `${e.id || "ev"}-${e.subj || "subj"}`;
  return `${base}-${dateStr}@wieikschedule`;
}

const compactDate = date => date.replace(/-/g, "");
const nextDay = date => { const value = new Date(`${date}T12:00:00`); value.setDate(value.getDate() + 1); return compactDate(value.toISOString().slice(0, 10)); };
const utcStamp = iso => iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
// Kolokwia, deadlines and other entries; a deadline without an hour is an all-day event. Reminders become alarms
// at absolute UTC times (RFC 5545), none for an entry marked as done.
function itemEvent(item, reminders = {}) {
  const time = value => String(value).slice(0, 5).replace(":", "") + "00";
  const when = item.timing === "due"
    ? item.due_time
      ? [`DTSTART:${compactDate(item.date)}T${time(item.due_time)}`] // no DTEND: the deadline is an instant (RFC 5545)
      : [`DTSTART;VALUE=DATE:${compactDate(item.date)}`, `DTEND;VALUE=DATE:${nextDay(item.date)}`]
    : [`DTSTART:${compactDate(item.date)}T${time(item.start_time)}`, `DTEND:${compactDate(item.date)}T${time(itemEnd(item))}`];
  const description = [item.subject, describeAudience(item), item.details].filter(Boolean).join("\n");
  const summary = icsEscape(`${kindOf(item).label}: ${item.title}`);
  const alarms = item.my_state?.progress === "done" ? [] : reminderTimes(item, reminders[item.kind]).flatMap(at =>
    ["BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${summary}`, `TRIGGER;VALUE=DATE-TIME:${utcStamp(at)}`, "END:VALARM"]);
  return ["BEGIN:VEVENT", `UID:item-${item.id}@wieikschedule`, `SUMMARY:${summary}`,
    `DESCRIPTION:${icsEscape(description)}`, ...when, ...alarms, "END:VEVENT"].join("\r\n") + "\r\n";
}

// --- Główny eksport -----------------------------------------------------------
export function buildICS(events, items = [], reminders = {}) {

  // Nagłówek kalendarza
  let ics =
    [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
    ].join("\r\n") + "\r\n";

  // Każde zajęcia → VEVENT (one event per actual date from dates array)
  events.forEach((e) => {
    // Godziny
    const [sh, sm] = (e.start || "00:00").split(":").map((n) => Number(n) || 0);
    const [eh, em] = (e.end || "00:00").split(":").map((n) => Number(n) || 0);

    // Get all actual dates for this event from the dates array
    const eventDates = Array.isArray(e.dates) ? e.dates : [];

    if (eventDates.length === 0) {
      // Skip events with no dates
      return;
    }

    // Create a separate VEVENT for each actual occurrence
    eventDates.forEach((dateStr) => {
      const eventDate = new Date(`${dateStr}T12:00:00`);
      if (Number.isNaN(eventDate.getTime())) return;

      const eventStart = new Date(eventDate);
      eventStart.setHours(sh, sm, 0, 0);
      const eventEnd = new Date(eventDate);
      eventEnd.setHours(eh, em, 0, 0);

      const dtStart = toICSDateLocal(eventStart);
      const dtEnd = toICSDateLocal(eventEnd);

      const uid = makeUid(e,dateStr);
      const summary = icsEscape(e.title || e.subj || "");
      const desc = icsEscape(
        [e.type, Array.isArray(e.groups) ? e.groups.join(", ") : ""]
          .filter(Boolean)
          .join(" "),
      );
      const location = icsEscape(e.room || "");

      ics +=
        [
          "BEGIN:VEVENT",
          `UID:${uid}`,
          `SUMMARY:${summary}`,
          desc ? `DESCRIPTION:${desc}` : "DESCRIPTION:",
          `DTSTART:${dtStart}`,
          `DTEND:${dtEnd}`,
          location ? `LOCATION:${location}` : "LOCATION:",
          "END:VEVENT",
        ].join("\r\n") + "\r\n";
    });
  });

  items.forEach((item) => { ics += itemEvent(item, reminders); });

  ics += "END:VCALENDAR";
  return ics;
}

export function exportICS(events, items = [], reminders = {}) {
  if (!events?.length && !items.length) { alert("Brak wydarzeń do eksportu."); return; }
  const ics=buildICS(events, items, reminders);

  // Zapis pliku
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "timetable.ics";
  link.click();
  URL.revokeObjectURL(url);
}
