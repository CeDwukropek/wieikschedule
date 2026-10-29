import { fireEvent, render, screen } from '@testing-library/react';
import FreeRoomsGrid from './FreeRoomsGrid';

const main = { id: 'main', name: 'Budynek główny', short: 'Gł.' }, other = { id: 'inne', name: 'Inne', short: 'Inne' };
const rooms = [{ key: 'A3', label: 'A3', building: main }, { key: '208B', label: '208B', building: main }, { key: 'WA2', label: 'WA2', building: other }];

test('rooms stand side by side under their buildings with classes at their times', () => {
  const onOpenRoom = jest.fn();
  const { container } = render(<FreeRoomsGrid rooms={rooms} minute={9 * 60 + 30} freeNow={new Set(['208B', 'WA2'])} onOpenRoom={onOpenRoom}
    classesByRoom={new Map([['A3', [{ start: 555, end: 645, subject: 'Analiza', type: 'Wykład', audience: 'EiAs3', teacher: 'dr X' }]]])}/>);
  expect([...container.querySelectorAll('.rooms-grid-building')].map(node => [node.textContent, node.style.gridColumn]))
    .toEqual([['Gł.', '2 / span 2'], ['Inne', '4 / span 1']]);
  const block = container.querySelector('.rooms-grid-class');
  expect(block).toHaveTextContent('09:15–10:45Analiza');
  expect(block.style.top).toBe(`${(135 / 900) * 100}%`);
  expect(screen.getByRole('button', { name: 'A3, zajęta o 09:30. Pokaż plan sali' })).not.toHaveAttribute('data-free');
  fireEvent.click(screen.getByRole('button', { name: '208B, wolna o 09:30. Pokaż plan sali' }));
  expect(onOpenRoom).toHaveBeenCalledWith(rooms[1]);
  expect(container.querySelectorAll('.rooms-grid-line')).toHaveLength(4);
});

test('a class in the grid opens its details', () => {
  const onOpenClass = jest.fn();
  const item = { start: 555, end: 645, subject: 'Analiza', type: 'Wykład', audience: 'EiAs3 L5', teacher: 'dr X' };
  render(<FreeRoomsGrid rooms={rooms} minute={600} freeNow={new Set()} onOpenRoom={() => {}} onOpenClass={onOpenClass}
    classesByRoom={new Map([['A3', [item]]])}/>);
  fireEvent.click(screen.getByRole('button', { name: 'A3, 09:15–10:45: Analiza, EiAs3 L5. Pokaż szczegóły' }));
  expect(onOpenClass).toHaveBeenCalledWith(item);
});
