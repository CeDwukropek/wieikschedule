import { describeChange, groupsOf, historyFaculties, historyUndo, inviteChoices, inviteMessage, reviewItems, roleLabel } from './planRoles';

const version = (extra = {}) => ({ title: 'Kolokwium', kind: 'kolokwium', timing: 'slot', event_id: null, date: '2026-10-24', start_time: '09:00:00',
  duration_min: 90, due_time: null, subject: 'Fizyka', group: 'Lk1', details: null, state: 'active', review_reason: null, ...extra });
const change = (extra = {}) => ({ id: 1, item_id: 'i', revision: 2, operation: 'update', actor: 'Ty', item: version({ title: 'Kolokwium 1' }),
  previous: version(), current: { revision: 2, deleted: false }, ...extra });

test('who may invite whom, and to which plans', () => {
  const options = [{ id: 'all', name: 'Wszystkie' }, { id: 'EiAs3', name: 'EiAs3' }, { id: 'IwIKs5', name: 'IwIKs5' }];
  expect(inviteChoices([{ role: 'admin' }], options)).toEqual({ roles: ['group_starosta', 'starosta'], faculties: ['EiAs3', 'IwIKs5'] });
  expect(inviteChoices([{ role: 'starosta', faculty: 'EiAs3' }], options)).toEqual({ roles: ['group_starosta'], faculties: ['EiAs3'] });
  expect(inviteChoices([{ role: 'group_starosta', faculty: 'EiAs3', group: 'Lk4' }], options).roles).toEqual([]);
  expect(historyFaculties([{ role: 'group_starosta', faculty: 'EiAs3', group: 'Lk4' }], 'IwIKs5')).toEqual(['EiAs3']);
  expect(roleLabel({ role: 'group_starosta', faculty: 'EiAs3', group: 'Lk4' })).toBe('Starosta grupy Lk4 (EiAs3)');
  expect(groupsOf([{ groups: ['L10', 'L2'] }, { groups: ['W'] }, { groups: ['C1', 'L2'] }])).toEqual(['C1', 'L2', 'L10']);
  expect(inviteMessage({ code: 'ABCD-EFGH-JKMN', role: 'group_starosta', faculty: 'EiAs3', group: 'Lk4', expires_at: '2026-10-30T12:00:00Z' }))
    .toMatch(/ABCD-EFGH-JKMN.*starosta grupy Lk4 \(EiAs3\).*30 października/);
});

test('only the latest change of an entry can be undone, with the version before it', () => {
  expect(historyUndo(change())).toEqual({ action: 'save', label: 'Cofnij', items: [{ id: 'i', revision: 2, kind: 'kolokwium', title: 'Kolokwium',
    details: null, subject: 'Fizyka', group: 'Lk1', timing: 'slot', date: '2026-10-24', start_time: '09:00:00', duration_min: 90, due_time: null }] });
  expect(historyUndo(change({ current: { revision: 3, deleted: false } }))).toBeNull();
  expect(historyUndo(change({ operation: 'delete', current: { revision: 2, deleted: true } })).action).toBe('restore');
  expect(historyUndo(change({ operation: 'create' })).action).toBe('remove');
  expect(historyUndo(change({ operation: 'review' }))).toBeNull();
  const onClass = historyUndo(change({ previous: version({ timing: 'class', event_id: 'ev' }) })).items[0];
  expect([onClass.timing, onClass.event_id, 'date' in onClass]).toEqual(['class', 'ev', false]);
});

test('a change reads as a few short lines', () => {
  expect(describeChange(change({ item: version({ title: 'Kolokwium 1', date: '2026-10-31', details: 'Rozdz. 2' }) }))).toEqual({ what: 'Zmiana',
    lines: ['Tytuł: Kolokwium → Kolokwium 1', 'Termin: sob., 24.10, 09:00–10:30 → sob., 31.10, 09:00–10:30', 'Zakres materiału: Rozdz. 2'] });
  expect(describeChange(change({ operation: 'review', item: version({ state: 'review', review_reason: 'moved' }) })).lines)
    .toEqual(['Do sprawdzenia: zajęcia przeniesione.']);
  expect(reviewItems([{ id: 'a', scope: 'group', state: 'review', can_edit: true, date: '2026-11-02' },
    { id: 'b', scope: 'group', state: 'review', can_edit: false, date: '2026-11-01' },
    { id: 'c', scope: 'group', state: 'active', can_edit: true, date: '2026-11-01' }]).map(item => item.id)).toEqual(['a']);
});
