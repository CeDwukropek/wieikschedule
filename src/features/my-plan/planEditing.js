import { addMinutes, normalizeTime, timeToMinutes } from '../../utils/time';
import { mapAddedEvent } from './eventMappers';
import { filterEvents } from '../schedule/logic/filterEvents';

const DAY_NAMES = ['nd', 'pon', 'wt', 'śr', 'czw', 'pt', 'sob'];
const LAST_END = 22 * 60;

export function parseDate(value) {
  return new Date(`${value}T12:00:00`);
}

export function shortDate(value) {
  const date = parseDate(value);
  return `${DAY_NAMES[date.getDay()]} ${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}`;
}

// "pon 20.10 · 07:30–09:00 · A2" for a source or effective row.
export function describeSlot(row) {
  if (!row) return '';
  const start = normalizeTime(row.start_time);
  return [shortDate(row.date), `${start}–${addMinutes(start, row.duration_min)}`, row.room].filter(Boolean).join(' · ');
}

// What differs between the university plan and the personal one, in words.
export function describeChange(original, current) {
  if (!current) return 'odwołane u Ciebie';
  const parts = [];
  const when = row => `${shortDate(row.date)} ${normalizeTime(row.start_time)}–${addMinutes(normalizeTime(row.start_time), row.duration_min)}`;
  if (original.date !== current.date || original.start_time !== current.start_time || original.duration_min !== current.duration_min)
    parts.push(`${when(original)} → ${when(current)}`);
  if ((original.room || '') !== (current.room || '')) parts.push(`sala ${original.room || '—'} → ${current.room || '—'}`);
  if ((original.instructor || '') !== (current.instructor || '')) parts.push('zmieniony prowadzący');
  return parts.join(', ') || 'bez różnic';
}

// An override replaces its whole patch, so a new edit keeps earlier private changes of other fields.
export function mergePatch(override, changes) {
  return { ...(override?.action === 'modify' ? override.patch : {}), ...changes };
}

// Start times used by the university grid (07:30, 09:15, …), plus the class's own time.
export function startTimeOptions(rows, extra) {
  const values = new Set((rows || []).map(row => normalizeTime(row.start_time)).filter(Boolean));
  if (extra) values.add(normalizeTime(extra));
  return [...values].filter(time => timeToMinutes(time) >= 7 * 60 && timeToMinutes(time) < LAST_END)
    .sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
}

// Fields of a move form that differ from the current effective occurrence.
export function moveChanges(current, { date, start, end, instructor }) {
  const changes = {};
  const duration = timeToMinutes(end) - timeToMinutes(start);
  if (date !== current.date) changes.date = date;
  if (start !== normalizeTime(current.start_time)) changes.start_time = `${start}:00`;
  if (duration !== current.duration_min) changes.duration_min = duration;
  if (instructor !== undefined && instructor.trim() !== (current.instructor || '')) changes.instructor = instructor.trim() || null;
  return changes;
}

export function validateMove({ date, start, end }, bounds = {}) {
  // Weekends are allowed: the grid shows Saturday and Sunday in weeks that have anything then.
  if (!date || Number.isNaN(parseDate(date).getTime())) return 'Wybierz datę.';
  if ((bounds.min && date < bounds.min) || (bounds.max && date > bounds.max)) return 'Ta data jest poza zakresem planu.';
  if (!start || !end) return 'Podaj godzinę rozpoczęcia i zakończenia.';
  const from = timeToMinutes(start), to = timeToMinutes(end);
  if (from < 7 * 60) return 'Zajęcia mogą zaczynać się najwcześniej o 07:00.';
  if (to <= from) return 'Koniec musi być po rozpoczęciu.';
  if (to > LAST_END) return 'Zajęcia muszą skończyć się do 22:00.';
  return '';
}

export function overlaps(a, b) {
  return timeToMinutes(a.start) < timeToMinutes(b.end) && timeToMinutes(b.start) < timeToMinutes(a.end);
}

// Calendar event shape (as in the week view) for an entry of "Mój plan".
export function dialogEventFromItem(item) {
  const row = item.current || item.original;
  const event = mapAddedEvent({ ...row, event_id: item.event_id, added_event_id: item.added_event_id,
    subject: item.subject, type: item.type, group: item.group });
  if (!event) return null;
  return { ...event, origin: item.kind === 'added' ? 'added' : 'base', personal_override: Boolean(item.override) };
}

// Display-only tiles: privately cancelled classes and the slot a class was moved from.
// They never enter the effective plan, so export, collisions and agents ignore them.
export function ghostEvents(items, { faculties, weekStart, hideLectures = false }) {
  return items.flatMap(item => {
    if (!faculties.includes(item.faculty)) return [];
    const moved = item.kind === 'modified' && item.current &&
      (item.current.date !== item.original.date || item.current.start_time !== item.original.start_time);
    const ghost = item.kind === 'cancelled' ? 'cancelled' : moved ? 'moved-from' : null;
    if (!ghost) return [];
    const event = mapAddedEvent({ ...item.original, event_id: item.event_id, subject: item.subject, type: item.type, group: item.group });
    if (!event) return [];
    const tile = { ...event, id: `ghost-${ghost}-${item.event_id}`, origin: 'ghost', ghost, added_event_id: undefined,
      movedTo: item.current, personal_override: true };
    return filterEvents([tile], {}, hideLectures, true, weekStart).length ? [tile] : [];
  });
}
