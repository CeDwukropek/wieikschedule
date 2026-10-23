import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import WeekView from '../schedule/components/WeekView';
import { placeItems } from './planItemLogic';

const monday = new Date(2026, 9, 19);
const lab = { id: 'n-a', event_id: 'lab-a', day: 0, start: '07:30', end: '09:00', title: 'Modelowanie', subj: 'MUD',
  type: 'Laboratorium', room: 'A-101', groups: ['Lk1'], dates: ['2026-10-19'] };
const entry = (id, extra = {}) => ({ id, scope: 'group', faculty: 'EiAs3', subject: 'Modelowanie', group: 'Lk1', kind: 'kolokwium',
  timing: 'class', event_id: 'lab-a', date: '2026-10-19', start_time: '07:30:00', duration_min: 90, due_time: null, title: `Kolokwium ${id}`,
  state: 'active', revision: 1, my_state: null, ...extra });

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
});

function view(items, props = {}) {
  const placed = placeItems(items, monday, [lab]);
  return <WeekView events={placed.events} strip={placed.strip} viewedWeekStart={monday} {...props}/>;
}

test('a class shows its entries; its details keep the dialog open while progress is saved', async () => {
  const onItemState = jest.fn().mockResolvedValue();
  const quiz = entry('1', { details: 'Rozdziały 1–3' });
  const { rerender } = render(view([quiz], { onItemState }));
  fireEvent.click(screen.getByRole('button', { name: /Modelowanie.*Kolokwium: Kolokwium 1.*Pokaż szczegóły/ }));
  const entries = within(screen.getByRole('dialog')).getByRole('region', { name: 'Terminy na tych zajęciach' });
  expect(entries).toHaveTextContent('Rozdziały 1–3');
  fireEvent.click(within(entries).getByRole('button', { name: 'Gotowe' }));
  await waitFor(() => expect(onItemState).toHaveBeenCalledWith('1', { progress: 'ready' }));
  // New events after the save: the dialog follows the same class and shows the new progress.
  rerender(view([{ ...quiz, my_state: { hidden: false, progress: 'ready' } }], { onItemState }));
  expect(within(screen.getByRole('dialog')).getByRole('button', { name: 'Gotowe' })).toHaveAttribute('aria-pressed', 'true');
});

test('guests see entries without progress controls; blocks and the strip open the entry', () => {
  const onOpenItem = jest.fn();
  render(view([entry('1'), entry('slot', { timing: 'slot', event_id: null, date: '2026-10-20', start_time: '12:00:00', duration_min: 60, title: 'Poprawa' }),
    entry('due', { kind: 'sprawozdanie', timing: 'due', event_id: null, start_time: null, duration_min: null, due_time: '23:59:00', title: 'Sprawozdanie 3' })],
    { onOpenItem }));
  fireEvent.click(screen.getByRole('button', { name: /^Kolokwium: Poprawa, 12:00–13:00/ }));
  expect(onOpenItem).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'slot' }));
  fireEvent.click(screen.getByRole('button', { name: /^Sprawozdanie: Sprawozdanie 3, do 23:59/ }));
  expect(onOpenItem).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'due' }));
  fireEvent.click(screen.getByRole('button', { name: /^Modelowanie/ }));
  expect(within(screen.getByRole('dialog')).queryByRole('button', { name: 'Gotowe' })).not.toBeInTheDocument();
});

test('the week grows to seven days when asked and stays at five otherwise', () => {
  const { rerender } = render(view([]));
  expect(screen.getByLabelText('Plan od poniedziałku do piątku, od 7:00 do 22:00')).toBeInTheDocument();
  expect(screen.queryByText('Sobota')).not.toBeInTheDocument();
  rerender(view([], { days: [0, 1, 2, 3, 4, 5, 6] }));
  expect(screen.getByLabelText('Plan od poniedziałku do niedzieli, od 7:00 do 22:00')).toBeInTheDocument();
  expect(screen.getByText('Sobota')).toBeInTheDocument();
  expect(screen.getByText('Niedziela')).toBeInTheDocument();
});

test('a strip with many entries folds into "+N więcej"', () => {
  const due = n => entry(`d${n}`, { timing: 'due', event_id: null, start_time: null, duration_min: null, title: `Termin ${n}` });
  render(view([due(1), due(2), due(3), due(4)]));
  expect(screen.getAllByRole('button', { name: /^Kolokwium: Termin/ })).toHaveLength(2);
  fireEvent.click(screen.getByRole('button', { name: '+2 więcej' }));
  expect(screen.getAllByRole('button', { name: /^Kolokwium: Termin/ })).toHaveLength(4);
});
