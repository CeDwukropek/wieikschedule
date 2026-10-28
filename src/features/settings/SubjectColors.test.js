import { fireEvent, render, screen } from '@testing-library/react';
import SubjectColors from './SubjectColors';

test('each subject gets one colour from the palette or goes back to Auto', () => {
  const onChoose = jest.fn();
  render(<SubjectColors names={['Fizyka', 'Matematyka']} chosen={{ Fizyka: 'green' }} onChoose={onChoose}/>);
  expect(screen.getByText('Kolory przedmiotów (ustawione: 1)')).toBeInTheDocument();
  const physics = screen.getByRole('radiogroup', { name: 'Kolor: Fizyka' });
  expect(physics.querySelectorAll('[role="radio"]')).toHaveLength(11);
  expect(screen.getAllByRole('radio', { name: 'Zielony' })[0]).toHaveAttribute('aria-checked', 'true');
  fireEvent.click(screen.getAllByRole('radio', { name: 'Różowy' })[1]);
  expect(onChoose).toHaveBeenCalledWith('Matematyka', 'pink');
  fireEvent.click(screen.getAllByRole('radio', { name: 'Auto' })[0]);
  expect(onChoose).toHaveBeenCalledWith('Fizyka', null);
  fireEvent.change(screen.getByLabelText('Własny kolor: Matematyka'), { target: { value: '#123abc' } });
  expect(onChoose).toHaveBeenCalledWith('Matematyka', '#123abc');
});
