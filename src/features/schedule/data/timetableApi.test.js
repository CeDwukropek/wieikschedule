import { loadTimetableById } from "./timetableApi";
import { storeTimetable } from "./timetableCache";

jest.mock("../../../lib/supabaseClient", () => ({ supabase: null }));

test("an unconfigured source cannot fabricate a successfully loaded empty timetable", async () => {
  expect(await loadTimetableById("EiAs1")).toBeNull();
  expect(await loadTimetableById("EiAs1", { forceRefresh: true })).toBeNull();
});

test("cached timetables remain available when the source is unconfigured", async () => {
  const cached = { id: "EiAs3", name: "EiAs3", schedule: [], groups: [], subjects: {} };
  storeTimetable("EiAs3", cached);
  expect(await loadTimetableById("EiAs3")).toBe(cached);
  expect(await loadTimetableById("EiAs3", { forceRefresh: true })).toBe(cached);
});
