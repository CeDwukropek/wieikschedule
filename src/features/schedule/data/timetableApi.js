import { supabase } from "../../../lib/supabaseClient";
import { normalizeTimetable } from "./normalizeTimetable";
import {
  getCachedTimetableById, getCachedTimetableOptions, getCachedTimetableVersion,
  storeTimetable, storeTimetableOptions, touchTimetable,
  isCachedTimetableStale, areCachedTimetableOptionsStale,
} from "./timetableCache";

export {
  getCachedTimetableById, getCachedTimetableOptions,
  isCachedTimetableStale, areCachedTimetableOptionsStale,
  TIMETABLE_REFRESH_INTERVAL_MS,
} from "./timetableCache";

const PAGE_SIZE = 1000;
// Several plans checked together share one versions request.
const VERSIONS_REUSE_MS = 30 * 1000;
const timetableRequests = new Map();
let optionsRequest = null;
let versionsEntry = null;
let versionsRequest = null;

// One small row per plan, bumped by the database whenever its classes change.
async function loadVersions() {
  if (versionsEntry && Date.now() - versionsEntry.loadedAt < VERSIONS_REUSE_MS) return versionsEntry.versions;
  if (!versionsRequest) {
    versionsRequest = (async () => {
      try {
        const { data, error } = await supabase.from("timetable_versions").select("faculty,version");
        if (error) throw error;
        const versions = new Map((data || []).map(row => [String(row.faculty || "").trim(), Number(row.version)]));
        versionsEntry = { loadedAt: Date.now(), versions };
        return versions;
      } catch (error) {
        console.error("[timetables] Failed to load plan versions from Supabase", error);
        return null;
      } finally {
        versionsRequest = null;
      }
    })();
  }
  return versionsRequest;
}

// Classes for every plan ("all") are part of each plan's download.
function planVersion(versions, scheduleId) {
  return `${versions.get(scheduleId) || 0}:${versions.get("all") || 0}`;
}

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
    const versions = await loadVersions();
    if (!versions) return getCachedTimetableOptions();
    const options = [...versions.keys()].filter(id => id && id !== "all")
      .sort((a, b) => a.localeCompare(b, "pl")).map(id => ({ id, name: id }));
    storeTimetableOptions(options);
    return options;
  })();
  try {
    return await optionsRequest;
  } finally {
    optionsRequest = null;
  }
}

export async function loadTimetableById(id, { forceRefresh = false } = {}) {
  const scheduleId = String(id || "").trim();
  if (!scheduleId || scheduleId === "all") return null;
  const cached = getCachedTimetableById(scheduleId);
  if (cached && !forceRefresh) {
    if (isCachedTimetableStale(scheduleId)) void refreshTimetable(scheduleId);
    return cached;
  }
  // Missing configuration is a failed load, not a successfully loaded empty
  // timetable. A fabricated result has no cache entry and triggers reload loops.
  if (!supabase) return cached || null;
  return refreshTimetable(scheduleId);
}

async function refreshTimetable(scheduleId) {
  if (timetableRequests.has(scheduleId)) return timetableRequests.get(scheduleId);
  if (!supabase) return getCachedTimetableById(scheduleId);
  const request = (async () => {
    try {
      // The version is read before the rows, so a change during the download is fetched next time.
      const versions = await loadVersions();
      const version = versions ? planVersion(versions, scheduleId) : null;
      const cached = getCachedTimetableById(scheduleId);
      if (cached && version && getCachedTimetableVersion(scheduleId) === version) {
        touchTimetable(scheduleId);
        return cached;
      }
      // The API returns at most 1000 rows per request without an error, so a plan is read in pages.
      const rows = [];
      for (let from = 0; ; from += PAGE_SIZE) {
        const { data, error } = await supabase.from("events")
          .select("id,faculty,date,start_time,duration_min,subject,instructor,room,group,type,status")
          .in("faculty", [scheduleId, "all"])
          .or("status.is.null,status.eq.aktywne,status.eq.wolne")
          .order("date", { ascending: true }).order("start_time", { ascending: true }).order("id", { ascending: true })
          .range(from, from + PAGE_SIZE - 1);
        if (error) throw error;
        rows.push(...(data || []));
        if (!data || data.length < PAGE_SIZE) break;
      }
      const timetable = normalizeTimetable(scheduleId, rows);
      storeTimetable(scheduleId, timetable, version);
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
