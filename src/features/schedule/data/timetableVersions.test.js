import { loadAllTimetableOptions, loadTimetableById } from "./timetableApi";

const mockSource = { versions: [], events: [], calls: [] };
// Chainable Supabase double: records each request and resolves it when awaited.
jest.mock("../../../lib/supabaseClient", () => ({
  supabase: {
    from(table) {
      const request = { table, ops: [] };
      mockSource.calls.push(request);
      const chain = new Proxy({}, {
        get(_target, key) {
          if (key === "then") {
            const range = request.ops.find(([name]) => name === "range");
            const rows = table === "timetable_versions" ? mockSource.versions
              : range ? mockSource.events.slice(range[1], range[2] + 1) : mockSource.events;
            return (resolve) => resolve({ data: rows, error: null });
          }
          return (...args) => { request.ops.push([key, ...args]); return chain; };
        },
      });
      return chain;
    },
  },
}));

const event = (index) => ({
  id: `00000000-0000-0000-0000-${String(index).padStart(12, "0")}`, faculty: "EiAs1",
  date: "2026-10-05", start_time: "08:00", duration_min: 90, subject: `Przedmiot ${index}`,
  instructor: "", room: "1", group: "W", type: "Wykład", status: "aktywne",
});
let now = 0;
const later = () => { now += 60 * 1000; };
const eventRequests = () => mockSource.calls.filter(call => call.table === "events");

beforeEach(() => {
  localStorage.clear();
  mockSource.calls = [];
  mockSource.versions = [{ faculty: "EiAs1", version: 3 }, { faculty: "all", version: 1 }, { faculty: "EiAs3", version: 1 }];
  mockSource.events = Array.from({ length: 1203 }, (_value, index) => event(index));
  jest.spyOn(Date, "now").mockImplementation(() => now);
  later();
});
afterEach(() => jest.restoreAllMocks());

test("a plan larger than one API page is read completely", async () => {
  const timetable = await loadTimetableById("EiAs1", { forceRefresh: true });
  expect(timetable.rawRows).toHaveLength(1203);
  expect(eventRequests().map(call => call.ops.find(([name]) => name === "range"))).toEqual([
    ["range", 0, 999], ["range", 1000, 1999],
  ]);
});

test("an unchanged plan is not downloaded again; a changed one is", async () => {
  const first = await loadTimetableById("EiAs3", { forceRefresh: true });
  expect(eventRequests()).toHaveLength(2);
  later();
  expect(await loadTimetableById("EiAs3", { forceRefresh: true })).toBe(first);
  expect(eventRequests()).toHaveLength(2);
  // A change to classes shared by every plan also counts.
  mockSource.versions = mockSource.versions.map(row => row.faculty === "all" ? { ...row, version: 2 } : row);
  later();
  expect(await loadTimetableById("EiAs3", { forceRefresh: true })).not.toBe(first);
  expect(eventRequests()).toHaveLength(4);
});

test("the plan list comes from versions, without the shared 'all' entry", async () => {
  expect(await loadAllTimetableOptions({ forceRefresh: true })).toEqual([
    { id: "EiAs1", name: "EiAs1" }, { id: "EiAs3", name: "EiAs3" },
  ]);
  expect(eventRequests()).toHaveLength(0);
});
