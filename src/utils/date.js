export const WEEKDAYS = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek"];

export function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 (Sun) .. 6
  const diff = (day === 0 ? -6 : 1) - day; // shift to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function formatDate(d) {
  // Zwraca "dd.mm", np. "06.10" — zawsze po polsku
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return ""; // ochrona na złe dane

  try {
    return dt.toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
    });
  } catch {
    // Fallback niezależny od locale
    const dd = String(dt.getDate()).padStart(2, "0");
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    return `${dd}.${mm}`;
  }
}


export function toIsoDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDaySelection(value, defaultDay = 0) {
  const [rawOffset, rawDay] = String(value || "").split(":");
  const day = Number(rawDay);
  const offset = rawOffset === "current" ? 0 : rawOffset === "next" ? 1 : Number(rawOffset);
  return {
    weekOffset: Number.isFinite(offset) ? offset : 0,
    dayIndex: Number.isFinite(day) ? Math.min(Math.max(day, 0), 4) : defaultDay,
  };
}
