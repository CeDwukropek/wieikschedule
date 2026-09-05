// exportICS.js

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
function makeUid(e) {
  const base = `${e.id || "ev"}-${e.subj || "subj"}`;
  return `${base}@wieikschedule`;
}

// --- Główny eksport -----------------------------------------------------------
export function exportICS(events) {
  if (!events || events.length === 0) {
    alert("Brak wydarzeń do eksportu.");
    return;
  }

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
      const eventDate = new Date(dateStr); // Parse "YYYY-MM-DD"
      if (Number.isNaN(eventDate.getTime())) return;

      const eventStart = new Date(eventDate);
      eventStart.setHours(sh, sm, 0, 0);
      const eventEnd = new Date(eventDate);
      eventEnd.setHours(eh, em, 0, 0);

      const dtStart = toICSDateLocal(eventStart);
      const dtEnd = toICSDateLocal(eventEnd);

      const uid = `${makeUid(e)}-${dateStr}`;
      const summary = icsEscape(e.subj || "");
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

  ics += "END:VCALENDAR";

  // Zapis pliku
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "timetable.ics";
  link.click();
  URL.revokeObjectURL(url);
}
