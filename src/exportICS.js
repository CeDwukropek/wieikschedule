import { saveAs } from "file-saver";

export function exportICS(events) {
  if (!events || events.length === 0) {
    alert("Brak wydarzeń do eksportu!");
    return;
  }

  // format lokalny
  const formatDate = (date) => {
    const pad = (n) => String(n).padStart(2, "0");
    return (
      date.getFullYear().toString() +
      pad(date.getMonth() + 1) +
      pad(date.getDate()) +
      "T" +
      pad(date.getHours()) +
      pad(date.getMinutes()) +
      pad(date.getSeconds())
    );
  };

  // Załóżmy, że tydzień zaczyna się od poniedziałku (day = 1)
  // Można zmienić datę startową, np. na pierwszy dzień semestru
  let icsData = `BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
METHOD:PUBLISH
`;
  // Znajdź poniedziałek bieżącego tygodnia jako punkt odniesienia
  const baseDate = new Date();
  const dayOfWeek = baseDate.getDay(); // 0 = niedziela, 1 = poniedziałek, ...
  const diffToMonday = (dayOfWeek + 6) % 7; // np. środa → 2 dni wstecz
  baseDate.setDate(baseDate.getDate() - diffToMonday);
  baseDate.setHours(0, 0, 0, 0);

  events.forEach((e) => {
    const eventDate = new Date(baseDate);
    eventDate.setDate(baseDate.getDate() + e.day); // day: 0 = pon, 1 = wt, itd.

    const [startH, startM] = e.start.split(":").map(Number);
    const [endH, endM] = e.end.split(":").map(Number);

    const startDate = new Date(eventDate);
    startDate.setHours(startH, startM, 0, 0);

    const endDate = new Date(eventDate);
    endDate.setHours(endH, endM, 0, 0);

    // format do ICS
    const formatICSDate = (date) =>
      date.toISOString().replace(/[-:]/g, "").split(".")[0];

    icsData += `
BEGIN:VEVENT
UID:${e.id}-${Date.now()}@calendar-export
SUMMARY:${e.subj}
DESCRIPTION:${e.type || ""} ${e.groups?.join(", ") || ""}
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
LOCATION:${e.room || ""}
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
