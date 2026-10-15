import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import WeekView from './WeekView';

const monday = new Date(2026, 9, 19);
const event = {
  id: 'normalized-a', event_id: 'occurrence-a', day: 0, start: '07:30', end: '09:00',
  title: 'Modelowanie układów dynamicznych', subj: 'MUD', type: 'Laboratorium komputerowe',
  room: 'A-101', teacher: 'Jan Kowalski', groups: ['Lk1'], dates: ['2026-10-19'],
};

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
});

test('a compact occurrence opens full details, then edits that occurrence only', () => {
  const edit = jest.fn();
  render(<WeekView events={[event]} viewedWeekStart={monday} onEditEvent={edit}/>);
  const trigger = screen.getByRole('button', {name: /Modelowanie.*Pokaż szczegóły/});
  trigger.focus();fireEvent.click(trigger);
  const dialog = screen.getByRole('dialog', {name: event.title});
  expect(dialog).toHaveTextContent('19 października 2026');
  expect(dialog).toHaveTextContent('07:30–09:00');
  expect(dialog).toHaveTextContent('A-101');
  expect(dialog).toHaveTextContent('Jan Kowalski');
  expect(dialog).toHaveTextContent('Lk1');
  fireEvent.click(screen.getByRole('button', {name: 'Przenieś lub zmień zajęcia'}));
  expect(edit).toHaveBeenCalledWith('occurrence-a');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});

test('changing week dismisses stale details and guests have no private edit action', () => {
  const {rerender} = render(<WeekView events={[event]} viewedWeekStart={monday}/>);
  fireEvent.click(screen.getByRole('button', {name: /Pokaż szczegóły/}));
  expect(screen.queryByRole('button', {name: 'Przenieś lub zmień zajęcia'})).not.toBeInTheDocument();
  rerender(<WeekView events={[event]} viewedWeekStart={new Date(2026,9,26)}/>);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(document.body.style.overflow).not.toBe('hidden');
});

test('removing a makeup occurrence uses the addition ID and keeps errors visible', async () => {
  const remove = jest.fn().mockRejectedValueOnce(new Error('Spróbuj ponownie'));
  const added = {...event, origin: 'added', added_event_id: 'addition-a'};
  render(<WeekView events={[added]} viewedWeekStart={monday} onRemoveAddedEvent={remove}/>);
  fireEvent.click(screen.getByRole('button', {name: /Pokaż szczegóły/}));
  fireEvent.click(screen.getByRole('button', {name: 'Usuń z mojego planu'}));
  expect(remove).toHaveBeenCalledWith('addition-a');
  expect(await screen.findByRole('alert')).toHaveTextContent('Spróbuj ponownie');
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  remove.mockResolvedValueOnce();
  fireEvent.click(screen.getByRole('button', {name: 'Usuń z mojego planu'}));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
});

test('overlapping events remain independently selectable and cancel closes details', () => {
  const other = {...event, id: 'normalized-b', event_id: 'occurrence-b', title: 'Inne zajęcia', personal_override: true};
  render(<WeekView events={[event,other]} viewedWeekStart={monday}/>);
  expect(screen.getAllByRole('button', {name: /Pokaż szczegóły/})).toHaveLength(2);
  fireEvent.click(screen.getByRole('button', {name: /Inne zajęcia/}));
  const dialog = screen.getByRole('dialog', {name: 'Inne zajęcia'});
  expect(dialog).toHaveTextContent('Moja zmiana');
  fireEvent(dialog, new Event('cancel', {cancelable: true}));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
