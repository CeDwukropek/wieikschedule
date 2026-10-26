import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import PlanItemsPreview from './PlanItemsPreview';
import ChatPanel from './ChatPanel';

// react-markdown and remark-gfm are ES modules Jest does not transform; the text itself is not under test here.
jest.mock('react-markdown', () => ({ children }) => children);
jest.mock('remark-gfm', () => () => {});

const item = extra => ({ scope: 'group', faculty: 'EiAs3', kind: 'kolokwium', title: 'Kolokwium 1', details: 'Rozdziały 1–3', ...extra });
const proposal = {
  type: 'plan_items', id: 'p1', subject: 'Analiza obwodów', kind: 'kolokwium', expires_at: new Date(Date.now() + 3600000).toISOString(), signature: 's',
  items: [
    { index: 0, item: item({ timing: 'class', event_id: 'e1' }), when: { date: '2026-11-05', start_time: '09:15:00', duration_min: 90 },
      label: 'czw., 5.11, 09:15–10:45 · Laboratorium', needs_time: false, warnings: [], selectable: true, audience: 'Grupa L4' },
    { index: 1, item: item({ timing: 'slot', date: '2026-11-12', start_time: null, duration_min: 90 }), when: { date: '2026-11-12', start_time: null },
      label: 'czw., 12.11, godzina do podania', needs_time: true, warnings: ['W tym dniu Twoja grupa nie ma zajęć z tego przedmiotu.', 'Podaj godzinę — nie zgaduję jej.'],
      selectable: true, audience: 'Grupa L4' },
    { index: 2, item: item({ timing: 'class', event_id: 'e2' }), when: { date: '2026-11-19', start_time: '09:15:00', duration_min: 90 },
      label: 'czw., 19.11, 09:15–10:45', needs_time: false, warnings: ['Taki wpis już istnieje.'], selectable: false, audience: 'Grupa L4' },
  ],
};

test('rows are chosen, a missing hour is filled in, and only the chosen rows are confirmed', async () => {
  const onConfirm = jest.fn().mockResolvedValue({ items: [{}, {}] });
  const onDrafts = jest.fn();
  render(<PlanItemsPreview proposal={proposal} onConfirm={onConfirm} onDrafts={onDrafts}/>);
  const boxes = screen.getAllByRole('checkbox');
  // A class day is chosen; a day without a class waits for an hour; an existing entry is not offered.
  expect(boxes.map(box => [box.checked, box.disabled])).toEqual([[true, false], [false, true], [false, true]]);
  expect(screen.getByText('Taki wpis już istnieje.')).toBeInTheDocument();
  expect(onDrafts).toHaveBeenLastCalledWith('p1', [expect.objectContaining({ id: 'draft-p1-0', draft: true, date: '2026-11-05', start_time: '09:15:00' })]);
  fireEvent.change(screen.getByLabelText('Godzina: czw., 12.11, godzina do podania'), { target: { value: '10:00' } });
  expect(boxes[1]).toBeChecked();
  expect(onDrafts.mock.calls.at(-1)[1].map(draft => draft.start_time)).toEqual(['09:15:00', '10:00:00']);
  fireEvent.click(screen.getByRole('button', { name: 'Zatwierdź zaznaczone (2)' }));
  await waitFor(() => expect(onConfirm).toHaveBeenCalledWith({ proposal, indexes: [0, 1], times: { 1: '10:00' } }));
  expect(await screen.findByRole('status')).toHaveTextContent('Dodano 2 terminy.');
  expect(onDrafts).toHaveBeenLastCalledWith('p1', []);
});

test('an expired preview cannot be confirmed', () => {
  render(<PlanItemsPreview proposal={{ ...proposal, expires_at: new Date(Date.now() - 1000).toISOString() }} onConfirm={jest.fn()}/>);
  expect(screen.getByRole('alert')).toHaveTextContent('Podgląd wygasł');
  expect(screen.getByRole('button', { name: /Zatwierdź zaznaczone/ })).toBeDisabled();
});

test('the chat offers the entries mode, enlarges on demand and shows the preview under the answer', () => {
  const onToggleLarge = jest.fn();
  const previous = process.env.REACT_APP_PERSONAL_SCHEDULE;
  process.env.REACT_APP_PERSONAL_SCHEDULE = 'true';
  const messages = [{ id: 'm1', role: 'assistant', stage: 'done', text: 'Przygotowałem podgląd.', payload: { output: 'x', proposals: [proposal, { id: 'override', event_id: 'e' }] } }];
  render(<ChatPanel isChatMode isChatWindowOpen messages={messages} status="idle" intent="entries" onIntentChange={() => {}} entriesEnabled
    onConfirmEntries={jest.fn()} onToggleLarge={onToggleLarge} onResizeStart={() => {}}/>);
  process.env.REACT_APP_PERSONAL_SCHEDULE = previous;
  expect(screen.getByRole('option', { name: 'Dodać kolokwium lub termin' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Powiększ czat' }));
  expect(onToggleLarge).toHaveBeenCalled();
  expect(within(screen.getByRole('log')).getAllByRole('group', { name: 'Podgląd: Analiza obwodów' })).toHaveLength(1);
});
