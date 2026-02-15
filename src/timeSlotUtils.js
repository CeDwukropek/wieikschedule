import { timeToMinutes } from "./utils";

export function toMinutes(t) {
  return timeToMinutes(t);
}

export function createTimeSlots(startHour, endHour, slotMinutes) {
  const slotsPerHour = 60 / slotMinutes;
  const totalSlots = (endHour - startHour) * slotsPerHour;
  const slots = [];

  for (let i = 0; i < totalSlots; i++) {
    const hour = startHour + Math.floor((i * slotMinutes) / 60);
    const minute = (i * slotMinutes) % 60;
    const slotStart = hour * 60 + minute;
    const slotEnd = slotStart + slotMinutes;
    slots.push({ slotStart, slotEnd, index: i });
  }

  return slots;
}

export function getEventsForSlot(dayEvents, slotStart, slotEnd) {
  return dayEvents.filter((ev) => {
    const evStart = toMinutes(ev.start);
    const evEnd = toMinutes(ev.end);
    return evStart < slotEnd && evEnd > slotStart;
  });
}

export function getEventSpan(ev, slotMinutes) {
  const evStart = toMinutes(ev.start);
  const evEnd = toMinutes(ev.end);
  const durationMinutes = evEnd - evStart;
  return Math.ceil(durationMinutes / slotMinutes);
}
