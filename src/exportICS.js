export function exportICS(events) {
  let icsData = `BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
METHOD:PUBLISH
`;

  // Znajdź poniedziałek bieżącego tygodnia jako punkt odniesienia
  const baseDate = new Date();
  const dayOfWeek = baseDate.getDay(); // 0 = niedziela
  const diffToMonday = (dayOfWeek + 6) % 7;
  baseDate.setDate(baseDate.getDate() - diffToMonday);
  baseDate.setHours(0, 0, 0, 0);

  // Pomocnicza funkcja formatująca
  const formatICSDate = (date) =>
    date.toISOString().replace(/[-:]/g, "").split(".")[0];

  // Powtarzalność co 2 tygodnie przez cały semestr (np. 4 miesiące)
  const UNTIL_DATE = new Date(baseDate);
  UNTIL_DATE.setMonth(UNTIL_DATE.getMonth() + 4);
  const untilICS = formatICSDate(UNTIL_DATE) + "Z";

  // Dla każdego eventu utwórz zdarzenia co 2 tygodnie (odd, even, both)
  events.forEach((e) => {
    const eventDate = new Date(baseDate);
    eventDate.setDate(baseDate.getDate() + e.day); // day: 0 = poniedziałek

    const [startH, startM] = e.start.split(":").map(Number);
    const [endH, endM] = e.end.split(":").map(Number);

    const startDate = new Date(eventDate);
    startDate.setHours(startH, startM, 0, 0);

    const endDate = new Date(eventDate);
    endDate.setHours(endH, endM, 0, 0);

    // Wyznacz przesunięcie tygodnia, jeśli odd/even
    let weekOffset = 0;
    if (e.weeks === "odd") weekOffset = 1;
    if (e.weeks === "even") weekOffset = 0;

    // przesunięcie pierwszego wystąpienia, jeśli trzeba
    if (e.weeks !== "both") {
      startDate.setDate(startDate.getDate() + weekOffset * 7);
      endDate.setDate(endDate.getDate() + weekOffset * 7);
    }

    // Generuj jedno wydarzenie z RRULE co 2 tygodnie
    icsData += `
BEGIN:VEVENT
UID:${e.id}-${Date.now()}@calendar-export
SUMMARY:${e.subj}
DESCRIPTION:${e.type || ""} ${e.groups?.join(", ") || ""}
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
LOCATION:${e.room || ""}
RRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=${untilICS}
END:VEVENT
`;
  });

  icsData += "\nEND:VCALENDAR";

  const blob = new Blob([icsData], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "plan_zajec.ics";
  a.click();
  URL.revokeObjectURL(url);
}
