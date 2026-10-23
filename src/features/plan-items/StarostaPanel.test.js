import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import StarostaPanel from './StarostaPanel';
import RedeemInvite from './RedeemInvite';

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
});

const version = (extra = {}) => ({ title: 'Kolokwium', kind: 'kolokwium', timing: 'due', event_id: null, date: '2026-10-28', start_time: null,
  duration_min: null, due_time: null, subject: 'Fizyka', group: 'Lk1', details: null, state: 'active', review_reason: null, ...extra });
const review = { id: 'r1', revision: 4, scope: 'group', state: 'review', review_reason: 'moved', can_edit: true, kind: 'kolokwium', title: 'Kolokwium 2',
  subject: 'Fizyka', group: 'Lk1', faculty: 'EiAs3', timing: 'class', date: '2026-11-03', start_time: '10:00:00', duration_min: 90,
  anchor: { date: '2026-11-02', start_time: '09:00:00' } };

function setup(request, roles = [{ id: 'own', role: 'starosta', faculty: 'EiAs3', group: null }]) {
  const onChanged = jest.fn(), onOpenItem = jest.fn();
  render(<StarostaPanel roles={roles} items={[review]} scheduleId="EiAs3" timetableOptions={[{ id: 'EiAs3', name: 'EiAs3' }]}
    groupsFor={() => [{ groups: ['Lk1', 'Lk4'] }]} onChanged={onChanged} onOpenItem={onOpenItem} onClose={() => {}} request={request}/>);
  return { onChanged, onOpenItem };
}
const api = (handlers = {}) => jest.fn(async (action, options = {}) => {
  if (handlers[action]) return handlers[action](options);
  if (action === 'roles') return { roles: [{ id: 'own', role: 'starosta', faculty: 'EiAs3', group: null }],
    managed: [{ id: 'own', role: 'starosta', faculty: 'EiAs3', group: null, mine: true, created_at: '2026-10-20T10:00:00Z' },
      { id: 'g1', role: 'group_starosta', faculty: 'EiAs3', group: 'Lk1', mine: false, created_at: '2026-10-21T10:00:00Z' }] };
  if (action === 'history') return { changes: [
    { id: 2, item_id: 'i', revision: 2, operation: 'update', actor: 'starosta grupy Lk1', created_at: '2026-10-22T18:00:00Z',
      item: version({ title: 'Kolokwium 1' }), previous: version(), current: { revision: 2, deleted: false } },
    { id: 1, item_id: 'i', revision: 1, operation: 'create', actor: 'Ty', created_at: '2026-10-22T17:00:00Z',
      item: version(), previous: null, current: { revision: 2, deleted: false } }] };
  return { items: [] };
});

test('a starosta creates a one-time code for a group without a starosta', async () => {
  const request = api({ invite: async ({ body }) => ({ invite: { ...body, code: 'ABCD-EFGH-JKMN', expires_at: '2026-10-30T12:00:00Z' } }) });
  setup(request);
  // Lk1 has a starosta already; Lk4 is offered.
  const invite = screen.getByRole('region', { name: 'Zaproś starostę' });
  await waitFor(() => expect(within(invite).getByRole('button', { name: 'Lk4' })).toBeInTheDocument());
  expect(within(invite).queryByRole('button', { name: 'Lk1' })).not.toBeInTheDocument();
  fireEvent.click(within(invite).getByRole('button', { name: 'Lk4' }));
  fireEvent.click(within(invite).getByRole('button', { name: 'Utwórz kod' }));
  const code = await screen.findByRole('status', { name: 'Nowy kod zaproszenia' });
  expect(code).toHaveTextContent('ABCD-EFGH-JKMN');
  expect(code).toHaveTextContent('Starosta grupy Lk4 (EiAs3)');
  expect(request).toHaveBeenCalledWith('invite', { method: 'POST', body: { role: 'group_starosta', faculty: 'EiAs3', group: 'Lk4' } });
});

