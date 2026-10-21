export const TIMETABLE_REFRESH_INTERVAL_MS = 15 * 60 * 1000;
const OPTIONS_KEY = "wieik:timetable-options:v2";
const TIMETABLE_PREFIX = "wieik:timetable:v3:";

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

function saveEntry(key, data, version = null) {
  const entry = { savedAt: Date.now(), data, version };
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

export function getCachedTimetableVersion(id) {
  return getTimetableEntry(String(id || "").trim())?.version ?? null;
}

// An unchanged plan stays cached; only this tab's freshness clock moves.
export function touchTimetable(id) {
  const entry = getTimetableEntry(id);
  if (entry) entry.savedAt = Date.now();
}

export function storeTimetable(id, timetable, version = null) {
  timetables.set(id, saveEntry(`${TIMETABLE_PREFIX}${id}`, timetable, version));
  const options = getCachedTimetableOptions();
  if (!options.some(option => option.id === id)) {
    storeTimetableOptions([...options, { id, name: id }]
      .sort((a, b) => a.name.localeCompare(b.name, "pl")));
  }
}
