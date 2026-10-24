// Reminders of entries by kind (defaults come from the server). Same meaning as api/_lib/planReminders.js:
// "N days before at HH:MM" or "N minutes before" the start or the hand-in hour, in Europe/Warsaw.
export const REMINDER_PRESETS = [
  { days_before: 1, at: '18:00' }, { days_before: 1, at: '20:00' }, { days_before: 2, at: '18:00' }, { days_before: 3, at: '18:00' },
  { days_before: 7, at: '18:00' }, { days_before: 0, at: '08:00' }, { days_before: 0, at: '09:00' },
  { minutes_before: 30 }, { minutes_before: 60 }, { minutes_before: 120 },
];
export const MAX_REMINDERS = 3;
export const reminderKey = reminder => JSON.stringify(reminder);
export function reminderLabel(reminder) {
  if (reminder.minutes_before !== undefined) {
    const minutes = reminder.minutes_before;
    return minutes % 60 === 0 ? `${minutes / 60} h przed` : `${minutes} min przed`;
  }
  const days = reminder.days_before;
  const day = days === 0 ? 'W dniu' : days === 1 ? 'Dzień wcześniej' : days === 7 ? 'Tydzień wcześniej' : `${days} dni wcześniej`;
  return `${day}, ${reminder.at}`;
}

// The UTC instant of a Warsaw wall-clock time, right on both sides of a DST change.
export function warsawInstant(date, time) {
  const [year, month, day] = date.split('-').map(Number), [hour, minute] = time.split(':').map(Number);
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  const offsetAt = instant => {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Warsaw', hourCycle: 'h23', year: 'numeric',
      month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).formatToParts(new Date(instant)).map(part => [part.type, part.value]));
    return Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute) - instant;
  };
  return new Date(guess - offsetAt(guess - offsetAt(guess)));
}
const shiftDate = (date, days) => { const value = new Date(`${date}T12:00:00Z`); value.setUTCDate(value.getUTCDate() - days); return value.toISOString().slice(0, 10); };
export function reminderTimes(item, list = []) {
  const hour = String(item.timing === 'due' ? item.due_time || '' : item.start_time || '').slice(0, 5);
  const times = new Set();
  for (const reminder of list) {
    if (reminder.minutes_before !== undefined) {
      if (hour) times.add(new Date(warsawInstant(item.date, hour).getTime() - reminder.minutes_before * 60000).toISOString());
    } else times.add(warsawInstant(shiftDate(item.date, reminder.days_before), reminder.at).toISOString());
  }
  return [...times].sort();
}
