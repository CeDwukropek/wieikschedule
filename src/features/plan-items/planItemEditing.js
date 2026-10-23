import { toIsoDate } from "../../utils/date";
import { addMinutes, normalizeTime, timeToMinutes } from "../../utils/time";
import { isDayOff, kindOf } from "./planItemLogic";

const norm = value => String(value || "").trim().toLowerCase();
const DAY = 86400000;
export const addDays = (iso, days) => {
  const value = new Date(`${iso}T12:00:00`);
  return toIsoDate(new Date(value.getFullYear(), value.getMonth(), value.getDate() + days));
};
const daysBetween = (from, to) => Math.round((new Date(`${to}T12:00:00`) - new Date(`${from}T12:00:00`)) / DAY);
const hhmm = value => normalizeTime(value) || "";
const when = item => `${item.date} ${hhmm(item.start_time || item.due_time) || "99:99"}`;

export const facultyOf = (ev, scheduleId) => ev._sourceScheduleId || scheduleId;
// An entry on a class concerns its one group, or every group of the subject (lectures, shared classes).
export const classGroup = ev => (ev.groups?.length === 1 && !ev.appliesToAllGroups ? ev.groups[0] : null);
const isActive = ev => !isDayOff(ev) && norm(ev.status) !== "nieaktywne";

// Same rule as plan_can_write in the database; the server decides anyway.
export function canWriteGroup(roles, faculty, group) {
  return roles.some(role => role.role === "admin" || (role.faculty === faculty && (role.role === "starosta"
    || (role.role === "group_starosta" && group != null && role.group === group))));
}
// Groups the person may write group entries for; null stands for every group of the subject.
export function writableGroups(roles, faculty, groups) {
  const whole = roles.some(role => role.role === "admin" || (role.role === "starosta" && role.faculty === faculty));
  return [...(whole ? [null] : []), ...groups.filter(group => canWriteGroup(roles, faculty, group))];
}
export const canWriteAnyGroup = (roles, faculty) => roles.some(role => role.role === "admin" || role.faculty === faculty);

// Subjects of one plan with the groups that have them, for entries at a time of one's own.
export function subjectsOf(schedule = []) {
  const subjects = new Map();
  for (const ev of schedule) {
    if (!ev.title || !isActive(ev)) continue;
    const groups = subjects.get(ev.title) || new Set();
    (ev.groups || []).forEach(group => groups.add(group));
    subjects.set(ev.title, groups);
  }
  return [...subjects].map(([subject, groups]) => ({ subject, groups: [...groups].sort((a, b) => a.localeCompare(b, "pl", { numeric: true })) }))
    .sort((a, b) => a.subject.localeCompare(b.subject, "pl"));
}

const classKey = (ev, scheduleId) => [facultyOf(ev, scheduleId), norm(ev.title), norm(ev.type),
  [...(ev.groups || [])].sort().join("|"), Boolean(ev.appliesToAllGroups)].join("#");
const classTerm = ev => ({ key: `class:${ev.event_id}`, timing: "class", event_id: String(ev.event_id),
  date: ev.dates[0], start: ev.start, end: ev.end });
// The class's own occurrences for the same group, from the given date on (the group's next classes).
export function classTerms(planEvents, ev, { scheduleId, from, count = 6 }) {
  const key = classKey(ev, scheduleId), seen = new Set();
  return planEvents.filter(other => other.event_id && !other.ghost && !other.planItem && other.dates?.length && isActive(other)
      && classKey(other, scheduleId) === key && other.dates[0] >= from)
    .map(classTerm).sort((a, b) => `${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`))
    .filter(term => !seen.has(term.event_id) && seen.add(term.event_id)).slice(0, count);
}
// The class occurrence an entry is pinned to, and the same class on another day (to shift a series).
export const classOf = (planEvents, eventId) => planEvents.find(ev => String(ev.event_id) === String(eventId) && !ev.ghost && !ev.planItem);
function classOn(planEvents, ev, date, scheduleId) {
  const key = classKey(ev, scheduleId);
  const found = planEvents.find(other => other.event_id && !other.ghost && !other.planItem && other.dates?.[0] === date
    && isActive(other) && classKey(other, scheduleId) === key);
  return found ? classTerm(found) : null;
}

