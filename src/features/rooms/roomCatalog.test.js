import { DEFAULT_CATALOG, buildingOf, catalogKey, groupRooms, loadRoomCatalog, readCatalog } from './roomCatalog';

const catalog = readCatalog({
  version: 1,
  buildings: [{ id: 'main', name: 'Budynek główny', short: 'Gł.', order: 1, confirmed: true }, { id: 'inne', name: 'Inne', order: 9 }],
  rules: [{ match: '^\\d', building: 'main' }, { match: '(', building: 'main' }, { match: '^X', building: 'unknown' }],
  rooms: { 'H/C': { building: 'main', aliases: ['H C'], label: 'Hala C' }, '12': { hidden: true } },
  hidden: ['BHP'],
});

test('a room belongs to its own building, else to the first matching rule, else to "Inne"', () => {
  expect(buildingOf(catalog, 'H/C').id).toBe('main');
  expect(buildingOf(catalog, '208B').id).toBe('main');
  expect(buildingOf(catalog, 'WA2').id).toBe('inne');
  // A broken expression and a rule for an unknown building are dropped.
  expect(catalog.rules).toHaveLength(1);
  expect(catalogKey(catalog, 'H C')).toBe('H/C');
});

test('rooms are grouped in building order without hidden ones; aliases become one room', () => {
  const rooms = groupRooms(catalog, [{ key: 'WA2', label: 'WA2' }, { key: '208B', label: '208B' }, { key: 'H C', label: 'H C' },
    { key: 'H/C', label: 'H/C' }, { key: '12', label: '12' }, { key: 'BHP', label: 'BHP' }]);
  expect(rooms.map(room => [room.label, room.building.id])).toEqual([['208B', 'main'], ['Hala C', 'main'], ['WA2', 'inne']]);
});

test('the bundled catalog sorts the known rooms into preliminary groups', () => {
  expect(['A3', '139SJO', 'F101', 'WA203', '208G', 'LZT b10-14'].map(key => buildingOf(DEFAULT_CATALOG, key.toUpperCase()).id))
    .toEqual(['aule', 'sjo', 'f', 'wa', 'numerowane', 'inne']);
  expect(DEFAULT_CATALOG.buildings.every(item => item.confirmed === false)).toBe(true);
});

test('a catalog from the CMS is used when valid, the bundled one otherwise', async () => {
  global.fetch = jest.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ version: 1, buildings: [{ id: 'b', name: 'B' }], rules: [] }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ version: 2 }) });
  localStorage.clear();
  expect((await loadRoomCatalog('https://cms.test/rooms.json')).buildings.map(item => item.id)).toEqual(['b']);
  expect(await loadRoomCatalog('https://cms.test/rooms.json')).not.toBe(DEFAULT_CATALOG); // cached for a day
  localStorage.clear();
  expect(await loadRoomCatalog('https://cms.test/other.json')).toBe(DEFAULT_CATALOG);
  expect(await loadRoomCatalog('')).toBe(DEFAULT_CATALOG);
});
