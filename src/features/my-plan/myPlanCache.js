const TTL_MS = 7 * 24 * 60 * 60 * 1000;

function cacheKey(scopeId, scheduleName, week) {
  return `wieikschedule.${scopeId}.added-events.${scheduleName}.${week}`;
}

export function readMyPlanCache(scopeId, scheduleName, week) {
  try {
    const entry = JSON.parse(localStorage.getItem(cacheKey(scopeId, scheduleName, week)));
    if (!entry?.savedAt || Date.now() - entry.savedAt > TTL_MS || !Array.isArray(entry.events)) return null;
    // Pending writes are not confirmed data, including entries left by older versions.
    return entry.events.filter(event => !event.__optimistic);
  } catch {
    return null;
  }
}

export function writeMyPlanCache(scopeId, scheduleName, week, events) {
  try {
    localStorage.setItem(cacheKey(scopeId, scheduleName, week), JSON.stringify({
      savedAt: Date.now(), events: events.filter(event => !event.__optimistic),
    }));
  } catch {
    // The calendar remains usable when browser storage is unavailable.
  }
}

export function removeMyPlanCache(scopeId, scheduleName, week) {
  try {
    localStorage.removeItem(cacheKey(scopeId, scheduleName, week));
  } catch {}
}
