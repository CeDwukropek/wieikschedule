import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import WeekView from '../schedule/components/WeekView';
import PlanItemDialog from './PlanItemDialog';
import { placeItems } from './planItemLogic';

const monday = new Date(2026, 9, 19);
const lab = (n, date, extra = {}) => ({ id: `n-${n}`, event_id: `ev-${n}`, day: 0, start: '07:30', end: '09:00', title: 'Modelowanie', subj: 'MUD',
  type: 'Laboratorium', room: 'A-101', groups: ['Lk1'], dates: [date], status: 'aktywne', ...extra });
const plan = [lab(1, '2026-10-19'), lab(2, '2026-10-26'), lab(3, '2026-11-02'), lab(4, '2026-10-20', { day: 1, groups: ['Lk2'], start: '12:00', end: '13:30' })];
const entry = (id, extra = {}) => ({ id, revision: 1, scope: 'group', faculty: 'EiAs3', subject: 'Modelowanie', group: 'Lk1', kind: 'kolokwium',
  timing: 'class', event_id: 'ev-1', date: '2026-10-19', start_time: '07:30:00', duration_min: 90, due_time: null, title: 'Kolokwium 1',
  details: null, series_id: null, state: 'active', my_state: null, can_edit: true, ...extra });
const actions = (extra = {}) => ({ roles: [{ role: 'group_starosta', faculty: 'EiAs3', group: 'Lk1' }], items: [], scheduleId: 'EiAs3',
  planEvents: plan, today: '2026-10-19', subjectsFor: () => [{ subject: 'Fizyka', groups: ['Lk1', 'Lk2'] }, { subject: 'Modelowanie', groups: ['Lk1', 'Lk2'] }],
  create: jest.fn().mockResolvedValue(), update: jest.fn().mockResolvedValue(), remove: jest.fn().mockResolvedValue(), ...extra });

beforeAll(() => {
  // jsdom has no PointerEvent; without it the test events would lose their coordinates.
  if (!window.PointerEvent) window.PointerEvent = class extends MouseEvent {
    constructor(type, init = {}) { super(type, init); this.pointerType = init.pointerType || 'mouse'; this.pointerId = init.pointerId ?? 1; }
  };
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
});

