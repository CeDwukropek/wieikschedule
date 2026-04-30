import { supabase } from "../supabaseClient";

// Timetables loader
//
// Ten moduł odpowiada za "wczytywanie eventów" z Supabase (tabela `events`) oraz
// przygotowanie danych w kształcie wymaganym przez UI (WeekView/DayView).
//
// Dane są cache'owane dwupoziomowo:
// - pamięć (Map) w trakcie działania aplikacji
// - localStorage z TTL (żeby szybciej startować i ograniczać liczbę zapytań)
//
// Publiczne API używane przez hooki:
// - getCachedTimetableOptions(), loadAllTimetableOptions()
// - getCachedTimetableById(), loadTimetableById()

const SUBJECT_COLORS = [
  "bg-indigo-900",
  "bg-sky-500",
  "bg-purple-800",
  "bg-emerald-700",
  "bg-purple-600",
  "bg-pink-600",
  "bg-green-600",
  "bg-red-800",
  "bg-orange-600",
  "bg-cyan-600",
  "bg-amber-600",
  "bg-teal-600",
  "bg-fuchsia-700",
];

const GROUP_ORDER = ["Ć", "C", "K", "L", "Lab", "Lec", "Lek", "Lk", "P", "S"];

function parseDateParts(dateValue) {
  // Parse ISO date string (YYYY-MM-DD) into numeric parts.
  const raw = String(dateValue || "").trim();
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    return {
      year: Number(match[1]),
      month: Number(match[2]),
      day: Number(match[3]),
    };
  }

  return null;
}

function toIsoDateFromParts(parts) {
  // Convert parsed date parts back to a normalized ISO date.
  if (!parts) return "";
  return `${String(parts.year).padStart(4, "0")}-${String(parts.month).padStart(
    2,
    "0",
  )}-${String(parts.day).padStart(2, "0")}`;
}

function getWeekInfo(dateValue) {
  // Resolve a date to a weekday index where Monday=0 and Sunday=6.
  const parts = parseDateParts(dateValue);
  if (!parts) return null;

  const date = new Date(parts.year, parts.month - 1, parts.day, 12, 0, 0, 0);
  if (Number.isNaN(date.getTime())) return null;

  const jsDay = date.getDay();
  const day = (jsDay + 6) % 7;

  return {
    day,
  };
}

