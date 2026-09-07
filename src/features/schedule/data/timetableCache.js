export const TIMETABLE_REFRESH_INTERVAL_MS = 15 * 60 * 1000;
const OPTIONS_KEY = "wieik:timetable-options:v3";
const TIMETABLE_PREFIX = "wieik:timetable:v3:";
const SHARED_KEY = "wieik:timetable-shared:v1";

const timetables = new Map();
let optionsEntry = null;
let sharedEntry = null;
const composedTimetables = new Map();

function readEntry(key) {
  try {
    const entry = JSON.parse(localStorage.getItem(key));
    return Number(entry?.savedAt) ? entry : null;
  } catch {
    return null;
  }
}

function saveEntry(key, data) {
  const entry = { savedAt: Date.now(), data };
  try {
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // In-memory data remains usable when storage is unavailable or full.
  }
  return entry;
}

function isStale(entry) {
  return !entry?.savedAt || Date.now() - entry.savedAt > TIMETABLE_REFRESH_INTERVAL_MS;
}

function getTimetableEntry(id) {
  if (!timetables.has(id)) {
    const entry = readEntry(`${TIMETABLE_PREFIX}${id}`);
    if (entry?.data && typeof entry.data === "object") timetables.set(id, entry);
  }
  return timetables.get(id);
}

export function getCachedTimetableOptions() {
  if (!optionsEntry) {
    const entry = readEntry(OPTIONS_KEY);
    if (Array.isArray(entry?.data)) optionsEntry = entry;
  }
  return optionsEntry?.data || [];
}

export function areCachedTimetableOptionsStale() {
  getCachedTimetableOptions();
  return isStale(optionsEntry);
}

export function storeTimetableOptions(options) {
  optionsEntry = saveEntry(OPTIONS_KEY, options);
}

export function getCachedTimetableById(id) {
  const scheduleId = String(id || "").trim();
  if (!scheduleId) return null;
  const base = getTimetableEntry(scheduleId)?.data;
  const shared = getCachedSharedTimetable();
  if (!base || !shared) return null;
  const previous = composedTimetables.get(scheduleId);
  if (previous?.base === base && previous?.shared === shared) return previous.data;

  const dates = [base.minDate, base.maxDate, shared.minDate, shared.maxDate].filter(Boolean).sort();
  const data = {
    ...base,
    schedule: [...base.schedule, ...shared.schedule],
    subjects: { ...base.subjects, ...shared.subjects },
    groups: [...base.groups, ...shared.groups.filter(group => !base.groups.some(baseGroup => baseGroup.prefix === group.prefix))],
    minDate: dates[0] || null,
    maxDate: dates[dates.length - 1] || null,
  };
  composedTimetables.set(scheduleId, { base, shared, data });
  return data;
}

export function isCachedTimetableStale(id) {
  const scheduleId = String(id || "").trim();
  return !scheduleId || isStale(getTimetableEntry(scheduleId)) || isSharedTimetableStale();
}

export function storeTimetable(id, timetable) {
  timetables.set(id, saveEntry(`${TIMETABLE_PREFIX}${id}`, timetable));
}

export function getCachedSharedTimetable() {
  if (!sharedEntry) sharedEntry = readEntry(SHARED_KEY);
  return sharedEntry?.data || null;
}

export function isSharedTimetableStale() {
  getCachedSharedTimetable();
  return isStale(sharedEntry);
}

export function storeSharedTimetable(timetable) {
  // Namespaced keys prevent subject/id collisions with any individual schedule.
  const shared = {
    ...timetable,
    subjects: Object.fromEntries(Object.entries(timetable.subjects).map(([key, value]) => [`global:${key}`, value])),
    schedule: timetable.schedule.map(event => ({ ...event, id: `global:${event.id}`, subj: `global:${event.subj}`, _isGlobal: true })),
  };
  sharedEntry = saveEntry(SHARED_KEY, shared);
}
