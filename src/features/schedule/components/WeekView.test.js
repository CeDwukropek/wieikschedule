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

const planActions=(extra={})=>({overrideFor:()=>undefined,apply:jest.fn().mockResolvedValue({}),removeAdded:jest.fn(),
  startTimes:['07:30','09:15','12:00'],bounds:{min:'2026-10-01',max:'2027-02-01'},conflictsFor:()=>[],...extra});

test('a compact occurrence opens full details with direct actions', async () => {
  const actions = planActions();
  render(<WeekView events={[event]} viewedWeekStart={monday} planActions={actions}/>);
  const trigger = screen.getByRole('button', {name: /Modelowanie.*Pokaż szczegóły/});
  trigger.focus();fireEvent.click(trigger);
  const dialog = screen.getByRole('dialog', {name: event.title});
  expect(dialog).toHaveTextContent('19 października 2026');
  expect(dialog).toHaveTextContent('07:30–09:00');
  expect(dialog).toHaveTextContent('A-101');
  expect(dialog).toHaveTextContent('Jan Kowalski');
  expect(dialog).toHaveTextContent('Lk1');
  fireEvent.click(screen.getByRole('button', {name: 'Odwołaj u mnie'}));
  await waitFor(() => expect(actions.apply).toHaveBeenCalledWith({event_id:'occurrence-a',operation:'upsert',action:'cancel',patch:{}}));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(trigger).toHaveFocus();
});

test('moving keeps an earlier private room change and shows collisions', async () => {
  const actions = planActions({
    overrideFor:()=>({action:'modify',patch:{room:'A-101'},reason:null,events:{date:'2026-10-19',start_time:'07:30:00',duration_min:90,room:'B2'}}),
    conflictsFor:(id,{start})=>start==='12:00'?[{title:'Analiza obwodów',start:'12:15',end:'13:45',room:'108D'}]:[],
  });
  render(<WeekView events={[{...event,personal_override:true}]} viewedWeekStart={monday} planActions={actions}/>);
  fireEvent.click(screen.getByRole('button', {name: /Pokaż szczegóły/}));
  expect(screen.getByRole('dialog')).toHaveTextContent('Oryginalnie: pon 19.10 · 07:30–09:00 · B2');
  expect(screen.getByRole('button', {name: 'Przywróć plan uczelni'})).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', {name: 'Przenieś'}));
  expect(screen.getByRole('button', {name: 'Zapisz'})).toBeDisabled();
  fireEvent.change(screen.getByLabelText('Data'), {target: {value: '2026-10-22'}});
  fireEvent.change(screen.getByLabelText('Początek'), {target: {value: '12:00'}});
  expect(screen.getByLabelText('Koniec')).toHaveValue('13:30');
  expect(screen.getByRole('status')).toHaveTextContent('Analiza obwodów (12:15–13:45, 108D)');
  fireEvent.click(screen.getByRole('button', {name: 'Zapisz'}));
  await waitFor(() => expect(actions.apply).toHaveBeenCalledWith({event_id:'occurrence-a',operation:'upsert',action:'modify',
    patch:{room:'A-101',date:'2026-10-22',start_time:'12:00:00'},reason:null}));
});

test('a date outside the plan is refused before saving and a failed save keeps the dialog open', async () => {
  const actions = planActions({apply:jest.fn().mockRejectedValue(new Error('Plan zmienił się lub podgląd wygasł.'))});
  render(<WeekView events={[event]} viewedWeekStart={monday} planActions={actions}/>);
  fireEvent.click(screen.getByRole('button', {name: /Pokaż szczegóły/}));
  fireEvent.click(screen.getByRole('button', {name: 'Przenieś'}));
  fireEvent.change(screen.getByLabelText('Data'), {target: {value: '2026-10-24'}});
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Data'), {target: {value: '2027-03-01'}});
  expect(screen.getByRole('alert')).toHaveTextContent('poza zakresem');
  expect(screen.getByRole('button', {name: 'Zapisz'})).toBeDisabled();
  fireEvent.click(screen.getByRole('button', {name: 'Anuluj'}));
  fireEvent.click(screen.getByRole('button', {name: 'Zmień salę'}));
  fireEvent.change(screen.getByLabelText('Sala'), {target: {value: 'C3'}});
  fireEvent.click(screen.getByRole('button', {name: 'Zapisz'}));
  expect(await screen.findByRole('alert')).toHaveTextContent('Plan zmienił się');
  expect(screen.getByRole('dialog')).toBeInTheDocument();
});