// Exactly one and two weeks later, same time.
export const laterTerms = (term, weeks = [1, 2]) => weeks.map(week => ({ ...term, key: `${term.timing}:${addDays(term.date, 7 * week)}:${term.start || term.due_time || ""}`,
  date: addDays(term.date, 7 * week), custom: false }));

export function termOfItem(item) {
  if (item.timing === "class") return { key: `class:${item.event_id}`, timing: "class", event_id: String(item.event_id), date: item.date,
    start: hhmm(item.start_time), end: addMinutes(hhmm(item.start_time), item.duration_min) };
  if (item.timing === "slot") return { key: "own", timing: "slot", date: item.date, start: hhmm(item.start_time),
    end: addMinutes(hhmm(item.start_time), item.duration_min) };
  return { key: "own", timing: "due", date: item.date, due_time: hhmm(item.due_time) };
}
export function termToItem(term) {
  if (term.timing === "class") return { timing: "class", event_id: term.event_id };
  if (term.timing === "slot") return { timing: "slot", date: term.date, start_time: term.start,
    duration_min: timeToMinutes(term.end) - timeToMinutes(term.start), due_time: null };
  return { timing: "due", date: term.date, due_time: term.due_time || null, start_time: null, duration_min: null };
}
export function termError(term) {
  if (term.timing === "class") return "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(term.date || "")) return "Wybierz datę.";
  if (term.timing === "due") return "";
  if (!hhmm(term.start) || !hhmm(term.end)) return "Podaj godziny.";
  if (term.start < "07:00" || term.end > "22:00") return "Termin musi mieścić się między 07:00 a 22:00.";
  if (timeToMinutes(term.end) - timeToMinutes(term.start) < 5) return "Koniec musi być po początku.";
  return "";
}
export function describeTerm(term) {
  const date = new Date(`${term.date}T12:00:00`).toLocaleDateString("pl-PL", { weekday: "short", day: "numeric", month: "numeric" });
  if (term.timing === "due") return term.due_time ? `${date}, do ${term.due_time}` : `${date}, cały dzień`;
  return `${date}, ${term.start}–${term.end}`;
}

// New entries, one per chosen term; saved together they form one series.
export function newItems(form, terms) {
  const title = form.title.trim() || kindOf(form).label;
  return terms.map(term => ({ scope: form.scope, faculty: form.faculty, kind: form.kind, title, details: form.details.trim() || null,
    ...(term.timing === "class" ? {} : { subject: form.subject || null, group: form.scope === "group" ? form.group ?? null : null }),
    ...termToItem(term) }));
}

// An entry the database would refuse as a duplicate (same class and kind, or same subject, group, kind, day and
// hour), hidden ones included: they stay in the plan of everyone else.
export function existingFor(items, term, { scope, kind, faculty, subject, group }, exceptId = null) {
  const time = value => hhmm(value) || "00:00";
  return items.find(item => item.id !== exceptId && item.scope === scope && item.kind === kind && (term.timing === "class"
    ? item.timing === "class" && String(item.event_id) === String(term.event_id)
    : item.timing !== "class" && item.faculty === faculty && (item.subject || "") === (subject || "")
      && (item.group || "") === (scope === "group" ? group || "" : "") && item.date === term.date
      && time(item.start_time || item.due_time) === time(term.timing === "slot" ? term.start : term.due_time))) || null;
}
export const termsLabel = count => `${count} ${count === 1 ? "termin"
  : [2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100) ? "terminy" : "terminów"}`;
export const SERIES_CHOICES = { one: "Tylko ten", following: "Ten i następne", all: "Wszystkie" };
// The entries of a series an edit or removal applies to: only this one, this and the following ones, or all of them.
export function seriesOf(items, item, which) {
  if (which === "one" || !item.series_id) return [item];
  const members = items.filter(other => other.series_id === item.series_id).sort((a, b) => when(a).localeCompare(when(b)));
  return which === "all" ? members : members.filter(other => when(other) >= when(item));
}

