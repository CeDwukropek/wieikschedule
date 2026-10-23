import { canWriteGroup, classTerms, editItems, laterTerms, newItems, seriesOf, slotTerm, subjectsOf, termError, withRevisions,
  writableGroups } from './planItemEditing';

const lab = (id, date, extra = {}) => ({ id, event_id: `ev-${id}`, day: 0, start: '07:30', end: '09:00', title: 'Modelowanie',
  type: 'Laboratorium', groups: ['Lk1'], dates: [date], status: 'aktywne', ...extra });
const plan = [lab(1, '2026-10-19'), lab(2, '2026-10-26'), lab(3, '2026-11-02', { start: '09:15', end: '10:45' }),
  lab(4, '2026-11-09', { status: 'wolne' }), lab(5, '2026-10-26', { groups: ['Lk2'] }), lab(6, '2026-11-16')];
const entry = (id, extra = {}) => ({ id, revision: 1, scope: 'group', faculty: 'EiAs3', subject: 'Modelowanie', group: 'Lk1',
  kind: 'kolokwium', timing: 'class', event_id: 'ev-1', date: '2026-10-19', start_time: '07:30:00', duration_min: 90, due_time: null,
  title: 'Kolokwium', details: null, series_id: null, ...extra });

test('roles decide which groups one may write for', () => {
  const roles = [{ role: 'group_starosta', faculty: 'EiAs3', group: 'Lk4' }];
  expect(canWriteGroup(roles, 'EiAs3', 'Lk4')).toBe(true);
  expect(canWriteGroup(roles, 'EiAs3', 'Lk1')).toBe(false);
  expect(canWriteGroup(roles, 'EiAs3', null)).toBe(false);
  expect(writableGroups(roles, 'EiAs3', ['Lk1', 'Lk4'])).toEqual(['Lk4']);
  expect(writableGroups([{ role: 'starosta', faculty: 'EiAs3' }], 'EiAs3', ['Lk1'])).toEqual([null, 'Lk1']);
  expect(writableGroups([{ role: 'admin' }], 'IwIKs5', ['C1'])).toEqual([null, 'C1']);
});

test('suggestions are the group’s next classes, or one and two weeks later', () => {
  const terms = classTerms(plan, plan[0], { scheduleId: 'EiAs3', from: '2026-10-19' });
  // A day off and another group's class are not suggested; the start follows each occurrence.
  expect(terms.map(term => [term.event_id, term.date, term.start])).toEqual([
    ['ev-1', '2026-10-19', '07:30'], ['ev-2', '2026-10-26', '07:30'], ['ev-3', '2026-11-02', '09:15'], ['ev-6', '2026-11-16', '07:30']]);
  const slot = slotTerm('2026-10-24', 9 * 60, 9 * 60);
  expect([slot.start, slot.end]).toEqual(['09:00', '10:30']);
  expect(laterTerms(slot).map(term => term.date)).toEqual(['2026-10-31', '2026-11-07']);
  expect(subjectsOf(plan)).toEqual([{ subject: 'Modelowanie', groups: ['Lk1', 'Lk2'] }]);
});

test('new entries carry the form and their own term', () => {
  const form = { scope: 'group', faculty: 'EiAs3', kind: 'sprawozdanie', title: ' ', details: 'Ćw. 3', subject: 'Modelowanie', group: 'Lk1' };
  expect(newItems(form, [{ timing: 'class', event_id: 'ev-1' }, { timing: 'due', date: '2026-10-28', due_time: '23:59' }])).toEqual([
    { scope: 'group', faculty: 'EiAs3', kind: 'sprawozdanie', title: 'Sprawozdanie', details: 'Ćw. 3', timing: 'class', event_id: 'ev-1' },
    { scope: 'group', faculty: 'EiAs3', kind: 'sprawozdanie', title: 'Sprawozdanie', details: 'Ćw. 3', subject: 'Modelowanie', group: 'Lk1',
      timing: 'due', date: '2026-10-28', due_time: '23:59', start_time: null, duration_min: null }]);
  expect(termError({ timing: 'slot', date: '2026-10-24', start: '21:00', end: '22:30' })).toMatch(/22:00/);
  expect(termError({ timing: 'slot', date: '2026-10-24', start: '10:00', end: '09:00' })).toMatch(/po początku/);
});

test('a series edit moves every chosen entry by the same days and undo writes back what was there', () => {
  const series = [entry('a', { series_id: 's' }), entry('b', { series_id: 's', event_id: 'ev-2', date: '2026-10-26' }),
    entry('c', { series_id: 's', timing: 'slot', event_id: null, date: '2026-11-02', start_time: '12:00:00', duration_min: 60 })];
  expect(seriesOf(series, series[1], 'following').map(item => item.id)).toEqual(['b', 'c']);
  expect(seriesOf(series, series[1], 'one').map(item => item.id)).toEqual(['b']);
  const form = { scope: 'group', kind: 'kolokwium', title: 'Kolokwium 1', details: '', subject: 'Modelowanie', group: 'Lk1' };
  // The second entry moves a week later, to the next class; the third follows by a week at its own hours.
  const { changes, undo } = editItems(series[1], seriesOf(series, series[1], 'following'), form,
    { timing: 'class', event_id: 'ev-3', date: '2026-11-02', start: '09:15', end: '10:45' }, { planEvents: plan, scheduleId: 'EiAs3' });
  expect(changes).toEqual([
    { id: 'b', revision: 1, title: 'Kolokwium 1', timing: 'class', event_id: 'ev-3' },
    { id: 'c', revision: 1, title: 'Kolokwium 1', timing: 'slot', date: '2026-11-09', start_time: '12:00', duration_min: 60, due_time: null }]);
  // Hours changed by hand on an entry with its own hours carry over to the rest of the series.
  const own = editItems(series[2], [series[2], { ...series[2], id: 'd', date: '2026-11-09' }], form,
    { timing: 'slot', date: '2026-11-02', start: '13:00', end: '14:30' }, { planEvents: plan, scheduleId: 'EiAs3' });
  expect(own.changes.map(change => [change.id, change.date, change.start_time, change.duration_min]))
    .toEqual([['c', '2026-11-02', '13:00', 90], ['d', '2026-11-09', '13:00', 90]]);
  expect(withRevisions(undo, [{ id: 'b', revision: 2 }, { id: 'c', revision: 2 }])).toEqual([
    { id: 'b', revision: 2, title: 'Kolokwium', timing: 'class', event_id: 'ev-2' },
    { id: 'c', revision: 2, title: 'Kolokwium', timing: 'slot', date: '2026-11-02', start_time: '12:00:00', duration_min: 60, due_time: null }]);
  // No class of the group on the shifted day: nothing is written.
  expect(editItems(series[0], series.slice(0, 2), form, { timing: 'class', event_id: 'ev-3', date: '2026-11-02', start: '09:15', end: '10:45' },
    { planEvents: plan, scheduleId: 'EiAs3' }).error).toMatch(/przesuń ten termin osobno/);
  // Text only: entries keep their terms.
  expect(editItems(series[0], series, { ...form, title: 'Kolokwium', details: 'Rozdz. 1' }, { timing: 'class', event_id: 'ev-1', date: '2026-10-19', start: '07:30', end: '09:00' },
    { planEvents: plan, scheduleId: 'EiAs3' }).changes.map(change => Object.keys(change))).toEqual([['id', 'revision', 'details'], ['id', 'revision', 'details'], ['id', 'revision', 'details']]);
});
