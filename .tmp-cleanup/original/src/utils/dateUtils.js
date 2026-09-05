// Pure utility functions for date operations

export function getISOWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
}

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

export function getCurrentParity(date = new Date()) {
  return getISOWeekNumber(date) % 2 === 0 ? "even" : "odd";
}

export function isLecture(event) {
  return event.type?.toLowerCase() === "wykład";
}