const TEXT = ["kind", "title", "details", "subject", "group"];
const TERM = ["timing", "event_id", "date", "start_time", "duration_min", "due_time"];
const termFields = item => Object.fromEntries(TERM.map(key => [key, item[key] ?? null]));
const sameTime = value => (value ? `${hhmm(value)}:00` : null);
// One edit applied to the chosen entries of a series: the same text, and the term moved by the same number of
// days (and to the new hours, if they changed). Returns the changes and what undo has to write back.
export function editItems(item, members, form, term, { planEvents, scheduleId }) {
  const edited = { kind: form.kind, title: form.title.trim() || kindOf(form).label, details: form.details.trim() || null,
    subject: form.subject || null, group: form.scope === "group" ? form.group ?? null : null };
  const textChanges = Object.fromEntries(TEXT.filter(key => (key !== "subject" && key !== "group") || term.timing !== "class")
    .filter(key => (edited[key] ?? null) !== (item[key] ?? null)).map(key => [key, edited[key]]));
  const target = termToItem(term), before = termOfItem(item);
  const moved = JSON.stringify(termToItem(before)) !== JSON.stringify(target);
  if (moved && members.length > 1 && term.timing !== item.timing) return { error: "Zmianę rodzaju terminu zapisz dla jednego wpisu." };
  const shift = daysBetween(item.date, term.date);
  const changes = [], undo = [];
  for (const member of members) {
    let next = null;
    if (moved && member.id === item.id) next = target;
    else if (moved && member.timing === "class") {
      const host = classOf(planEvents, member.event_id);
      const found = host && classOn(planEvents, host, addDays(member.date, shift), scheduleId);
      if (!found) return { error: `Nie ma tych zajęć ${describeTerm({ timing: "due", date: addDays(member.date, shift) }).replace(", cały dzień", "")} — przesuń ten termin osobno.` };
      next = termToItem(found);
    } else if (moved && member.timing === "slot") {
      // New hours carry over only when they were changed by hand on an entry with hours of its own.
      const own = termOfItem(member), hours = item.timing === "slot" && (before.start !== term.start || before.end !== term.end);
      next = termToItem({ ...own, date: addDays(member.date, shift), ...(hours ? { start: term.start, end: term.end } : {}) });
    } else if (moved) {
      next = termToItem({ ...termOfItem(member), date: addDays(member.date, shift),
        ...(item.timing === "due" && before.due_time !== term.due_time ? { due_time: term.due_time } : {}) });
    }
    const termChange = next && Object.fromEntries(Object.entries(next).filter(([key, value]) =>
      (key === "start_time" || key === "due_time" ? sameTime(member[key]) !== sameTime(value) : (member[key] ?? null) !== (value ?? null))));
    const memberText = Object.fromEntries(Object.entries(textChanges).filter(([key, value]) => (member[key] ?? null) !== value));
    const change = { ...memberText, ...(termChange && Object.keys(termChange).length ? next : {}) };
    if (!Object.keys(change).length) continue;
    changes.push({ id: member.id, revision: member.revision, ...change });
    undo.push({ id: member.id, ...Object.fromEntries(Object.keys(memberText).map(key => [key, member[key] ?? null])),
      ...(change.timing ? termFields(member) : {}) });
  }
  return { changes, undo };
}
// Undo writes the previous values with the revisions the save returned; entries pinned to a class keep only the class.
export const withRevisions = (undo, saved) => undo.map(entry => {
  const { revision } = saved.find(item => item.id === entry.id) || {};
  const value = { ...entry, revision };
  if (value.timing === "class") ["date", "start_time", "duration_min", "due_time"].forEach(key => delete value[key]);
  else if (value.timing) delete value.event_id;
  return value;
});

// A free slot chosen in the grid; a click without dragging gives 90 minutes.
export function slotTerm(date, startMinutes, endMinutes) {
  const time = minutes => `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
  const start = Math.max(7 * 60, Math.min(startMinutes, 22 * 60 - 15));
  const end = Math.min(22 * 60, endMinutes > start ? endMinutes : start + 90);
  return { key: `slot:${date}:${time(start)}`, timing: "slot", date, start: time(start), end: time(end) };
}
