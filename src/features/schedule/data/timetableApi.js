import { supabase } from "../../../lib/supabaseClient";
import { normalizeTimetable } from "./normalizeTimetable";
import {
  getCachedTimetableById, getCachedTimetableOptions,
  isCachedTimetableStale, areCachedTimetableOptionsStale,
  storeTimetable, storeTimetableOptions,
  getCachedSharedTimetable, isSharedTimetableStale, storeSharedTimetable,
} from "./timetableCache";

export {
  getCachedTimetableById, getCachedTimetableOptions,
  isCachedTimetableStale, areCachedTimetableOptionsStale,
  TIMETABLE_REFRESH_INTERVAL_MS,
} from "./timetableCache";

const timetableRequests = new Map();
let optionsRequest = null;
let sharedRequest = null;

export async function loadAllTimetableOptions({ forceRefresh = false } = {}) {
  const cached = getCachedTimetableOptions();
  if (cached.length && !forceRefresh && !areCachedTimetableOptionsStale()) return cached;
  return supabase ? refreshOptions() : cached;
}

async function refreshOptions() {
  if (optionsRequest) return optionsRequest;
  if (!supabase) return getCachedTimetableOptions();
  optionsRequest = (async () => {
    try {
      const { data, error } = await supabase.from("faculties")
        .select("short_name,name").order("short_name", { ascending: true });
      if (error) throw error;
      const faculties = new Map();
      (data || []).forEach(row => {
        const id = String(row.short_name || "").trim();
        if (id && id.toLowerCase() !== "all") faculties.set(id, { id, name: String(row.name || "").trim() || id });
      });
      const options = [...faculties.values()].sort((a, b) => a.name.localeCompare(b.name, "pl"));
      // An empty response can mean RLS hides the rows. Do not retain it for 15 minutes.
      if (options.length) storeTimetableOptions(options);
      return options;
    } catch (error) {
      console.error("[timetables] Failed to load faculties from Supabase", error);
      const message = error?.code === "42501"
        ? "Brak uprawnień do odczytu listy harmonogramów. Skontaktuj się z administratorem."
        : ["42703", "42P01", "PGRST204", "PGRST205"].includes(error?.code)
          ? "Nie można odczytać listy harmonogramów: błąd konfiguracji źródła danych."
          : "Nie udało się pobrać listy harmonogramów. Spróbuj odświeżyć stronę.";
      throw Object.assign(new Error(message), { code: error?.code, cause: error });
    }
  })();
  try {
    return await optionsRequest;
  } finally {
    optionsRequest = null;
  }
}

export async function loadTimetableById(id, { forceRefresh = false } = {}) {
  const scheduleId = String(id || "").trim();
  if (!scheduleId || scheduleId.toLowerCase() === "all") return null;
  const cached = getCachedTimetableById(scheduleId);
  if (cached && !forceRefresh) {
    if (isCachedTimetableStale(scheduleId)) void refreshTimetable(scheduleId);
    return cached;
  }
  if (!supabase) return cached || normalizeTimetable(scheduleId, []);
  return refreshTimetable(scheduleId);
}

async function refreshTimetable(scheduleId) {
  if (timetableRequests.has(scheduleId)) return timetableRequests.get(scheduleId);
  if (!supabase) return getCachedTimetableById(scheduleId);
  const request = (async () => {
    try {
      const [rows] = await Promise.all([fetchEventRows(scheduleId), loadSharedTimetable()]);
      const timetable = normalizeTimetable(scheduleId, rows);
      storeTimetable(scheduleId, timetable);
      return getCachedTimetableById(scheduleId);
    } catch (error) {
      console.error(`[timetables] Failed to load timetable '${scheduleId}'`, error);
      return null;
    }
  })();
  timetableRequests.set(scheduleId, request);
  try {
    return await request;
  } finally {
    timetableRequests.delete(scheduleId);
  }
}

async function fetchEventRows(faculty) {
  const { data, error } = await supabase.from("events")
    .select("id,faculty,date,start_time,duration_min,subject,instructor,room,group,type,status")
    .eq("faculty", faculty)
    .or("status.is.null,status.eq.aktywne,status.eq.wolne")
    .order("date", { ascending: true }).order("start_time", { ascending: true });
  if (error) throw error;
  return data;
}

export async function loadSharedTimetable({ forceRefresh = false } = {}) {
  if (sharedRequest) return sharedRequest;
  if (!supabase || (!forceRefresh && !isSharedTimetableStale())) return getCachedSharedTimetable();
  sharedRequest = (async () => {
    const rows = await fetchEventRows("all");
    storeSharedTimetable(normalizeTimetable("all", rows));
    return getCachedSharedTimetable();
  })();
  try {
    return await sharedRequest;
  } finally {
    sharedRequest = null;
  }
}