function normalizeHm(value) {
  // Validate and normalize time to HH:mm format.
  const raw = String(value || "").trim();
  const match = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return "";
  const hh = Number(match[1]);
  const mm = Number(match[2]);
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return "";
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function addMinutesToHm(startHm, durationMinutes) {
  // Add duration to start time and return wrapped HH:mm value.
  const start = normalizeHm(startHm);
  if (!start) return "";
  const [hh, mm] = start.split(":").map(Number);
  const base = hh * 60 + mm;
  const duration = Number(durationMinutes) > 0 ? Number(durationMinutes) : 90;
  const end = (base + duration) % (24 * 60);
  return `${String(Math.floor(end / 60)).padStart(2, "0")}:${String(
    end % 60,
  ).padStart(2, "0")}`;
}

function parseGroups(value) {
  // Split raw group string into normalized group tokens.
  const raw = String(value || "").trim();
  if (!raw) return [];
  return raw
    .split(/\s*\/\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function isAllGroupsLabel(groupValue) {
  // Detect labels that represent events for all groups.
  const normalized = String(groupValue || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (!normalized) return false;

  return normalized === "wszystkie grupy";
}

function getGroupPrefix(groupName) {
  // Extract the non-numeric prefix from a group identifier.
  const raw = String(groupName || "").trim();
  if (!raw) return "";
  const prefix = raw.match(/^[^\d\s]+/)?.[0] || "";
  return prefix;
}

function normalizeType(type) {
  // Normalize event type label for consistent UI display.
  const rawType = String(type || "")
    .trim()
    .toLowerCase();
  if (rawType.includes("wyk")) return "Wykład";
  if (!rawType) return "Zajęcia";
  return rawType.charAt(0).toUpperCase() + rawType.slice(1);
}

function isDayOffStatus(value) {
  // Mark day-off records based on normalized status field.
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return normalized === "wolne";
}

function hashString(text) {
  // Create a stable numeric hash used for deterministic color assignment.
  let hash = 0;
  const value = String(text || "");
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function makeSubjectCode(name) {
  // Build an uppercase ASCII-safe key for subject dictionary entries.
  const normalized = String(name || "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return normalized || "SUBJECT";
}

function makeGroupLabel(prefix) {
  // Map internal group prefixes to user-friendly labels.
  const value = String(prefix || "").trim();
  if (!value) return "Grupa";

  const map = {
    Ć: "Ćwiczenia",
    C: "Ćwiczenia",
    L: "Laboratoria",
    Lf: "Laboratoria",
    Lek: "Lektorat",
    Lk: "Laboratoria komputerowe",
    P: "Projekt",
  };

  return map[value] || value;
}

function buildGroups(normalizedEvents) {
  // Derive available group filters and defaults from normalized schedule events.
  const defaults = new Map();

  normalizedEvents.forEach((event) => {
    (event.groups || []).forEach((group) => {
      const prefix = getGroupPrefix(group);
      if (!prefix || prefix === "W") return;
      if (!defaults.has(prefix)) {
        defaults.set(prefix, group);
      }
    });
  });

  return Array.from(defaults.keys())
    .sort((a, b) => {
      const ia = GROUP_ORDER.indexOf(a);
      const ib = GROUP_ORDER.indexOf(b);
      const wa = ia === -1 ? Number.MAX_SAFE_INTEGER : ia;
      const wb = ib === -1 ? Number.MAX_SAFE_INTEGER : ib;
      if (wa !== wb) return wa - wb;
      return a.localeCompare(b, "pl");
    })
    .map((prefix) => ({
      type: prefix,
      prefix,
      label: makeGroupLabel(prefix),
      defaultValue: defaults.get(prefix),
    }));
}

function buildTimetableFromSemesterJson(fileId, json) {
  // Transform raw semester JSON into normalized timetable data used by the app.
  const rawEvents = Array.isArray(json?.events) ? json.events : [];
  const name = String(json?.facultyName || fileId);
  const subjectCodes = new Map();
  const subjects = {};
  const merged = new Map();
  let minEventTime = Number.POSITIVE_INFINITY;
  let maxEventTime = Number.NEGATIVE_INFINITY;

  rawEvents.forEach((item, idx) => {
    const dateParts = parseDateParts(item?.date);
    const eventDateIso = toIsoDateFromParts(dateParts);
    if (dateParts) {
      const dateValue = new Date(
        dateParts.year,
        dateParts.month - 1,
        dateParts.day,
        12,
        0,
        0,
        0,
      );
      const timeValue = dateValue.getTime();
      if (!Number.isNaN(timeValue)) {
        minEventTime = Math.min(minEventTime, timeValue);
        maxEventTime = Math.max(maxEventTime, timeValue);
      }
    }

    const weekInfo = getWeekInfo(item?.date);
    if (!weekInfo) return;

    const start = normalizeHm(item?.startTime);
    if (!start) return;

    const end = addMinutesToHm(start, item?.durationMin);
    if (!end) return;

    const subjectName = String(item?.subject || "").trim() || "Przedmiot";
    const teacher = String(item?.instructor || "").trim();
    const room = String(item?.room || "").trim();
    const status = String(item?.status || "").trim();
    const parsedGroups = parseGroups(item?.group);
    const appliesToAllByGroup =
      parsedGroups.length > 0 &&
      parsedGroups.every((group) => isAllGroupsLabel(group));
    const appliesToAllByStatus = isDayOffStatus(status);
    const appliesToAllGroups = appliesToAllByGroup || appliesToAllByStatus;
    const normalizedGroups =
      parsedGroups.includes("W") || appliesToAllGroups ? [] : parsedGroups;
    const eventType = normalizeType(item?.type);

    let subjCode = subjectCodes.get(subjectName);
    if (!subjCode) {
      let candidate = makeSubjectCode(subjectName);
      let suffix = 2;
      while (subjects[candidate]) {
        candidate = `${makeSubjectCode(subjectName)}_${suffix}`;
        suffix += 1;
      }
      subjCode = candidate;
      subjectCodes.set(subjectName, subjCode);
      subjects[subjCode] = {
        name: subjectName,
        teacher,
        color: SUBJECT_COLORS[hashString(subjectName) % SUBJECT_COLORS.length],
      };
    }

    const eventKey = [
      String(item?.event_id || "").trim(),
      weekInfo.day,
      start,
      end,
      subjCode,
      eventType,
      teacher,
      room,
      appliesToAllGroups ? "ALL_GROUPS" : "",
      [...normalizedGroups].sort().join("|"),
    ].join("__");

    if (!merged.has(eventKey)) {
      merged.set(eventKey, {
        id: `${fileId}-${idx + 1}`,
        event_id: String(item?.event_id || "").trim() || undefined,
        subj: subjCode,
        title: subjectName,
        type: eventType,
        status,
        teacher,
        groups: normalizedGroups,
        appliesToAllGroups,
        day: weekInfo.day,
        start,
        end,
        room,
        _dates: new Set(eventDateIso ? [eventDateIso] : []),
      });
    } else {
      if (eventDateIso) {
        merged.get(eventKey)._dates.add(eventDateIso);
      }
    }
  });

  const schedule = Array.from(merged.values())
    .map((event, index) => {
      const { _dates, ...clean } = event;
      return {
        ...clean,
        id: index + 1,
        dates: Array.from(_dates || []).sort(),
      };
    })
    .sort((a, b) => {
      if (a.day !== b.day) return a.day - b.day;
      if (a.start !== b.start) return a.start.localeCompare(b.start);
      return String(a.id).localeCompare(String(b.id));
    });

  const groups = buildGroups(schedule);
  const minDate =
    Number.isFinite(minEventTime) && minEventTime !== Number.POSITIVE_INFINITY
      ? new Date(minEventTime).toISOString().slice(0, 10)
      : null;
  const maxDate =
    Number.isFinite(maxEventTime) && maxEventTime !== Number.NEGATIVE_INFINITY
      ? new Date(maxEventTime).toISOString().slice(0, 10)
      : null;

  return {
    id: fileId,
    name,
    schedule,
    subjects,
    groups,
    minDate,
    maxDate,
  };
}

function normalizeDbTime(value) {
  // Convert DB TIME format (HH:mm:ss) to HH:mm used by existing UI logic.
  const raw = String(value || "").trim();
  const match = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/);
  if (!match) return "";
  return `${String(Number(match[1])).padStart(2, "0")}:${match[2]}`;
}

function mapDbEventToLegacyShape(row) {
  // Keep compatibility with existing normalization function.
  return {
    event_id: String(row?.id || "").trim(),
    date: String(row?.date || "").trim(),
    startTime: normalizeDbTime(row?.start_time),
    durationMin: Number(row?.duration_min) > 0 ? Number(row.duration_min) : 90,
    subject: String(row?.subject || "").trim(),
    instructor: String(row?.instructor || "").trim(),
    room: String(row?.room || "").trim(),
    group: String(row?.group || "").trim(),
    type: String(row?.type || "").trim(),
    status: String(row?.status || "").trim() || "aktywne",
  };
}

function buildEmptyTimetable(id) {
  return {
    id,
    name: id,
    schedule: [],
    subjects: {},
    groups: [],
    minDate: null,
    maxDate: null,
  };
}

export const allTimetables = [];
export const defaultTimetable = null;

const timetableCache = new Map();
const timetableInFlight = new Map();
let timetableOptionsCache = [];
let timetableOptionsPromise = null;

const TIMETABLE_OPTIONS_TTL_MS = 10 * 60 * 1000;
const TIMETABLE_TTL_MS = 10 * 60 * 1000;
const TIMETABLE_OPTIONS_STORAGE_KEY = "wieik:timetable-options:v1";
const TIMETABLE_STORAGE_PREFIX = "wieik:timetable:v1:";

// localStorage schema:
// - value: { savedAt: number(ms), data: any }
// - stale dane mogą być zwracane natychmiast (allowStale=true), a refresh leci w tle
//   (żeby UI nie "migało" i było responsywne nawet przy wolnej sieci).

function getLocalStorage() {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage || null;
  } catch {
    return null;
  }
}

function readTtlCacheEntry(key) {
  const storage = getLocalStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const savedAt = Number(parsed?.savedAt || 0);
    if (!savedAt) {
      return null;
    }

    return {
      data: parsed?.data ?? null,
      savedAt,
    };
  } catch {
    return null;
  }
}

function getTtlCacheInfo(key, ttlMs) {
  const entry = readTtlCacheEntry(key);
  if (!entry) return null;

  const ageMs = Date.now() - entry.savedAt;
  return {
    data: entry.data,
    savedAt: entry.savedAt,
    ageMs,
    isStale: ageMs > ttlMs,
  };
}

function readTtlCache(key, ttlMs, { allowStale = false } = {}) {
  const entry = readTtlCacheEntry(key);
  if (!entry) return null;

  const ageMs = Date.now() - entry.savedAt;
  if (ageMs <= ttlMs) {
    return entry.data;
  }

  return allowStale ? entry.data : null;
}

function isTtlCacheStale(key, ttlMs) {
  const info = getTtlCacheInfo(key, ttlMs);
  return !info || info.isStale;
}

function writeTtlCache(key, data) {
  const storage = getLocalStorage();
  if (!storage) return;

  try {
    storage.setItem(
      key,
      JSON.stringify({
        savedAt: Date.now(),
        data,
      }),
    );
  } catch {
    // Ignore write failures (private mode/full quota).
  }
}

function buildTimetableStorageKey(id) {
  return `${TIMETABLE_STORAGE_PREFIX}${id}`;
}

function normalizeLoadedTimetable(id, json) {
  // Ensure loaded timetable has normalized shape and final metadata.
  const timetable = buildTimetableFromSemesterJson(id, json);
  const name = String(json?.facultyName || timetable.name || id);
  return {
    ...timetable,
    id,
    name,
  };
}

export function getCachedTimetableById(id) {
  // Return timetable from in-memory cache when available.
  const scheduleId = String(id || "").trim();
  if (!scheduleId) return null;

  if (timetableCache.has(scheduleId)) {
    return timetableCache.get(scheduleId) || null;
  }

  const cached = readTtlCache(
    buildTimetableStorageKey(scheduleId),
    TIMETABLE_TTL_MS,
    { allowStale: true },
  );
  if (!cached || typeof cached !== "object") {
    return null;
  }

  timetableCache.set(scheduleId, cached);

  if (!timetableOptionsCache.some((option) => option.id === scheduleId)) {
    timetableOptionsCache = [
      ...timetableOptionsCache,
      { id: scheduleId, name: String(cached?.name || scheduleId) },
    ].sort((a, b) => a.name.localeCompare(b.name, "pl"));
  }

  return cached;
}

export function getCachedTimetableInfoById(id) {
  const scheduleId = String(id || "").trim();
  if (!scheduleId) return null;

  if (timetableCache.has(scheduleId)) {
    const cached = timetableCache.get(scheduleId);
    return {
      source: "cache",
      data: cached,
      savedAt: null,
      isStale: false,
    };
  }

  const info = getTtlCacheInfo(
    buildTimetableStorageKey(scheduleId),
    TIMETABLE_TTL_MS,
  );
  if (!info || !info.data || typeof info.data !== "object") {
    return null;
  }

  return {
    source: "cache",
    data: info.data,
    savedAt: info.savedAt,
    ageMs: info.ageMs,
    isStale: info.isStale,
  };
}

export function getCachedTimetableOptions() {
  // Return cached timetable options used by schedule selectors.
  if (!timetableOptionsCache.length) {
    const persistent = readTtlCache(
      TIMETABLE_OPTIONS_STORAGE_KEY,
      TIMETABLE_OPTIONS_TTL_MS,
      { allowStale: true },
    );
    if (Array.isArray(persistent)) {
      timetableOptionsCache = persistent;
    }
  }

  return timetableOptionsCache;
}

export async function loadAllTimetableOptions() {
  // Load unique faculties from DB; each faculty maps to one selectable timetable.
  if (timetableOptionsCache.length > 0) {
    if (
      isTtlCacheStale(TIMETABLE_OPTIONS_STORAGE_KEY, TIMETABLE_OPTIONS_TTL_MS)
    ) {
      void refreshAllTimetableOptions();
    }
    return timetableOptionsCache;
  }

  const persistentOptions = readTtlCache(
    TIMETABLE_OPTIONS_STORAGE_KEY,
    TIMETABLE_OPTIONS_TTL_MS,
    { allowStale: true },
  );
  if (Array.isArray(persistentOptions) && persistentOptions.length > 0) {
    timetableOptionsCache = persistentOptions;
    if (
      isTtlCacheStale(TIMETABLE_OPTIONS_STORAGE_KEY, TIMETABLE_OPTIONS_TTL_MS)
    ) {
      void refreshAllTimetableOptions();
    }
    return timetableOptionsCache;
  }

  if (timetableOptionsPromise) {
    return timetableOptionsPromise;
  }

  if (!supabase) {
    return [];
  }

  return refreshAllTimetableOptions();
}

async function refreshAllTimetableOptions() {
  if (timetableOptionsPromise) {
    return timetableOptionsPromise;
  }

  if (!supabase) {
    return Promise.resolve(timetableOptionsCache);
  }

  timetableOptionsPromise = (async () => {
    const uniqueFaculties = new Set();
    const pageSize = 1000;
    let from = 0;
    let hasMore = true;

    while (hasMore) {
      const to = from + pageSize - 1;
      const { data, error } = await supabase
        .from("events")
        .select("faculty")
        .order("faculty", { ascending: true })
        .range(from, to);

      if (error) {
        console.error(
          "[timetables] Failed to load faculties from Supabase",
          error,
        );
        return [];
      }

      (data || []).forEach((row) => {
        const faculty = String(row?.faculty || "").trim();
        if (faculty) uniqueFaculties.add(faculty);
      });

      hasMore = Array.isArray(data) && data.length === pageSize;
      from += pageSize;
    }

    const unique = Array.from(uniqueFaculties).sort((a, b) =>
      a.localeCompare(b, "pl"),
    );

    timetableOptionsCache = unique.map((id) => ({ id, name: id }));
    writeTtlCache(TIMETABLE_OPTIONS_STORAGE_KEY, timetableOptionsCache);
    return timetableOptionsCache;
  })();

  try {
    return await timetableOptionsPromise;
  } finally {
    timetableOptionsPromise = null;
  }
}

export async function loadTimetableById(id) {
  // Load a faculty timetable from Supabase, normalize, and cache the result.
  const scheduleId = String(id || "").trim();
  if (!scheduleId) return null;

  const cachedTimetable = getCachedTimetableById(scheduleId);
  if (cachedTimetable) {
    if (
      isTtlCacheStale(buildTimetableStorageKey(scheduleId), TIMETABLE_TTL_MS)
    ) {
      void refreshTimetableById(scheduleId);
    }
    return cachedTimetable;
  }

  if (timetableCache.has(scheduleId)) {
    return timetableCache.get(scheduleId);
  }
  if (timetableInFlight.has(scheduleId)) {
    return timetableInFlight.get(scheduleId);
  }

  if (!supabase) {
    return buildEmptyTimetable(scheduleId);
  }

  return refreshTimetableById(scheduleId);
}

async function refreshTimetableById(scheduleId) {
  if (timetableInFlight.has(scheduleId)) {
    return timetableInFlight.get(scheduleId);
  }

  const requestPromise = (async () => {
    const { data, error } = await supabase
      .from("events")
      .select(
        "id,faculty,date,start_time,duration_min,subject,instructor,room,group,type,status",
      )
      .eq("faculty", scheduleId)
      .or("status.is.null,status.eq.aktywne")
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      console.error(
        `[timetables] Failed to load timetable '${scheduleId}'`,
        error,
      );
      return null;
    }

    const mappedEvents = (data || []).map(mapDbEventToLegacyShape);
    const timetable = normalizeLoadedTimetable(scheduleId, {
      facultyName: scheduleId,
      events: mappedEvents,
    });

    timetableCache.set(scheduleId, timetable);
    writeTtlCache(buildTimetableStorageKey(scheduleId), timetable);

    if (!timetableOptionsCache.some((option) => option.id === scheduleId)) {
      timetableOptionsCache = [
        ...timetableOptionsCache,
        { id: scheduleId, name: scheduleId },
      ].sort((a, b) => a.name.localeCompare(b.name, "pl"));
      writeTtlCache(TIMETABLE_OPTIONS_STORAGE_KEY, timetableOptionsCache);
    }

    return timetable;
  })();

  timetableInFlight.set(scheduleId, requestPromise);

  try {
    return await requestPromise;
  } finally {
    timetableInFlight.delete(scheduleId);
  }
}
