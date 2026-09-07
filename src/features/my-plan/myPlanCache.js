const TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const MY_PLAN_REFRESH_INTERVAL_MS = 60 * 1000;

function cacheKey(scopeId, scheduleName, week) {
  return `wieikschedule.${scopeId}.added-events.${scheduleName}.${week}`;
}

export function readMyPlanCache(scopeId, scheduleName, week) {
  try {
    const entry = JSON.parse(localStorage.getItem(cacheKey(scopeId, scheduleName, week)));
    if (!entry || Date.now() - (entry.storedAt || entry.savedAt || 0) > TTL_MS || !Array.isArray(entry.events)) return null;
    // Pending writes are not confirmed data, including entries left by older versions.
    return entry.events.filter(event => !event.__optimistic);
  } catch {
    return null;
  }
}

export function isMyPlanCacheStale(scopeId, scheduleName, week) {
  try {
    const entry = JSON.parse(localStorage.getItem(cacheKey(scopeId, scheduleName, week)));
    return !entry?.savedAt || !Array.isArray(entry.events) || Date.now() - entry.savedAt >= MY_PLAN_REFRESH_INTERVAL_MS;
  } catch {
    return true;
  }
}

export function writeMyPlanCache(scopeId, scheduleName, week, events, { refreshed = true } = {}) {
  try {
    const previous = JSON.parse(localStorage.getItem(cacheKey(scopeId, scheduleName, week)));
    localStorage.setItem(cacheKey(scopeId, scheduleName, week), JSON.stringify({
      savedAt: refreshed ? Date.now() : previous?.savedAt || 0,
      storedAt: Date.now(), events: events.filter(event => !event.__optimistic),
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