test('roles are taken away after a confirmation; entries under review are confirmed or opened', async () => {
  const request = api();
  const { onChanged, onOpenItem } = setup(request);
  const roles = screen.getByRole('region', { name: 'Role' });
  await waitFor(() => expect(roles).toHaveTextContent('Starosta grupy Lk1 (EiAs3)'));
  expect(within(roles).getByText('Starosta EiAs3').parentElement).toHaveTextContent('Ty');
  fireEvent.click(within(roles).getByRole('button', { name: 'Odbierz rolę' }));
  fireEvent.click(within(roles).getByRole('button', { name: 'Tak, odbierz' }));
  await waitFor(() => expect(request).toHaveBeenCalledWith('revoke', { method: 'POST', body: { role_id: 'g1' } }));
  expect(onChanged).toHaveBeenCalled();

  const reviews = screen.getByRole('region', { name: 'Do sprawdzenia (1)' });
  expect(reviews).toHaveTextContent('Uczelnia przeniosła te zajęcia');
  fireEvent.click(within(reviews).getByRole('button', { name: 'Potwierdź termin' }));
  await waitFor(() => expect(request).toHaveBeenCalledWith('save', { method: 'POST', body: { items: [{ id: 'r1', revision: 4 }] } }));
  fireEvent.click(within(reviews).getByRole('button', { name: 'Zmień lub usuń' }));
  expect(onOpenItem).toHaveBeenCalledWith(review);
});

test('history shows changes by role and undoes only the latest change of an entry', async () => {
  const request = api();
  setup(request);
  const history = screen.getByRole('region', { name: 'Historia zmian' });
  await waitFor(() => expect(history).toHaveTextContent('starosta grupy Lk1'));
  expect(history).toHaveTextContent('Tytuł: Kolokwium → Kolokwium 1');
  expect(within(history).getAllByRole('button', { name: 'Cofnij' })).toHaveLength(1);
  fireEvent.click(within(history).getByRole('button', { name: 'Cofnij' }));
  await waitFor(() => expect(request).toHaveBeenCalledWith('save', { method: 'POST', body: { items: [expect.objectContaining({
    id: 'i', revision: 2, title: 'Kolokwium', timing: 'due' })] } }));
  expect(request.mock.calls.filter(([action]) => action === 'history')).toHaveLength(2);
});

test('a group starosta sees their own role and history but cannot invite', async () => {
  setup(api({ roles: async () => ({ roles: [{ id: 'g', role: 'group_starosta', faculty: 'EiAs3', group: 'Lk4' }], managed: [] }) }),
    [{ id: 'g', role: 'group_starosta', faculty: 'EiAs3', group: 'Lk4' }]);
  expect(await screen.findByText('Starosta grupy Lk4 (EiAs3)', { selector: 'strong' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Zrezygnuj' })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Zaproś starostę' })).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Historia zmian' })).toBeInTheDocument();
});

test('a code from a starosta gives its role', async () => {
  const onRedeem = jest.fn().mockResolvedValue({ role: 'group_starosta', faculty: 'EiAs3', group: 'Lk4', replaced: true });
  render(<RedeemInvite onRedeem={onRedeem}/>);
  const input = screen.getByLabelText('Mam kod zaproszenia');
  fireEvent.change(input, { target: { value: 'abcd-efgh-jkm' } });
  expect(screen.getByRole('button', { name: 'Użyj kodu' })).toBeDisabled();
  fireEvent.change(input, { target: { value: 'abcd-efgh-jkmn' } });
  fireEvent.click(screen.getByRole('button', { name: 'Użyj kodu' }));
  expect(await screen.findByRole('status')).toHaveTextContent('Masz teraz rolę: Starosta grupy Lk4 (EiAs3). Poprzednia osoba ją straciła.');
  expect(onRedeem).toHaveBeenCalledWith('ABCD-EFGH-JKMN');
});
