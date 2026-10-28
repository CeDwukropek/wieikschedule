import { toIsoDate } from "../../utils/date";
import { addMinutes } from "../../utils/time";

// Same colours as the system tags in the database (tag_definitions).
export const KINDS = {
  kolokwium: { label: "Kolokwium", short: "Kol.", color: "#EF4444" },
  wejsciowka: { label: "Wejściówka", short: "Wej.", color: "#F59E0B" },
  sprawozdanie: { label: "Sprawozdanie", short: "Spr.", color: "#3B82F6" },
  egzamin: { label: "Egzamin", short: "Egz.", color: "#A855F7" },
  poprawa: { label: "Poprawa", short: "Popr.", color: "#EC4899" },
  projekt: { label: "Projekt", short: "Proj.", color: "#10B981" },
  inne: { label: "Inne", short: "Inne", color: "#6B7280" },
};
export const kindOf = item => KINDS[item.kind] || KINDS.inne;
export const PROGRESS = { todo: "Do zrobienia", ready: "Gotowe", done: "Zrobione" };

export const planItemsEnabled = () => process.env.REACT_APP_PLAN_ITEMS === "true";

const DAY = 86400000;
const plus = (date, days) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
// One request covers the semester around today (the API allows 200 days), so week navigation needs none.
export function itemsWindow(today) {
  return { from: toIsoDate(plus(today, -63)), to: toIsoDate(plus(today, 136)) };
}

const norm = value => String(value || "").trim().toLowerCase();
// Group entries visible in the plan the person sees: the class itself is in their plan, or the subject is
// with that group. Entries for every group (no group, or "W" — the lecture, i.e. the whole year) need only
// the subject. A lecture in the plan does not reveal other groups' entries. Own entries are always visible.
// With hidden, the same choice among the entries the person hid (to show them again).
export function visibleItems(items, planEvents, { scheduleId, showAll = false, hidden = false } = {}) {
  const ids = new Set(), subjects = new Set(), pairs = new Set();
  for (const ev of planEvents) {
    const faculty = ev._sourceScheduleId || scheduleId, subject = norm(ev.title);
    if (ev.event_id) ids.add(String(ev.event_id));
    subjects.add(`${faculty}|${subject}`);
    for (const group of ev.groups || []) pairs.add(`${faculty}|${subject}|${norm(group)}`);
  }
  return items.filter(item => {
    if (Boolean(item.my_state?.hidden) !== hidden) return false;
    if (item.scope === "personal") return true;
    if (showAll && item.faculty === scheduleId) return true;
    const subject = `${item.faculty}|${norm(item.subject)}`;
    if (item.timing === "class" && ids.has(String(item.event_id))) return true;
    if (item.group == null || norm(item.group) === "w") return subjects.has(subject);
    return pairs.has(`${subject}|${norm(item.group)}`);
  });
}

// The "Pokaż terminy" setting: all, group or own entries, without the kinds switched off.
export const filterItems = (items, { scope = "all", hiddenKinds = [] } = {}) =>
  items.filter(item => (scope === "all" || item.scope === scope) && !hiddenKinds.includes(item.kind));

const start = item => String(item.start_time || "").slice(0, 5);
export function itemEnd(item) {
  return item.start_time ? addMinutes(start(item), item.duration_min) : null;
}
// An entry drawn as a block in the grid (own time, or a class that is not where the entry is).
export function itemBlock(item, day) {
  return { id: `item-${item.id}`, planItem: item, day, start: start(item), end: itemEnd(item), title: item.title,
    type: kindOf(item).label, groups: item.group ? [item.group] : [], room: "", dates: [item.date] };
}

