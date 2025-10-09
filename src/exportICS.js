export function exportICS(events) {
  if (!events || events.length === 0) {
    alert("Brak wydarzeń do eksportu.");
    return;
  }

  // --- Pobierz datę końcową ---
  const untilInput = prompt(
    "Podaj datę końca powtarzania zajęć (RRULE) w formacie RRRR-MM-DD:",
    "2026-02-28"
  );

  let untilDate;
  try {
    untilDate = new Date(untilInput);
    if (isNaN(untilDate)) throw new Error("Nieprawidłowa data");
  } catch {
    alert("Nieprawidłowy format daty. Użyj formatu RRRR-MM-DD.");
    return;
  }

  const untilFormatted =
    untilDate
      .toISOString()
      .replace(/[-:]/g, "")
      .split(".")[0]
      .replace("T", "T") + "Z";

  // --- Oblicz poniedziałek bieżącego tygodnia ---
  const baseMonday = getMonday(new Date());

  let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
METHOD:PUBLISH
`;

  events.forEach((e) => {
    const eventDate = new Date(baseMonday);
    const offsetDays = e.day; // 0 = poniedziałek, 1 = wtorek itd.

    eventDate.setDate(baseMonday.getDate() + offsetDays);

    // 🟩 Rozróżnienie tygodni:
    if (e.weeks === "even") {
      // przesunięcie o 7 dni i ustawienie RRULE od tej daty
      eventDate.setDate(eventDate.getDate() + 7);
    }

    const [sh, sm] = e.start.split(":").map(Number);
    const [eh, em] = e.end.split(":").map(Number);

    const eventStart = new Date(eventDate);
    eventStart.setHours(sh, sm, 0, 0);
    const eventEnd = new Date(eventDate);
    eventEnd.setHours(eh, em, 0, 0);

    const dtStart = toICSDate(eventStart);
    const dtEnd = toICSDate(eventEnd);

    // 🧩 RRULE zależny od typu tygodnia
    const interval = e.weeks === "both" ? 1 : 2;
    const rrule = `RRULE:FREQ=WEEKLY;INTERVAL=${interval};UNTIL=${untilFormatted}`;

    const uid = `${e.id}-${Date.now()}@calendar-export`;
    const desc = `${e.type || ""} ${e.groups?.join(", ") || ""}`.trim();

    icsContent += `BEGIN:VEVENT
UID:${uid}
SUMMARY:${e.subj || ""}
DESCRIPTION:${desc}
DTSTART:${dtStart}
DTEND:${dtEnd}
LOCATION:${e.room || ""}
${rrule}
END:VEVENT
`;
  });

  icsContent += "END:VCALENDAR";

  // --- Zapis ---
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "timetable.ics";
  link.click();
  URL.revokeObjectURL(url);
}

// --- Pomocnicze ---
function toICSDate(date) {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = niedziela, 1 = poniedziałek...
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
