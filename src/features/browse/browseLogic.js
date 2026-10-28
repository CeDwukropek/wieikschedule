import { splitTeacherDisplay } from "../schedule/logic/teacherDisplay";
import { normalizeTimetable } from "../schedule/data/normalizeTimetable";
import { timeToMinutes } from "../../utils/time";

// What is browsed instead of one's own plan: an instructor's or a room's plan, or rooms free at a time.
export const BROWSE_MODES = {
  mine: "Mój plan",
  teacher: "Prowadzący",
  room: "Sala",
  free: "Wolne sale",
};

// Spellings of one room differ between plans ("H / C" and "H/C", "19_" and "19", "wa2" and "WA2").
export const cleanRoom = room => String(room || "").trim().replace(/\s*\/\s*/g, "/").replace(/_+$/, "").replace(/\s+/g, " ");
export const roomKey = room => cleanRoom(room).toUpperCase();
// A room one can sit in has a number; trainings and plan names ("Szkolenie biblioteczne", "BHP") do not.
export const isRoom = label => /\d/.test(label) && label.length <= 16 && !label.includes("_");

const fold = value => String(value || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ł/g, "l");

// Instructors and rooms of all plans, each with its most common spelling, alphabetically.
export function buildDirectory(rows) {
  const teachers = new Map(), rooms = new Map();
  const count = (map, key, label) => {
    const entry = map.get(key) || { key, spellings: new Map(), count: 0 };
    entry.count += 1;
    entry.spellings.set(label, (entry.spellings.get(label) || 0) + 1);
    map.set(key, entry);
  };
  for (const row of rows) {
    for (const teacher of splitTeacherDisplay(row.instructor)) count(teachers, teacher, teacher);
    const room = cleanRoom(row.room);
    if (room) count(rooms, room.toUpperCase(), room);
  }
  const list = map => [...map.values()].map(({ key, spellings, count: n }) => ({
    key, label: [...spellings].sort((a, b) => b[1] - a[1])[0][0], count: n,
  })).sort((a, b) => a.label.localeCompare(b.label, "pl", { numeric: true }));
  return { teachers: list(teachers), rooms: list(rooms) };
}

// Entries whose label contains every word of the query (letters without diacritics, any case).
export function searchDirectory(list, query, limit = 8) {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return list.filter(entry => words.every(word => fold(entry.label).includes(word))).slice(0, limit);
}

export function matchesBrowse(row, { mode, key }) {
  if (mode === "teacher") return splitTeacherDisplay(row.instructor).includes(key);
  if (mode === "room") return roomKey(row.room) === key;
  return false;
}

// One class held for several groups or plans at once is one row per group in the data (some plans also list
// one meeting as a lecture, a lab and a project); the same instructor, room, subject and time is one class here.
function mergeShared(rows) {
  const classes = new Map();
  for (const row of rows) {
    const key = [row.date, row.start_time, row.duration_min, row.subject, roomKey(row.room), row.instructor].join("|");
    const shared = classes.get(key) || { row, audience: new Map(), types: new Set() };
    if (row.type) shared.types.add(row.type);
    const groups = shared.audience.get(row.faculty) || new Set();
    String(row.group || "").split(/\s*\/\s*/).filter(group => group && group !== "W").forEach(group => groups.add(group));
    shared.audience.set(row.faculty, groups);
    classes.set(key, shared);
  }
  return [...classes.values()];
}

