import { addMinutes, normalizeTime } from '../../utils/time';
import { toIsoDate } from '../../utils/date';
import { seriesOf } from '../schedule/data/normalizeTimetable';
import { mergePatch, moveChanges } from './planEditing';

export const SERIES_SCOPES = { one: 'Tylko te zajęcia', following: 'Te i następne', all: 'Wszystkie w serii' };
export const MAX_SERIES_CHANGES = 40;

const addDays = (iso, days) => {
  const value = new Date(`${iso}T12:00:00`);
  return toIsoDate(new Date(value.getFullYear(), value.getMonth(), value.getDate() + days));
};
const daysBetween = (from, to) => Math.round((new Date(`${to}T12:00:00`) - new Date(`${from}T12:00:00`)) / 86400000);
const when = row => `${row.date} ${row.start_time}`;

// The university occurrences of a class's series (its active ones), each with the person's private change.
export function seriesMembers(rows, eventId, overrideFor) {
  const own = rows.find(row => String(row.id) === String(eventId));
  const series = own && seriesOf(own.source_key);
  if (!series) return [];
  return rows.filter(row => seriesOf(row.source_key) === series && (row.status || 'aktywne') === 'aktywne')
    .sort((a, b) => when(a).localeCompare(when(b)))
    .map(row => ({ row, override: overrideFor(row.id) || null }));
}
// "Te i następne" counts from this occurrence in the university plan, wherever it was moved privately.
export function chooseMembers(members, eventId, which) {
  const own = members.find(member => String(member.row.id) === String(eventId));
  if (!own || which === 'one') return own ? [own] : [];
  return which === 'all' ? members : members.filter(member => when(member.row) >= when(own.row));
}

export const effectiveOf = ({ row, override }) => (override?.action === 'cancel' ? null : { ...row, ...(override?.action === 'modify' ? override.patch : {}) });
// Fields equal to the university plan are left out; an empty patch means the university plan again.
function memberChange({ row, override }, patch, reason) {
  const clean = Object.fromEntries(Object.entries(patch).filter(([key, value]) => (row[key] ?? null) !== (value ?? null)));
  if (!Object.keys(clean).length) return override ? { event_id: row.id, operation: 'delete' } : null;
  return { event_id: row.id, operation: 'upsert', action: 'modify', patch: clean, reason: reason || null };
}

// One private change applied to the chosen occurrences. A move shifts each occurrence by the same number of days
// from where it is now, and takes the new hours or instructor only if they were changed by hand.
export function seriesChanges(kind, members, { current, form = {}, reason } = {}) {
  if (kind === 'cancel') return members.filter(member => member.override?.action !== 'cancel')
    .map(member => ({ event_id: member.row.id, operation: 'upsert', action: 'cancel', patch: {}, reason: reason || null }));
  if (kind === 'restore') return members.filter(member => member.override).map(member => ({ event_id: member.row.id, operation: 'delete' }));
  const active = members.filter(effectiveOf);
  if (kind === 'room') return active.filter(member => (effectiveOf(member).room || '') !== (form.room || ''))
    .map(member => memberChange(member, mergePatch(member.override, { room: form.room || null }), reason)).filter(Boolean);
  const shift = daysBetween(current.date, form.date);
  const hours = form.start !== normalizeTime(current.start_time) || form.end !== addMinutes(normalizeTime(current.start_time), current.duration_min);
  const teacher = form.instructor !== undefined && form.instructor.trim() !== (current.instructor || '');
  return active.map(member => {
    const now = effectiveOf(member), start = hours ? form.start : normalizeTime(now.start_time);
    const changes = moveChanges(now, { date: addDays(now.date, shift), start, end: hours ? form.end : addMinutes(start, now.duration_min),
      ...(teacher ? { instructor: form.instructor } : {}) });
    return Object.keys(changes).length ? memberChange(member, mergePatch(member.override, changes), reason) : null;
  }).filter(Boolean);
}
// Where each occurrence ends up, to check collisions and the plan's date range one by one.
export function resultsOf(changes, members) {
  return changes.filter(change => change.operation === 'upsert' && change.action === 'modify').map(change => {
    const { row } = members.find(member => member.row.id === change.event_id);
    const result = { ...row, ...change.patch }, start = normalizeTime(result.start_time);
    return { event_id: row.id, date: result.date, start, end: addMinutes(start, result.duration_min) };
  });
}