// Places a week's entries: on the class they belong to, as blocks, or in the strip under the dates.
// A class entry stays at the group's term; if the class is elsewhere in this plan (moved privately)
// the entry becomes a block at its own time.
export function placeItems(items, weekStart, events) {
  const first = toIsoDate(weekStart), last = toIsoDate(plus(weekStart, 6));
  const dayOf = date => Math.round((new Date(`${date}T12:00:00`) - new Date(`${first}T12:00:00`)) / DAY);
  const attached = new Map(), blocks = [], strip = {};
  for (const item of items) {
    if (item.date < first || item.date > last) continue;
    const day = dayOf(item.date);
    if (item.timing === "due") { (strip[day] ||= []).push(item); continue; }
    const host = item.timing === "class" && events.find(ev => !ev.ghost && !ev.planItem && String(ev.event_id) === String(item.event_id)
      && ev.day === day && ev.start === start(item));
    if (host) attached.set(host, [...(attached.get(host) || []), item]);
    else blocks.push(itemBlock(item, day));
  }
  const byTime = (a, b) => String(a.due_time || "").localeCompare(String(b.due_time || "")) || a.title.localeCompare(b.title, "pl");
  Object.values(strip).forEach(list => list.sort(byTime));
  return {
    events: [...events.map(ev => attached.has(ev) ? { ...ev, entries: attached.get(ev) } : ev), ...blocks],
    strip,
  };
}

// A day off ("wolne") on a weekend is no reason to show Saturday and Sunday.
export const isDayOff = ev => String(ev.status || "").trim().toLowerCase() === "wolne";
// Mondays (ISO dates) of weeks with anything on Saturday or Sunday.
export function weekendWeeks(events, items = []) {
  const weeks = new Set();
  const add = date => {
    const value = new Date(`${date}T12:00:00`);
    const day = (value.getDay() + 6) % 7;
    if (day >= 5) weeks.add(toIsoDate(plus(value, -day)));
  };
  for (const ev of events) if (!isDayOff(ev)) for (const date of ev.dates || []) add(date);
  for (const item of items) add(item.date);
  return weeks;
}

// Entries from today on (with a countdown) and past ones not yet done, newest first.
export function upcomingItems(items, today, days = 14) {
  const first = toIsoDate(today), last = toIsoDate(plus(today, days)), recent = toIsoDate(plus(today, -days));
  const when = item => `${item.date} ${item.start_time || item.due_time || ""}`;
  return {
    upcoming: items.filter(item => item.date >= first && item.date <= last).sort((a, b) => when(a).localeCompare(when(b))),
    overdue: items.filter(item => item.date < first && item.date >= recent && item.my_state?.progress !== "done"
      && item.timing === "due").sort((a, b) => when(b).localeCompare(when(a))),
  };
}
export function countdown(date, today) {
  const days = Math.round((new Date(`${date}T12:00:00`) - new Date(`${toIsoDate(today)}T12:00:00`)) / DAY);
  if (days === 0) return "dziś";
  if (days === 1) return "jutro";
  if (days === -1) return "wczoraj";
  return days > 0 ? `za ${days} dni` : `${-days} dni temu`;
}
export function describeItemTime(item) {
  const date = new Date(`${item.date}T12:00:00`).toLocaleDateString("pl-PL", { weekday: "short", day: "numeric", month: "numeric" });
  if (item.timing === "due") return item.due_time ? `${date}, do ${String(item.due_time).slice(0, 5)}` : `${date}, cały dzień`;
  return `${date}, ${start(item)}–${itemEnd(item)}`;
}
export function describeAudience(item) {
  if (item.scope === "personal") return "Tylko Ty";
  // "W" is the lecture: the whole year, not a group of its own.
  return item.group && item.group !== "W" ? `Grupa ${item.group}` : "Wszystkie grupy";
}
const REVIEW = {
  moved: "Uczelnia przeniosła te zajęcia. Termin przesunął się razem z nimi — potwierdź go u prowadzącego.",
  cancelled: "Uczelnia odwołała te zajęcia. Sprawdź u prowadzącego, kiedy będzie ten termin.",
  changed: "Uczelnia zmieniła te zajęcia. Sprawdź, czy termin jest nadal aktualny.",
};
export function reviewNotice(item) {
  if (item.state !== "review") return "";
  const was = item.anchor?.date && item.anchor?.start_time
    ? ` Wcześniej: ${new Date(`${item.anchor.date}T12:00:00`).toLocaleDateString("pl-PL", { day: "numeric", month: "numeric" })} ${String(item.anchor.start_time).slice(0, 5)}.`
    : "";
  return (REVIEW[item.review_reason] || REVIEW.changed) + was;
}