test('a starosta adds a kolokwium on this and the next class from the class dialog', async () => {
  const itemActions = actions();
  render(<WeekView events={placeItems([], monday, [plan[0]]).events} viewedWeekStart={monday} itemActions={itemActions}/>);
  fireEvent.click(screen.getByRole('button', { name: /Modelowanie.*Pokaż szczegóły/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Dodaj kolokwium lub termin' }));
  const form = screen.getByRole('form', { name: 'Nowy termin' });
  expect(within(form).getByRole('radio', { name: 'Grupa Lk1' })).toBeChecked();
  // The group's next classes; the class clicked is chosen already.
  const next = within(form).getByRole('list', { name: 'Najbliższe zajęcia grupy' });
  expect(within(next).getAllByRole('checkbox').map(box => box.checked)).toEqual([true, false, false]);
  fireEvent.click(within(next).getAllByRole('checkbox')[1]);
  fireEvent.change(within(form).getByLabelText('Zakres materiału (opcjonalnie)'), { target: { value: 'Rozdziały 1–3' } });
  fireEvent.click(within(form).getByRole('button', { name: 'Dodaj 2 terminy' }));
  await waitFor(() => expect(itemActions.create).toHaveBeenCalledWith([
    { scope: 'group', faculty: 'EiAs3', kind: 'kolokwium', title: 'Kolokwium', details: 'Rozdziały 1–3', timing: 'class', event_id: 'ev-1' },
    { scope: 'group', faculty: 'EiAs3', kind: 'kolokwium', title: 'Kolokwium', details: 'Rozdziały 1–3', timing: 'class', event_id: 'ev-2' }]));
  // Back to the class details once saved.
  expect(await screen.findByRole('button', { name: 'Dodaj kolokwium lub termin' })).toBeInTheDocument();
});

test('a free slot asks for the subject, offers a week later and only the groups one may write for', async () => {
  const itemActions = actions();
  const term = { key: 'slot', timing: 'slot', date: '2026-10-24', start: '09:00', end: '10:30' };
  render(<PlanItemDialog draft={{ term, faculty: 'EiAs3' }} actions={itemActions} onClose={() => {}}/>);
  const form = screen.getByRole('form', { name: 'Nowy termin' });
  expect(within(form).getByRole('button', { name: 'Dodaj' })).toBeDisabled();
  fireEvent.change(within(form).getByLabelText('Przedmiot'), { target: { value: 'Fizyka' } });
  expect(within(form).getAllByRole('option', { name: /^Lk/ }).map(option => option.textContent)).toEqual(['Lk1']);
  fireEvent.click(within(form).getByRole('checkbox', { name: /31\.10/ }));
  fireEvent.click(within(form).getByRole('button', { name: 'Kolejny termin' }));
  fireEvent.change(within(form).getAllByLabelText('Rodzaj terminu')[1], { target: { value: 'due' } });
  fireEvent.click(within(form).getByRole('button', { name: 'Dodaj 3 terminy' }));
  await waitFor(() => expect(itemActions.create).toHaveBeenCalled());
  const items = itemActions.create.mock.calls[0][0];
  expect(items.map(item => [item.subject, item.group, item.timing, item.date, item.start_time ?? item.due_time])).toEqual([
    ['Fizyka', 'Lk1', 'slot', '2026-10-31', '09:00'], ['Fizyka', 'Lk1', 'slot', '2026-10-24', '09:00'], ['Fizyka', 'Lk1', 'due', '2026-11-07', null]]);
});

test('students without a role add private entries; a click on free time opens a 90-minute slot', () => {
  const onCreateAt = jest.fn();
  const { container } = render(<WeekView events={[]} viewedWeekStart={monday} onCreateAt={onCreateAt}/>);
  const tuesday = container.querySelectorAll('.week-events-overlay')[1];
  tuesday.getBoundingClientRect = () => ({ top: 0, height: 900, left: 0, width: 100 });
  // 900 px for 15 hours: 120 px is 9:00.
  fireEvent.pointerDown(tuesday, { clientY: 120, pointerType: 'mouse', button: 0, pointerId: 1 });
  fireEvent.pointerUp(tuesday, { clientY: 120, pointerType: 'mouse', pointerId: 1 });
  expect(onCreateAt).toHaveBeenLastCalledWith(expect.objectContaining({ date: '2026-10-20', start: '09:00', end: '10:30' }));
  fireEvent.pointerDown(tuesday, { clientY: 120, pointerType: 'mouse', button: 0, pointerId: 1 });
  fireEvent.pointerMove(tuesday, { clientY: 239, pointerType: 'mouse', pointerId: 1 });
  fireEvent.pointerUp(tuesday, { clientY: 239, pointerType: 'mouse', pointerId: 1 });
  expect(onCreateAt).toHaveBeenLastCalledWith(expect.objectContaining({ start: '09:00', end: '11:00' }));

  render(<PlanItemDialog draft={{ term: { key: 's', timing: 'slot', date: '2026-10-20', start: '09:00', end: '10:30' }, faculty: 'EiAs3' }}
    actions={actions({ roles: [] })} onClose={() => {}}/>);
  expect(screen.queryByRole('radio', { name: 'Dla grupy' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Dodaj' })).toBeEnabled();
});

test('an entry of a series is edited or removed with the following ones', async () => {
  const series = [entry('a', { series_id: 's' }), entry('b', { series_id: 's', event_id: 'ev-2', date: '2026-10-26', title: 'Kolokwium 2' }),
    entry('c', { series_id: 's', event_id: 'ev-3', date: '2026-11-02', title: 'Kolokwium 3' })];
  const itemActions = actions({ items: series });
  const { unmount } = render(<PlanItemDialog item={series[1]} actions={itemActions} onClose={() => {}}/>);
  fireEvent.click(screen.getByRole('button', { name: 'Edytuj' }));
  fireEvent.change(screen.getByLabelText('Zakres materiału (opcjonalnie)'), { target: { value: 'Całość' } });
  fireEvent.click(screen.getByRole('radio', { name: 'Ten i następne' }));
  fireEvent.click(screen.getByRole('button', { name: 'Zapisz' }));
  await waitFor(() => expect(itemActions.update).toHaveBeenCalled());
  expect(itemActions.update.mock.calls[0][0]).toEqual([{ id: 'b', revision: 1, details: 'Całość' }, { id: 'c', revision: 1, details: 'Całość' }]);
  expect(itemActions.update.mock.calls[0][1]).toEqual([{ id: 'b', details: null }, { id: 'c', details: null }]);
  unmount();

  render(<PlanItemDialog item={series[0]} actions={itemActions} onClose={() => {}}/>);
  fireEvent.click(screen.getByRole('button', { name: 'Usuń' }));
  fireEvent.click(screen.getByRole('radio', { name: 'Wszystkie' }));
  fireEvent.click(screen.getByRole('button', { name: 'Usuń (3)' }));
  await waitFor(() => expect(itemActions.remove).toHaveBeenCalledWith(series));
});
