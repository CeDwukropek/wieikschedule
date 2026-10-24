import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import WeekView from '../schedule/components/WeekView';
import { seriesMembers } from './seriesChanges';
import { seriesOf } from '../schedule/data/normalizeTimetable';
import { makeupCandidates } from '../plan-items/planItemEditing';

const monday = new Date(2026, 10, 2);
const key = date => JSON.stringify(['stac', 's1', date, 'Lk1']);
const row = (id, date, extra = {}) => ({ id, faculty: 'EiAs3', date, start_time: '09:00:00', duration_min: 90, subject: 'Fizyka', room: 'A1',
  instructor: 'T', group: 'Lk1', status: 'aktywne', source_key: key(date), ...extra });
const rows = [row('e1', '2026-11-03'), row('e2', '2026-11-10'), row('e3', '2026-11-17')];
const tile = { id: 'n-1', event_id: 'e1', day: 1, start: '09:00', end: '10:30', title: 'Fizyka', subj: 'FIZ', type: 'Laboratorium',
  room: 'A1', teacher: 'T', groups: ['Lk1'], dates: ['2026-11-03'], series: seriesOf(key('2026-11-03')) };
const quiz = (id, extra = {}) => ({ id, revision: 1, scope: 'group', faculty: 'EiAs3', subject: 'Fizyka', group: 'Lk1', kind: 'kolokwium',
  timing: 'class', event_id: 'e1', date: '2026-11-03', start_time: '09:00:00', duration_min: 90, title: 'Kolokwium 1', state: 'active',
  my_state: null, can_edit: false, anchor: { date: '2026-11-03' }, ...extra });

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
});
const planActions = (extra = {}) => ({ overrideFor: () => undefined, apply: jest.fn().mockResolvedValue({}), removeAdded: jest.fn(),
  startTimes: ['09:00', '12:00'], bounds: { min: '2026-10-01', max: '2027-02-01' }, conflictsFor: () => [],
  applyBatch: jest.fn().mockResolvedValue(), seriesFor: ev => seriesMembers(rows, ev.event_id, () => null), ...extra });
const open = () => fireEvent.click(screen.getByRole('button', { name: /Fizyka.*Pokaż szczegóły/ }));

test('a series of private changes: cancel this and the following ones at once', async () => {
  const actions = planActions();
  render(<WeekView events={[tile]} viewedWeekStart={monday} planActions={actions}/>);
  open();
  const scope = screen.getByRole('group', { name: 'Dotyczy' });
  expect(within(scope).getAllByRole('radio').map(radio => radio.parentElement.textContent))
    .toEqual(['Tylko te zajęcia', 'Te i następne (3)', 'Wszystkie w serii (3)']);
  fireEvent.click(within(scope).getByRole('radio', { name: /Te i następne/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Odwołaj u mnie (3)' }));
  await waitFor(() => expect(actions.applyBatch).toHaveBeenCalledWith(['e1', 'e2', 'e3'].map(event_id =>
    ({ event_id, operation: 'upsert', action: 'cancel', patch: {}, reason: null })), 'Odwołano 3 zajęcia w Twoim planie.'));
  expect(actions.apply).not.toHaveBeenCalled();
});

test('moving a series shifts every class and names the dates with collisions', async () => {
  const actions = planActions({ conflictsFor: (id, { date }) => (date === '2026-11-11' ? [{ title: 'Analiza', start: '09:00', end: '10:30' }] : []) });
  render(<WeekView events={[tile]} viewedWeekStart={monday} planActions={actions}/>);
  open();
  fireEvent.click(screen.getByRole('button', { name: 'Przenieś' }));
  fireEvent.click(screen.getByRole('radio', { name: /Wszystkie w serii/ }));
  fireEvent.change(screen.getByLabelText('Data'), { target: { value: '2026-11-04' } });
  expect(screen.getByRole('status')).toHaveTextContent('Kolizje w 1 terminie: śr 11.11');
  fireEvent.click(screen.getByRole('button', { name: 'Zapisz (3)' }));
  await waitFor(() => expect(actions.applyBatch).toHaveBeenCalled());
  expect(actions.applyBatch.mock.calls[0][0].map(change => [change.event_id, change.patch.date]))
    .toEqual([['e1', '2026-11-04'], ['e2', '2026-11-11'], ['e3', '2026-11-18']]);
});

test('a class with a kolokwium warns before a private change and offers makeup at other groups', async () => {
  const makeUp = jest.fn().mockResolvedValue();
  const other = quiz('q2', { group: 'Lk2', event_id: 'o1', date: '2026-11-05', start_time: '12:00:00' });
  const items = [quiz('q1'), other, quiz('far', { group: 'Lk3', event_id: 'o2', date: '2026-11-20' }),
    quiz('report', { group: 'Lk2', kind: 'sprawozdanie', event_id: 'o3', date: '2026-11-06' })];
  const itemActions = { roles: [], items, scheduleId: 'EiAs3', planEvents: [tile], today: '2026-11-02', subjectsFor: () => [] };
  const actions = planActions({ overrideFor: id => (id === 'e1' ? { action: 'cancel', patch: {} } : undefined), makeUp });
  render(<WeekView events={[{ ...tile, ghost: 'cancelled' }]} viewedWeekStart={monday} planActions={actions} itemActions={itemActions}/>);
  open();
  expect(screen.getByRole('note')).toHaveTextContent('Na tych zajęciach Twoja grupa ma: Kolokwium 1');
  const makeup = screen.getByRole('region', { name: 'Odrobienie u innej grupy' });
  // Only the same kind of the same subject, at another group, within 14 days.
  expect(within(makeup).getAllByRole('listitem')).toHaveLength(1);
  expect(makeup).toHaveTextContent('Grupa Lk2');
  fireEvent.click(within(makeup).getByRole('button', { name: 'Wpisz mi jako odrobienie' }));
  await waitFor(() => expect(makeUp).toHaveBeenCalledWith(items[0], other));
  expect(makeupCandidates(items, items[0]).map(item => item.id)).toEqual(['q2']);
});