test('changing week dismisses stale details and guests have no private edit action', () => {
  const {rerender} = render(<WeekView events={[event]} viewedWeekStart={monday}/>);
  fireEvent.click(screen.getByRole('button', {name: /Pokaż szczegóły/}));
  expect(screen.queryByRole('button', {name: 'Przenieś'})).not.toBeInTheDocument();
  rerender(<WeekView events={[event]} viewedWeekStart={new Date(2026,9,26)}/>);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(document.body.style.overflow).not.toBe('hidden');
});

test('removing a makeup occurrence uses the addition ID and keeps errors visible', async () => {
  const remove = jest.fn().mockRejectedValueOnce(new Error('Spróbuj ponownie'));
  const added = {...event, origin: 'added', added_event_id: 'addition-a'};
  render(<WeekView events={[added]} viewedWeekStart={monday} planActions={planActions({removeAdded:remove})}/>);
  fireEvent.click(screen.getByRole('button', {name: /Pokaż szczegóły/}));
  expect(screen.queryByRole('button', {name: 'Odwołaj u mnie'})).not.toBeInTheDocument();
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
  expect(dialog).toHaveTextContent('Zmienione u mnie');
  fireEvent(dialog, new Event('cancel', {cancelable: true}));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('a cancelled class stays visible faded and can be restored from its details', async () => {
  const actions = planActions();
  const ghost = {...event, id: 'ghost-cancelled-occurrence-a', origin: 'ghost', ghost: 'cancelled', personal_override: true};
  const moved = {...event, id: 'ghost-moved', event_id: 'occurrence-b', origin: 'ghost', ghost: 'moved-from', personal_override: true,
    movedTo: {date: '2026-10-22', start_time: '12:00:00', duration_min: 90, room: 'A-101'}};
  render(<WeekView events={[ghost, moved]} viewedWeekStart={monday} planActions={actions}/>);
  expect(screen.getByRole('button', {name: /^Odwołane u mnie: Modelowanie/})).toHaveAttribute('data-ghost', 'cancelled');
  expect(screen.getByRole('button', {name: /^Przeniesione: .*→ czw 22\.10 12:00/})).toHaveAttribute('data-ghost', 'moved-from');
  fireEvent.click(screen.getByRole('button', {name: /^Odwołane u mnie/}));
  expect(screen.queryByRole('button', {name: 'Przenieś'})).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', {name: 'Przywróć zajęcia'}));
  await waitFor(() => expect(actions.apply).toHaveBeenCalledWith({event_id: 'occurrence-a', operation: 'delete'}));
});

describe('today and past classes', () => {
  beforeEach(() => { jest.useFakeTimers(); jest.setSystemTime(new Date(2026, 9, 21, 10, 0)); });
  afterEach(() => jest.useRealTimers());
  const later = {...event, id: 'normalized-b', event_id: 'occurrence-b', day: 2, start: '12:00', end: '13:30', dates: ['2026-10-21']};

  test('marks today and the current time; fades ended classes only when asked', () => {
    const { container, rerender } = render(<WeekView events={[event, later]} viewedWeekStart={monday}/>);
    expect(container.querySelector('[aria-current="date"]')).toHaveTextContent('Środa');
    expect(container.querySelector('.grid-now-line').style.top).toBe(`${180 / 900 * 100}%`);
    expect(container.querySelector('[data-past]')).toBeNull();
    rerender(<WeekView events={[event, later]} viewedWeekStart={monday} dimPast/>);
    const items = [...container.querySelectorAll('.week-event-item')];
    expect(items.map(item => item.hasAttribute('data-past'))).toEqual([true, false]);
    expect(container.querySelector('.week-day-name[data-past]')).toHaveTextContent('Poniedziałek');
  });

  test('another week has no marks of today', () => {
    const { container } = render(<WeekView events={[event]} viewedWeekStart={new Date(2026, 9, 26)}/>);
    expect(container.querySelector('[aria-current="date"]')).toBeNull();
    expect(container.querySelector('.grid-now-line')).toBeNull();
  });
});
