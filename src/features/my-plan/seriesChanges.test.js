import { chooseMembers, resultsOf, seriesChanges, seriesMembers } from './seriesChanges';

const row = (id, date, extra = {}) => ({ id, faculty: 'EiAs3', date, start_time: '09:00:00', duration_min: 90, subject: 'MUD', room: 'A1',
  instructor: 'T', group: 'L1', status: 'aktywne', source_key: JSON.stringify(['stac', 's1', date, 'L1']), ...extra });
const rows = [row('a', '2026-11-03'), row('b', '2026-11-10'), row('c', '2026-11-17'), row('d', '2026-11-24', { status: 'wolne' }),
  row('x', '2026-11-10', { source_key: JSON.stringify(['stac', 's1', '2026-11-10', 'L2']), group: 'L2' })];

test('a series is the same university series and group, from this occurrence on or all of it', () => {
  const overrides = { b: { action: 'modify', patch: { room: 'B2' } } };
  const members = seriesMembers(rows, 'b', id => overrides[id]);
  // The day off and the other group's class are not part of it.
  expect(members.map(member => [member.row.id, member.override?.patch?.room ?? null])).toEqual([['a', null], ['b', 'B2'], ['c', null]]);
  expect(chooseMembers(members, 'b', 'following').map(member => member.row.id)).toEqual(['b', 'c']);
  expect(chooseMembers(members, 'b', 'all')).toHaveLength(3);
  expect(chooseMembers(members, 'b', 'one').map(member => member.row.id)).toEqual(['b']);
  expect(seriesMembers([{ ...rows[0], source_key: null }], 'a', () => null)).toEqual([]);
});

test('moving a series shifts each occurrence by the same days and keeps its own hours unless they were changed', () => {
  const members = seriesMembers(rows, 'a', id => (id === 'c' ? { action: 'modify', patch: { start_time: '12:00:00' } } : null));
  const current = { date: '2026-11-03', start_time: '09:00:00', duration_min: 90, room: 'A1', instructor: 'T' };
  const day = seriesChanges('move', members, { current, form: { date: '2026-11-04', start: '09:00', end: '10:30', instructor: 'T' } });
  expect(day).toEqual([
    { event_id: 'a', operation: 'upsert', action: 'modify', patch: { date: '2026-11-04' }, reason: null },
    { event_id: 'b', operation: 'upsert', action: 'modify', patch: { date: '2026-11-11' }, reason: null },
    { event_id: 'c', operation: 'upsert', action: 'modify', patch: { start_time: '12:00:00', date: '2026-11-18' }, reason: null }]);
  const later = seriesChanges('move', members, { current, form: { date: '2026-11-03', start: '11:00', end: '12:30', instructor: 'T' } });
  expect(later.map(change => change.patch)).toEqual([{ start_time: '11:00:00' }, { start_time: '11:00:00' }, { start_time: '11:00:00' }]);
  expect(resultsOf(later, members).map(result => [result.date, result.start, result.end]))
    .toEqual([['2026-11-03', '11:00', '12:30'], ['2026-11-10', '11:00', '12:30'], ['2026-11-17', '11:00', '12:30']]);
  // Back to the university time: the private change of c is simply removed.
  const back = seriesChanges('move', [members[2]], { current: { ...current, date: '2026-11-17', start_time: '12:00:00' },
    form: { date: '2026-11-17', start: '09:00', end: '10:30', instructor: 'T' } });
  expect(back).toEqual([{ event_id: 'c', operation: 'delete' }]);
});

test('room, cancel and restore apply to every chosen occurrence that needs it', () => {
  const overrides = { a: { action: 'cancel', patch: {} }, b: { action: 'modify', patch: { room: 'B2' } } };
  const members = seriesMembers(rows, 'a', id => overrides[id]);
  expect(seriesChanges('room', members, { form: { room: 'B2' } })).toEqual([
    { event_id: 'c', operation: 'upsert', action: 'modify', patch: { room: 'B2' }, reason: null }]);
  expect(seriesChanges('cancel', members, { reason: 'urlop' }).map(change => change.event_id)).toEqual(['b', 'c']);
  expect(seriesChanges('restore', members)).toEqual([{ event_id: 'a', operation: 'delete' }, { event_id: 'b', operation: 'delete' }]);
});
