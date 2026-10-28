import { supabase } from "../../lib/supabaseClient";
import { buildDirectory } from "./browseLogic";

const PAGE_SIZE = 1000;
const FIELDS = "id,faculty,date,start_time,duration_min,subject,instructor,room,group,type,status";
// Classes change once a night (the import); a week read in this session is reused for a while.
const WEEK_REUSE_MS = 10 * 60 * 1000;
const DIRECTORY_KEY = "wieikschedule.browseDirectory.v1";
const DIRECTORY_REUSE_MS = 12 * 60 * 60 * 1000;
const weeks = new Map();
let directoryRequest = null;

// The API returns at most 1000 rows per request without an error, so results are read in pages.
async function readPages(build) {
  const rows = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await build().range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < PAGE_SIZE) return rows;
  }
}

const plusDays = (iso, days) => {
  const date = new Date(`${iso}T12:00:00`);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

// Every plan's classes in the week starting on monday (ISO date), without days off.
export function loadWeekAcrossPlans(monday) {
  const cached = weeks.get(monday);
  if (cached && Date.now() - cached.at < WEEK_REUSE_MS) return cached.request;
  if (!supabase) return Promise.reject(new Error("Plan jest chwilowo niedostępny."));
  const request = readPages(() => supabase.from("events").select(FIELDS)
    .gte("date", monday).lte("date", plusDays(monday, 6))
    .or("status.is.null,status.eq.aktywne")
    .order("date").order("start_time").order("id"));
  weeks.set(monday, { at: Date.now(), request });
  request.catch(() => weeks.delete(monday));
  return request;
}

function readStoredDirectory() {
  try {
    const stored = JSON.parse(localStorage.getItem(DIRECTORY_KEY));
    return stored && Date.now() - stored.at < DIRECTORY_REUSE_MS ? stored.directory : null;
  } catch { return null; }
}

// Instructors and rooms of all plans for the search; kept on the device for half a day.
export function loadDirectory() {
  const stored = readStoredDirectory();
  if (stored) return Promise.resolve(stored);
  if (!supabase) return Promise.reject(new Error("Lista prowadzących i sal jest chwilowo niedostępna."));
  if (!directoryRequest) {
    directoryRequest = readPages(() => supabase.from("events").select("instructor,room")
      .or("status.is.null,status.eq.aktywne").order("id"))
      .then(rows => {
        const directory = buildDirectory(rows);
        try { localStorage.setItem(DIRECTORY_KEY, JSON.stringify({ at: Date.now(), directory })); } catch { /* read again next time */ }
        return directory;
      })
      .finally(() => { directoryRequest = null; });
  }
  return directoryRequest;
}
