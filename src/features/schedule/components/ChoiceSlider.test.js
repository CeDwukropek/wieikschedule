import { fireEvent, render, screen } from '@testing-library/react';
import { InfoTip } from './ChoiceSlider';

// The hint is placed against the window, so it never makes the card scroll: inside it, and above the "i" near the bottom.
function placed({ anchor, height = 120 }) {
  window.innerWidth = 360; window.innerHeight = 640;
  render(<InfoTip label="Dla kogo" text="Dla siebie: tylko Ty. Dla grupy: cała grupa."/>);
  const button = screen.getByRole('button', { name: 'Co zmienia: Dla kogo' });
  button.getBoundingClientRect = () => ({ ...anchor, width: anchor.right - anchor.left, height: anchor.bottom - anchor.top });
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, get: () => height });
  fireEvent.mouseEnter(button);
  return screen.getByRole('tooltip');
}
afterEach(() => { delete HTMLElement.prototype.offsetHeight; });

test('the hint opens below the "i" and stays inside the window at the right edge', () => {
  const tip = placed({ anchor: { left: 330, right: 352, top: 100, bottom: 122 } });
  expect(tip).toHaveAttribute('data-shown');
  // 280 px wide, pushed left so that it ends 8 px before the window's edge.
  expect(tip).toHaveStyle({ top: '128px', left: '72px', width: '280px' });
});

test('near the bottom it opens above the "i"; it hides again when the pointer leaves', () => {
  const tip = placed({ anchor: { left: 20, right: 42, top: 600, bottom: 622 } });
  expect(tip).toHaveStyle({ top: '474px', left: '8px' });
  fireEvent.mouseLeave(screen.getByRole('button', { name: 'Co zmienia: Dla kogo' }));
  expect(tip).not.toHaveAttribute('data-shown');
});
