export function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function normalizeTime(value) {
  const match = String(value || "").trim().match(/^(\d{1,2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/);
  if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) return "";
  return `${String(Number(match[1])).padStart(2, "0")}:${match[2]}`;
}

export function addMinutes(value, durationMinutes) {
  const start = normalizeTime(value);
  if (!start) return "";
  const duration = Number(durationMinutes);
  const total = (timeToMinutes(start) + (Number.isFinite(duration) && duration > 0 ? duration : 90)) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}
