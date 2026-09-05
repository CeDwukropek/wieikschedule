export const TIMETABLE_REFRESH_INTERVAL_MS = 15 * 60 * 1000;
const OPTIONS_KEY = "wieik:timetable-options:v1";
const TIMETABLE_PREFIX = "wieik:timetable:v1:";

const timetables = new Map();
let optionsEntry = null;

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
  if (!optionsEntry?.data?.length) {
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
  const cached = getTimetableEntry(scheduleId)?.data;
  if (!cached) return null;

  const options = getCachedTimetableOptions();
  if (!options.some(option => option.id === scheduleId)) {
    optionsEntry = {
      savedAt: optionsEntry?.savedAt || 0,
      data: [...options, { id: scheduleId, name: String(cached.name || scheduleId) }]
        .sort((a, b) => a.name.localeCompare(b.name, "pl")),
    };
  }
  return cached;
}

export function isCachedTimetableStale(id) {
  const scheduleId = String(id || "").trim();
  return !scheduleId || isStale(getTimetableEntry(scheduleId));
}

export function storeTimetable(id, timetable) {
  timetables.set(id, saveEntry(`${TIMETABLE_PREFIX}${id}`, timetable));
  const options = getCachedTimetableOptions();
  if (!options.some(option => option.id === id)) {
    storeTimetableOptions([...options, { id, name: id }]
      .sort((a, b) => a.name.localeCompare(b.name, "pl")));
  }
}
