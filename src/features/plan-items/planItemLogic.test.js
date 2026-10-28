import { countdown, describeItemTime, filterItems, itemsWindow, placeItems, reviewNotice, upcomingItems, visibleItems, weekendWeeks } from './planItemLogic';
import { buildICS } from '../schedule/export/exportICS';

const monday = new Date(2026, 9, 19);
const lab = { id: 1, event_id: 'lab-a', day: 0, start: '07:30', end: '09:00', title: 'Modelowanie', groups: ['Lk1'], dates: ['2026-10-19'] };
const lecture = { id: 2, event_id: 'lecture-a', day: 1, start: '08:00', end: '09:30', title: 'Fizyka', groups: [], appliesToAllGroups: true, dates: ['2026-10-20'] };
const external = { id: 3, event_id: 'ext-a', day: 2, start: '10:00', end: '11:30', title: 'Sieci', groups: ['C2'], dates: ['2026-10-21'], _sourceScheduleId: 'EiAs5' };
const entry = (id, extra = {}) => ({ id, scope: 'group', faculty: 'EiAs3', subject: 'Modelowanie', group: 'Lk1', kind: 'kolokwium',
  timing: 'class', event_id: 'lab-a', date: '2026-10-19', start_time: '07:30:00', duration_min: 90, due_time: null, title: `Wpis ${id}`,
  state: 'active', revision: 1, my_state: null, ...extra });

test('a group entry shows only to people whose plan has that class, subject or group', () => {
  const items = [entry('class'), entry('other-group', { timing: 'due', event_id: null, group: 'Lk2' }),
    entry('lecture', { subject: 'Fizyka', group: 'W', timing: 'slot', event_id: null }),
    entry('every-group', { group: null, timing: 'slot', event_id: null }),
    entry('foreign-subject', { group: null, subject: 'Chemia', timing: 'due', event_id: null }),
    entry('external', { faculty: 'EiAs5', subject: 'Sieci', group: 'C2', timing: 'due', event_id: null }),
    entry('mine', { scope: 'personal', group: null, subject: null, timing: 'due', event_id: null }),
    entry('hidden', { my_state: { hidden: true, progress: 'todo' } })];
  const shown = visibleItems(items, [lab, lecture, external], { scheduleId: 'EiAs3' }).map(item => item.id);
  expect(shown).toEqual(['class', 'lecture', 'every-group', 'external', 'mine']);
  expect(visibleItems(items, [lab], { scheduleId: 'EiAs3', showAll: true }).map(item => item.id))
    .toEqual(['class', 'other-group', 'lecture', 'every-group', 'foreign-subject', 'mine']);
  const hiddenElsewhere = entry('hidden-other-group', { group: 'Lk2', timing: 'due', event_id: null, my_state: { hidden: true } });
  expect(visibleItems([...items, hiddenElsewhere], [lab], { scheduleId: 'EiAs3', hidden: true }).map(item => item.id)).toEqual(['hidden']);
});

test("another group's entry stays hidden although the subject's lecture is in the plan", () => {
  const modelowanieLecture = { ...lecture, id: 4, event_id: 'lecture-m', title: 'Modelowanie' };
  const items = [entry('own-group', { group: 'Lk1', timing: 'due', event_id: null }),
    entry('other-group', { group: 'Lk2', timing: 'due', event_id: null }),
    entry('whole-year', { group: 'W', timing: 'due', event_id: null })];
  const shown = ids => visibleItems(items, ids, { scheduleId: 'EiAs3' }).map(item => item.id);
  expect(shown([lab, modelowanieLecture])).toEqual(['own-group', 'whole-year']);
  expect(shown([modelowanieLecture])).toEqual(['whole-year']);
  expect(visibleItems(items, [modelowanieLecture], { scheduleId: 'EiAs3', showAll: true }).map(item => item.id))
    .toEqual(['own-group', 'other-group', 'whole-year']);
});

