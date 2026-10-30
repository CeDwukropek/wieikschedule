// Last answers of the API kept on this device, so a start shows them at once and fresh data replaces them.
// Per account (or "guest"); anything unreadable counts as missing. Never a source of truth for edits.
const PREFIX = "wieikschedule.cache.";

export function readCache(name, account) {
  try {
    const entry = JSON.parse(localStorage.getItem(`${PREFIX}${name}.${account || "guest"}`));
    return entry && typeof entry === "object" && "data" in entry ? entry : null;
  } catch {
    return null;
  }
}

// An account's copies go when it signs out (a shared computer keeps nothing of it).
export function clearAccountCache(account) {
  try {
    for (let index = localStorage.length - 1; index >= 0; index -= 1) {
      const key = localStorage.key(index);
      if (key?.startsWith(PREFIX) && key.endsWith(`.${account}`)) localStorage.removeItem(key);
    }
  } catch { /* nothing stored */ }
}

export function writeCache(name, account, data, extra = {}) {
  try {
    localStorage.setItem(`${PREFIX}${name}.${account || "guest"}`, JSON.stringify({ ...extra, savedAt: Date.now(), data }));
  } catch {
    // Full or unavailable storage: the next start waits for the API.
  }
}
