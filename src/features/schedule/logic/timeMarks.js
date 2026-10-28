import { toIsoDate } from "../../../utils/date";
import { timeToMinutes } from "../../../utils/time";

export const minutesOfDay = date => date.getHours() * 60 + date.getMinutes();

// Whether a class on that day (ISO date) has ended by now.
export function hasEnded(dateIso, end, now) {
  const today = toIsoDate(now);
  if (!dateIso || dateIso !== today) return Boolean(dateIso) && dateIso < today;
  return /^\d{1,2}:\d{2}/.test(String(end || "")) && timeToMinutes(String(end).slice(0, 5)) <= minutesOfDay(now);
}

// Position (0–1) of the current time in a grid from startHour to endHour; null outside it.
export function nowFraction(now, startHour, endHour) {
  const fraction = (minutesOfDay(now) - startHour * 60) / ((endHour - startHour) * 60);
  return fraction >= 0 && fraction <= 1 ? fraction : null;
}
