import { act, renderHook } from "@testing-library/react";
import { useScheduleNavigation } from "./useScheduleNavigation";

test("late settings restore the week before the user starts navigating", () => {
  const { result, rerender } = renderHook(savedSettings => useScheduleNavigation({ savedSettings }), {
    initialProps: null,
  });
  rerender({ weekOffset: 3 });
  expect(result.current.weekOffset).toBe(3);
});

test.each(["next", "prev", "select", "reset"])("late hydration preserves manual %s navigation", action => {
  const { result, rerender } = renderHook(savedSettings => useScheduleNavigation({ savedSettings }), {
    initialProps: { weekOffset: 0 },
  });
  act(() => {
    if (action === "next") result.current.weekNavigation.onNextWeek();
    if (action === "prev") result.current.weekNavigation.onPrevWeek();
    if (action === "select") result.current.weekSelection.onChange(4);
    if (action === "reset") result.current.weekNavigation.onResetWeek();
  });
  const selected = result.current.weekOffset;
  rerender({ weekOffset: 2, scheduleGroupSets: {} });
  expect(result.current.weekOffset).toBe(selected);
  rerender({ weekOffset: 2 });
  expect(result.current.weekOffset).toBe(selected);
});

test("late timetable bounds preserve a manually selected week within the range", () => {
  const { result, rerender } = renderHook(props => useScheduleNavigation(props), { initialProps: {} });
  act(() => result.current.weekNavigation.onNextWeek());
  const start = result.current.selectedDayWeekStart;
  const end = new Date(start);
  end.setDate(end.getDate() + 21);
  const iso = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  rerender({ minDate: iso(start), maxDate: iso(end), savedSettings: { weekOffset: 0 } });
  expect(result.current.weekOffset).toBe(1);
});

test("loaded timetable bounds still clamp weeks outside the available plan", () => {
  const { result, rerender } = renderHook(props => useScheduleNavigation(props), {
    initialProps: {},
  });
  act(() => result.current.weekSelection.onChange(20));
  const start = result.current.selectedDayWeekStart;
  const date = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
  rerender({ minDate: date, maxDate: date });
  expect(result.current.weekOffset).toBe(0);
});
