// exportICS.js

// --- Helpers: tygodnie / daty ------------------------------------------------
function getISOWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
}

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = nd, 1 = pn, ...
  const diff = (day === 0 ? -6 : 1) - day; // przesuń do poniedziałku
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

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

// UNTIL w iCal najlepiej ustawić na koniec dnia (23:59:59) w tym samym formacie co DTSTART
function toICSUntilLocalInclusive(yyyyMmDd) {
  // yyyyMmDd: obiekt Date lub string "YYYY-MM-DD"
  const d = new Date(yyyyMmDd);
  if (Number.isNaN(+d)) throw new Error("Nieprawidłowa data UNTIL");
  d.setHours(23, 59, 59, 0);
  return toICSDateLocal(d);
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

  // Pytamy o datę końca (RRULE:UNTIL) — format YYYY-MM-DD
  const untilInput = prompt(
    "Podaj datę końca powtarzania zajęć (RRULE) w formacie RRRR-MM-DD:",
    "2026-02-28"
  );
  if (!untilInput) return;

  let untilLocal;
  try {
    untilLocal = toICSUntilLocalInclusive(untilInput);
  } catch {
    alert("Nieprawidłowy format daty. Użyj formatu RRRR-MM-DD.");
    return;
  }

  // Poniedziałek „bazowego” tygodnia i jego parzystość
  const baseMonday = getMonday(new Date());
  const baseParity = getISOWeekNumber(baseMonday) % 2 === 0 ? "even" : "odd";

  // Nagłówek kalendarza
  let ics =
    [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
    ].join("\r\n") + "\r\n";

  console.log("events :>> ", events);
  // Każde zajęcia → VEVENT
  events.forEach((e) => {
    // Wylicz datę konkretnego dnia w bazowym tygodniu
    const eventDate = new Date(baseMonday);
    const offsetDays = Number(e.day) || 0; // 0..6 (u Ciebie 0..4)
    eventDate.setDate(eventDate.getDate() + offsetDays);

    // Jeśli parzystość zajęć ≠ parzystość bazowego tygodnia → przesuń start o tydzień
    if (e.weeks === "odd" && baseParity === "even") {
      eventDate.setDate(eventDate.getDate() + 7);
    }
    if (e.weeks === "even" && baseParity === "odd") {
      eventDate.setDate(eventDate.getDate() + 7);
    }
    const kinds = new Set(events.map((e) => e.weeks || "every"));
    console.log("weeks kinds:", [...kinds]); // oczekiwane: ["odd","even",...] lub przynajmniej ["odd","even"]

    // Godziny
    const [sh, sm] = (e.start || "00:00").split(":").map((n) => Number(n) || 0);
    const [eh, em] = (e.end || "00:00").split(":").map((n) => Number(n) || 0);

    const eventStart = new Date(eventDate);
    eventStart.setHours(sh, sm, 0, 0);
    const eventEnd = new Date(eventDate);
    eventEnd.setHours(eh, em, 0, 0);

    const dtStart = toICSDateLocal(eventStart);
    const dtEnd = toICSDateLocal(eventEnd);

    // RRULE: odd/even → co 2 tyg., wszystko inne (undefined, null, "all") → co tydzień
    const isBiweekly = e.weeks === "odd" || e.weeks === "even";
    const interval = isBiweekly ? 2 : 1;
    const rrule = `RRULE:FREQ=WEEKLY;INTERVAL=${interval};UNTIL=${untilLocal}`;

    const uid = makeUid(e);
    const summary = icsEscape(e.subj || "");
    const desc = icsEscape(
      [e.type, Array.isArray(e.groups) ? e.groups.join(", ") : ""]
        .filter(Boolean)
        .join(" ")
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
        rrule,
        "END:VEVENT",
      ].join("\r\n") + "\r\n";
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
