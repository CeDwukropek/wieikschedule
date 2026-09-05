import { supabase } from "../../../lib/supabaseClient";
import { normalizeTimetable } from "./normalizeTimetable";
import {
  getCachedTimetableById, getCachedTimetableOptions,
  isCachedTimetableStale, areCachedTimetableOptionsStale,
  storeTimetable, storeTimetableOptions,
} from "./timetableCache";

export {
  getCachedTimetableById, getCachedTimetableOptions,
  isCachedTimetableStale, areCachedTimetableOptionsStale,
  TIMETABLE_REFRESH_INTERVAL_MS,
} from "./timetableCache";

const timetableRequests = new Map();
let optionsRequest = null;

export async function loadAllTimetableOptions({ forceRefresh = false } = {}) {
  const cached = getCachedTimetableOptions();
  if (cached.length && !forceRefresh) {
    if (areCachedTimetableOptionsStale()) void refreshOptions();
    return cached;
  }
  return supabase ? refreshOptions() : cached;
}

async function refreshOptions() {
  if (optionsRequest) return optionsRequest;
  if (!supabase) return getCachedTimetableOptions();
  optionsRequest = (async () => {
    try {
      const faculties = new Set();
      const pageSize = 1000;
      for (let from = 0; ; from += pageSize) {
        const { data, error } = await supabase.from("events").select("faculty")
          .order("faculty", { ascending: true }).range(from, from + pageSize - 1);
        if (error) throw error;
        (data || []).forEach(row => {
          const faculty = String(row.faculty || "").trim();
          if (faculty) faculties.add(faculty);
        });
        if (!data || data.length < pageSize) break;
      }
      const options = [...faculties].sort((a, b) => a.localeCompare(b, "pl"))
        .map(id => ({ id, name: id }));
      storeTimetableOptions(options);
      return options;
    } catch (error) {
      console.error("[timetables] Failed to load faculties from Supabase", error);
      return getCachedTimetableOptions();
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
  if (!scheduleId) return null;
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
      const { data, error } = await supabase.from("events")
        .select("id,faculty,date,start_time,duration_min,subject,instructor,room,group,type,status")
        .eq("faculty", scheduleId).or("status.is.null,status.eq.aktywne")
        .order("date", { ascending: true }).order("start_time", { ascending: true });
      if (error) throw error;
      const timetable = normalizeTimetable(scheduleId, data);
      storeTimetable(scheduleId, timetable);
      return timetable;
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
