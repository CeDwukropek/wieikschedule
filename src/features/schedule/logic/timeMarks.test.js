import { hasEnded, nowFraction } from "./timeMarks";

const now = new Date(2026, 9, 28, 12, 30);

test("a class has ended on an earlier day or earlier today", () => {
  expect(hasEnded("2026-10-27", "20:00", now)).toBe(true);
  expect(hasEnded("2026-10-28", "12:30", now)).toBe(true);
  expect(hasEnded("2026-10-28", "12:31", now)).toBe(false);
  expect(hasEnded("2026-10-29", "08:00", now)).toBe(false);
  expect(hasEnded("2026-10-28", "", now)).toBe(false);
  expect(hasEnded("", "08:00", now)).toBe(false);
});

test("the current time line sits within the grid hours only", () => {
  expect(nowFraction(now, 7, 22)).toBeCloseTo(330 / 900);
  expect(nowFraction(new Date(2026, 9, 28, 6, 59), 7, 22)).toBeNull();
  expect(nowFraction(new Date(2026, 9, 28, 22, 1), 7, 22)).toBeNull();
});