// Classes of the browsed instructor or room as calendar events, each with the plans and groups it is for.
// The tile shows what the person cannot tell from the browsed plan itself (the room, or the plans and groups).
export function browseTimetable(rows, browse) {
  const classes = mergeShared(rows.filter(row => matchesBrowse(row, browse)));
  const byId = new Map(classes.map(shared => [String(shared.row.id), shared]));
  const table = normalizeTimetable("browse", classes.map(({ row, audience }) =>
    ({ ...row, group: [...new Set([...audience.values()].flatMap(groups => [...groups]))].join("/") })));
  const capital = text => text.charAt(0).toUpperCase() + text.slice(1);
  const schedule = table.schedule.map(ev => {
    const shared = byId.get(String(ev.event_id));
    const audience = [...(shared?.audience || new Map())];
    const type = shared?.types.size > 1 ? [...shared.types].map(capital).join(" + ") : ev.type;
    const plan = audience.map(([faculty]) => faculty).join(", ");
    const who = audience.map(([faculty, groups]) => [faculty, [...groups].join(", ")].filter(Boolean).join(" ")).join("; ");
    return { ...ev, type, plan, note: browse.mode === "teacher" ? [ev.room, who].filter(Boolean).join(" · ") : who };
  });
  return { schedule, subjects: table.subjects };
}

const hm = minutes => `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
export const minutesLabel = hm;

// Rooms on a day: for each, the free windows between from and to (minutes), and its state at a minute.
// Rooms with no class that day are free all day. Busy rooms say when they are free next. A break shorter than
// half an hour between two classes is not a free room.
export function freeRooms(rows, rooms, date, minute, { from = 7 * 60, to = 22 * 60, shortest = 30 } = {}) {
  const busy = new Map();
  for (const row of rows) {
    if (row.date !== date || String(row.status || "aktywne") === "wolne") continue;
    const label = cleanRoom(row.room);
    if (!label) continue;
    const start = timeToMinutes(String(row.start_time).slice(0, 5));
    const list = busy.get(label.toUpperCase()) || [];
    list.push([start, start + (Number(row.duration_min) || 90)]);
    busy.set(label.toUpperCase(), list);
  }
  return rooms.filter(room => isRoom(room.label)).map(room => {
    const taken = (busy.get(room.key) || []).sort((a, b) => a[0] - b[0]);
    const windows = [];
    let cursor = from;
    for (const [start, end] of taken) {
      if (start - cursor >= shortest) windows.push([cursor, Math.min(start, to)]);
      cursor = Math.max(cursor, end);
    }
    if (to - cursor >= shortest) windows.push([cursor, to]);
    const now = windows.find(([start, end]) => start <= minute && minute < end) || null;
    const next = now ? null : windows.find(([start]) => start > minute) || null;
    const busyUntil = now ? null : (taken.find(([start, end]) => start <= minute && minute < end) || [])[1] ?? null;
    return { ...room, windows, now, next, busyUntil, classes: taken.length };
  }).sort((a, b) => (Boolean(b.now) - Boolean(a.now))
    || (a.now && b.now ? (b.now[1] - minute) - (a.now[1] - minute) : (a.next?.[0] ?? 9999) - (b.next?.[0] ?? 9999))
    || a.label.localeCompare(b.label, "pl", { numeric: true }));
}

// The browsed plan in the address, so it can be shared: ?prowadzacy=…, ?sala=…, ?wolne.
const PARAMS = { teacher: "prowadzacy", room: "sala" };
export function browseFromSearch(search) {
  const params = new URLSearchParams(search);
  if (params.get(PARAMS.teacher)) return { mode: "teacher", key: params.get(PARAMS.teacher).trim(), label: params.get(PARAMS.teacher).trim() };
  if (params.get(PARAMS.room)) return { mode: "room", key: roomKey(params.get(PARAMS.room)), label: cleanRoom(params.get(PARAMS.room)) };
  if (params.has("wolne")) return { mode: "free" };
  return { mode: "mine" };
}
export function browseSearch(search, browse) {
  const params = new URLSearchParams(search);
  [...Object.values(PARAMS), "wolne"].forEach(name => params.delete(name));
  if (PARAMS[browse.mode] && browse.label) params.set(PARAMS[browse.mode], browse.label);
  if (browse.mode === "free") params.set("wolne", "");
  const text = params.toString().replace(/wolne=(&|$)/, "wolne$1");
  return text ? `?${text}` : "";
}
