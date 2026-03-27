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

const jsonContext = require.context("./", false, /\.json$/);

const timetableIds = jsonContext
  .keys()
  .map((key) => key.replace(/^\.\//, "").replace(/\.json$/i, ""))
  .sort((a, b) => a.localeCompare(b, "pl"));

export const allTimetables = timetableIds.map((id) => ({
  id,
  name: id,
}));

export const defaultTimetable = allTimetables[0] || null;

const timetableCache = new Map();

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
  return timetableCache.get(id) || null;
}

export async function loadTimetableById(id) {
  // Lazy-load a timetable JSON file, normalize it, and cache the result.
  const scheduleId = String(id || "").trim();
  if (!scheduleId) return null;
  if (timetableCache.has(scheduleId)) {
    return timetableCache.get(scheduleId);
  }

  try {
    const mod = await import(
      /* webpackInclude: /\.json$/ */
      `./${scheduleId}.json`
    );
    const json = mod?.default || mod;
    const timetable = normalizeLoadedTimetable(scheduleId, json);
    timetableCache.set(scheduleId, timetable);
    return timetable;
  } catch {
    return null;
  }
}
