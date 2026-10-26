import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { reminderLabel, reminderTimes, warsawInstant } from './reminders';
import ReminderSettings from './ReminderSettings';
import { buildICS } from '../schedule/export/exportICS';

const quiz = { id: 'q1', kind: 'kolokwium', scope: 'group', group: 'L4', subject: 'Fizyka', timing: 'class', date: '2026-10-26',
  start_time: '09:15:00', duration_min: 90, title: 'Kolokwium 1', my_state: null };

test('reminder times match the server on both sides of the DST change, with readable labels', () => {
  expect(warsawInstant('2026-10-24', '18:00').toISOString()).toBe('2026-10-24T16:00:00.000Z');
  expect(reminderTimes(quiz, [{ days_before: 1, at: '18:00' }, { minutes_before: 60 }])).toEqual(['2026-10-25T17:00:00.000Z', '2026-10-26T07:15:00.000Z']);
  expect([{ days_before: 0, at: '08:00' }, { days_before: 1, at: '18:00' }, { days_before: 3, at: '18:00' }, { days_before: 7, at: '18:00' },
    { minutes_before: 30 }, { minutes_before: 120 }].map(reminderLabel))
    .toEqual(['W dniu, 08:00', 'Dzień wcześniej, 18:00', '3 dni wcześniej, 18:00', 'Tydzień wcześniej, 18:00', '30 min przed', '2 h przed']);
});

test('the ICS export carries alarms at UTC times, none for a finished entry', () => {
  const settings = { kolokwium: [{ days_before: 1, at: '18:00' }, { minutes_before: 60 }] };
  const ics = buildICS([], [quiz], settings);
  expect(ics.match(/TRIGGER;VALUE=DATE-TIME:\w+/g)).toEqual(['TRIGGER;VALUE=DATE-TIME:20261025T170000Z', 'TRIGGER;VALUE=DATE-TIME:20261026T071500Z']);
  expect(ics).toContain('BEGIN:VALARM\r\nACTION:DISPLAY\r\nDESCRIPTION:Kolokwium: Kolokwium 1');
  expect(buildICS([], [{ ...quiz, my_state: { progress: 'done' } }], settings)).not.toContain('VALARM');
});

test('reminders by kind are added and removed and saved at once; custom settings can be reset', async () => {
  const saved = [];
  const initial = { kolokwium: [{ days_before: 1, at: '18:00' }], wejsciowka: [], sprawozdanie: [], egzamin: [], poprawa: [], projekt: [], inne: [] };
  // The settings come back from the server after every save, as in the app.
  function Harness() {
    const [reminders, setReminders] = useState(initial);
    return <ReminderSettings reminders={reminders} custom onSave={async next => { saved.push(next); setReminders(next || initial); }}/>;
  }
  render(<Harness/>);
  fireEvent.change(screen.getByLabelText('Dodaj przypomnienie: Kolokwium'), { target: { value: JSON.stringify({ minutes_before: 60 }) } });
  expect(await screen.findByRole('button', { name: 'Usuń przypomnienie: Kolokwium, 1 h przed' })).toBeInTheDocument();
  expect(saved.at(-1).kolokwium).toEqual([{ days_before: 1, at: '18:00' }, { minutes_before: 60 }]);
  // A preset already chosen is not offered twice.
  expect(screen.getByLabelText('Dodaj przypomnienie: Kolokwium')).not.toHaveTextContent('1 h przed');
  fireEvent.click(await screen.findByRole('button', { name: 'Usuń przypomnienie: Kolokwium, Dzień wcześniej, 18:00' }));
  await waitFor(() => expect(saved.at(-1).kolokwium).toEqual([{ minutes_before: 60 }]));
  fireEvent.click(screen.getByRole('button', { name: 'Przywróć domyślne' }));
  await waitFor(() => expect(saved.at(-1)).toBeNull());
});