test('entries sit on their class, as blocks at their own time or in the strip under the dates', () => {
  const items = [entry('on-class'), entry('slot', { timing: 'slot', event_id: null, date: '2026-10-24', start_time: '09:00:00', duration_min: 120 }),
    entry('due', { timing: 'due', event_id: null, start_time: null, duration_min: null, due_time: '23:59:00', date: '2026-10-21' }),
    entry('next-week', { timing: 'due', event_id: null, date: '2026-10-26' })];
  const placed = placeItems(items, monday, [lab, lecture]);
  expect(placed.events.find(ev => ev.event_id === 'lab-a').entries.map(item => item.id)).toEqual(['on-class']);
  const block = placed.events.find(ev => ev.planItem);
  expect([block.planItem.id, block.day, block.start, block.end]).toEqual(['slot', 5, '09:00', '11:00']);
  expect(placed.strip).toEqual({ 2: [items[2]] });
  // The class moved privately: the group's term stays where it was, as a block.
  const moved = placeItems([entry('on-class')], monday, [{ ...lab, start: '12:00', personal_override: true }]);
  expect(moved.events.find(ev => ev.planItem).planItem.id).toBe('on-class');
  expect(moved.events.find(ev => ev.event_id === 'lab-a').entries).toBeUndefined();
});

test('weeks with weekend classes or entries are known in advance', () => {
  const saturday = { ...lab, day: 5, dates: ['2026-10-24', '2026-11-07'] };
  const holiday = { ...lab, day: 5, status: 'wolne', dates: ['2026-10-31'] };
  expect([...weekendWeeks([lab, saturday, holiday], [entry('x', { date: '2026-11-15' })])].sort())
    .toEqual(['2026-10-19', '2026-11-02', '2026-11-09']);
});

test('upcoming lists the next two weeks; missed deadlines are kept until done', () => {
  const today = new Date(2026, 9, 21);
  const items = [entry('soon', { date: '2026-10-22' }), entry('late', { date: '2026-11-10' }),
    entry('missed', { timing: 'due', date: '2026-10-20' }), entry('missed-done', { timing: 'due', date: '2026-10-19', my_state: { progress: 'done' } }),
    entry('past-quiz', { date: '2026-10-20' })];
  const { upcoming, overdue } = upcomingItems(items, today);
  expect(upcoming.map(item => item.id)).toEqual(['soon']);
  expect(overdue.map(item => item.id)).toEqual(['missed']);
  expect([countdown('2026-10-21', today), countdown('2026-10-22', today), countdown('2026-10-25', today), countdown('2026-10-19', today)])
    .toEqual(['dziś', 'jutro', 'za 4 dni', '2 dni temu']);
  expect(itemsWindow(today)).toEqual({ from: '2026-08-19', to: '2027-03-06' });
});

test('times, reviews and the calendar file describe entries plainly', () => {
  expect(describeItemTime(entry('a'))).toMatch(/07:30–09:00$/);
  expect(describeItemTime(entry('b', { timing: 'due', due_time: null }))).toMatch(/cały dzień$/);
  expect(reviewNotice(entry('c', { state: 'review', review_reason: 'moved', anchor: { date: '2026-10-12', start_time: '10:15:00' } })))
    .toMatch(/przeniosła.*Wcześniej: 12\.10 10:15\./);
  expect(reviewNotice(entry('d'))).toBe('');
  const ics = buildICS([], [entry('a'), entry('b', { timing: 'due', due_time: null, details: 'Rozdziały 1, 2' }),
    entry('c', { timing: 'due', due_time: '23:59:00' })]);
  expect(ics).toContain('UID:item-a@wieikschedule\r\nSUMMARY:Kolokwium: Wpis a');
  expect(ics).toContain('DTSTART:20261019T073000\r\nDTEND:20261019T090000');
  expect(ics).toContain('DTSTART;VALUE=DATE:20261019\r\nDTEND;VALUE=DATE:20261020');
  expect(ics).toContain('DESCRIPTION:Modelowanie\\nGrupa Lk1\\nRozdziały 1\\, 2');
  expect(ics).toMatch(/UID:item-c@wieikschedule[^]*DTSTART:20261019T235900\r\nEND:VEVENT/);
});

test('the "Pokaż terminy" setting keeps the chosen audience and kinds', () => {
  const items = [entry('quiz'), entry('mine', { scope: 'personal' }), entry('report', { kind: 'sprawozdanie' })];
  expect(filterItems(items).map(item => item.id)).toEqual(['quiz', 'mine', 'report']);
  expect(filterItems(items, { scope: 'group', hiddenKinds: ['sprawozdanie'] }).map(item => item.id)).toEqual(['quiz']);
  expect(filterItems(items, { scope: 'personal' }).map(item => item.id)).toEqual(['mine']);
});
