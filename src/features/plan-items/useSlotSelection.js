import { useEffect, useRef, useState } from 'react';

const STEP = 15, HOLD_MS = 450, SLOP_PX = 8;
// Choosing a free time in a day column of the grid: dragging with a mouse, or on a touch screen a long press
// first (so that scrolling still works), in steps of 15 minutes. onCreate(day, from, to) gets minutes of the
// day; a press without dragging gives to === from + 15 and the form makes it 90 minutes.
export function useSlotSelection(onCreate, { startHour = 7, endHour = 22 } = {}) {
  const [selection, setSelection] = useState(null);
  const drag = useRef(null);
  const selecting = Boolean(selection);
  // While a touch selection is on, the page must not scroll under the finger.
  useEffect(() => {
    if (!selecting) return undefined;
    const hold = event => { if (drag.current?.active && event.cancelable) event.preventDefault(); };
    document.addEventListener('touchmove', hold, { passive: false });
    return () => document.removeEventListener('touchmove', hold);
  }, [selecting]);
  useEffect(() => () => clearTimeout(drag.current?.timer), []);

  const minutesAt = (event, node) => {
    const rect = node.getBoundingClientRect();
    const raw = startHour * 60 + (event.clientY - rect.top) / rect.height * (endHour - startHour) * 60;
    return Math.min(Math.max(Math.floor(raw / STEP) * STEP, startHour * 60), endHour * 60 - STEP);
  };
  const begin = state => {
    state.active = true;
    state.node.setPointerCapture?.(state.pointerId);
    setSelection({ day: state.day, from: state.from, to: state.to });
  };
  const stop = () => { clearTimeout(drag.current?.timer); drag.current = null; setSelection(null); };
  const finish = () => {
    const state = drag.current;
    stop();
    if (state?.active) onCreate(state.day, state.from, state.to);
  };

  const handlers = day => (onCreate ? {
    onPointerDown: event => {
      // Only the free space: classes and entries inside the column keep their own clicks.
      if (event.target !== event.currentTarget || event.button > 0) return;
      const at = minutesAt(event, event.currentTarget);
      const state = { day, node: event.currentTarget, pointerId: event.pointerId, anchor: at, from: at, to: at + STEP,
        x: event.clientX, y: event.clientY, active: false };
      drag.current = state;
      if (event.pointerType === 'mouse') { event.preventDefault(); begin(state); }
      else state.timer = setTimeout(() => { begin(state); navigator.vibrate?.(10); }, HOLD_MS);
    },
    onPointerMove: event => {
      const state = drag.current;
      if (!state || state.day !== day) return;
      if (!state.active) {
        if (Math.hypot(event.clientX - state.x, event.clientY - state.y) > SLOP_PX) stop();
        return;
      }
      const at = minutesAt(event, state.node);
      state.from = Math.min(state.anchor, at);
      state.to = Math.max(state.anchor, at) + STEP;
      setSelection({ day, from: state.from, to: state.to });
    },
    onPointerUp: () => (drag.current?.active ? finish() : stop()),
    onPointerCancel: () => (drag.current?.active ? finish() : stop()),
    onContextMenu: event => { if (drag.current) event.preventDefault(); },
  } : {});
  return { selection, handlers };
}

export const minutesLabel = minutes => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
