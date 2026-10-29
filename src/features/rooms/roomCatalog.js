import defaultCatalog from "./defaultRoomCatalog.json";

// Rooms grouped into buildings. One format for the catalog bundled with the app and the one a CMS will serve
// (REACT_APP_ROOM_CATALOG_URL); see integrations/schedule-tools/ROOM_CATALOG.md.
//   buildings: [{ id, name, short, order, confirmed }]
//   rules:     [{ match (regular expression, case-insensitive), building }]  — the first match wins
//   rooms:     { KEY: { building?, label?, aliases?: [..], hidden?: true, seats?, notes? } } — KEY is the room in capitals
//   hidden:    [KEY]  — not rooms one can sit in (trainings, BHP)
export const FALLBACK_BUILDING = { id: "inne", name: "Inne", short: "Inne", order: 99, confirmed: false };
const CACHE_KEY = "wieikschedule.roomCatalog.v1";
const CACHE_MS = 24 * 60 * 60 * 1000;

// A catalog in the expected shape, with broken rules dropped; anything else is rejected.
export function readCatalog(value) {
  if (!value || value.version !== 1 || !Array.isArray(value.buildings)) return null;
  const buildings = value.buildings.filter(item => item && typeof item.id === "string" && typeof item.name === "string")
    .map(item => ({ short: item.name, order: 50, confirmed: false, ...item }));
  const known = new Set(buildings.map(item => item.id));
  const rules = (Array.isArray(value.rules) ? value.rules : []).flatMap(rule => {
    try { return known.has(rule.building) ? [{ test: new RegExp(rule.match, "i"), building: rule.building }] : []; }
    catch { return []; }
  });
  const rooms = value.rooms && typeof value.rooms === "object" ? value.rooms : {};
  const aliases = new Map();
  for (const [key, room] of Object.entries(rooms)) for (const alias of room?.aliases || []) aliases.set(String(alias).toUpperCase(), key.toUpperCase());
  return { source: value.source || "", buildings: [...buildings].sort((a, b) => a.order - b.order), rules, rooms,
    aliases, hidden: new Set([...(value.hidden || []), ...Object.entries(rooms).filter(([, room]) => room?.hidden).map(([key]) => key)]
      .map(key => String(key).toUpperCase())) };
}

export const DEFAULT_CATALOG = readCatalog(defaultCatalog);

// The room's key after the catalog's aliases ("H / C" and "H/C" may name one room).
export const catalogKey = (catalog, key) => catalog.aliases.get(key) || key;

// The building of a room: its own entry, else the first matching rule, else "Inne".
export function buildingOf(catalog, key) {
  const id = catalog.rooms[key]?.building || catalog.rules.find(rule => rule.test.test(key))?.building;
  return catalog.buildings.find(item => item.id === id) || catalog.buildings.find(item => item.id === FALLBACK_BUILDING.id) || FALLBACK_BUILDING;
}

// Rooms with their building, without hidden ones, in building order and then by name.
export function groupRooms(catalog, rooms) {
  const seen = new Map();
  for (const room of rooms) {
    const key = catalogKey(catalog, room.key);
    if (catalog.hidden.has(key) || seen.has(key)) continue;
    seen.set(key, { ...room, key, label: catalog.rooms[key]?.label || room.label, building: buildingOf(catalog, key) });
  }
  return [...seen.values()].sort((a, b) => a.building.order - b.building.order
    || a.label.localeCompare(b.label, "pl", { numeric: true }));
}

// The catalog from the CMS when one is configured (kept for a day), else the bundled one.
export async function loadRoomCatalog(url = process.env.REACT_APP_ROOM_CATALOG_URL) {
  if (!url) return DEFAULT_CATALOG;
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (cached?.url === url && Date.now() - cached.at < CACHE_MS && readCatalog(cached.catalog)) return readCatalog(cached.catalog);
  } catch { /* fetch again */ }
  try {
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    const raw = await response.json();
    const catalog = response.ok && readCatalog(raw);
    if (!catalog) return DEFAULT_CATALOG;
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ url, at: Date.now(), catalog: raw })); } catch { /* not cached */ }
    return catalog;
  } catch {
    return DEFAULT_CATALOG;
  }
}
