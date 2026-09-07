jest.mock("../../../lib/supabaseClient", () => ({ supabase: { from: jest.fn() } }));

const row = (id, faculty, subject, status = "aktywne") => ({
  id, faculty, subject, status, date: "2026-09-07", start_time: "08:00", duration_min: 90,
  type: "laboratorium", group: "L1",
});

let api, cache, from, queries, catalogResult;
beforeEach(() => {
  jest.resetModules();
  localStorage.clear();
  api = require("./timetableApi");
  cache = require("./timetableCache");
  from = require("../../../lib/supabaseClient").supabase.from;
  queries = [];
  catalogResult = null;
  from.mockImplementation(table => {
    const query = { table };
    queries.push(query);
    const builder = {
      select: jest.fn(() => builder),
      eq: jest.fn((key, value) => { query[key] = value; return builder; }),
      or: jest.fn(() => builder), order: jest.fn(() => builder),
      then: (resolve, reject) => Promise.resolve(table === "faculties" && catalogResult ? catalogResult : { data: table === "faculties"
        ? [{ short_name: "A", name: "Kierunek A" }, { short_name: "all", name: "Wspólne" }]
        : [row(query.faculty, query.faculty, "Same subject", query.faculty === "all" ? "wolne" : "aktywne")]
      }).then(resolve, reject),
    };
    return builder;
  });
});

test("read permission failures are reported and do not replace a confirmed catalog with an empty list", async () => {
  await api.loadAllTimetableOptions();
  catalogResult = { data: null, error: { code: "42501", message: "permission denied for table faculties" } };
  const log = jest.spyOn(console, "error").mockImplementation(() => {});
  try {
    await expect(api.loadAllTimetableOptions({ forceRefresh: true })).rejects.toMatchObject({ code: "42501" });
    expect(cache.getCachedTimetableOptions()).toEqual([{ id: "A", name: "Kierunek A" }]);
  } finally {
    log.mockRestore();
  }
});

test("an empty RLS response is retried on the next load, including an empty result saved by older code", async () => {
  cache.storeTimetableOptions([]);
  catalogResult = { data: [], error: null };
  expect(await api.loadAllTimetableOptions()).toEqual([]);
  catalogResult = { data: [{ short_name: "A", name: "Kierunek A" }], error: null };
  expect(await api.loadAllTimetableOptions()).toEqual([{ id: "A", name: "Kierunek A" }]);
  expect(queries).toHaveLength(2);
});

test("loads the catalog only from faculties and does not derive options from cached events", async () => {
  expect(await api.loadAllTimetableOptions()).toEqual([{ id: "A", name: "Kierunek A" }]);
  expect(queries).toEqual([{ table: "faculties" }]);
  await api.loadTimetableById("B");
  expect(cache.getCachedTimetableOptions()).toEqual([{ id: "A", name: "Kierunek A" }]);
});

test("concurrent schedules share one global request and one persistent global cache", async () => {
  const [a, b] = await Promise.all([api.loadTimetableById("A"), api.loadTimetableById("B")]);
  expect(queries.filter(q => q.faculty === "all")).toHaveLength(1);
  expect(a.schedule).toHaveLength(2);
  expect(b.schedule).toHaveLength(2);
  expect(a.schedule[1]).toBe(b.schedule[1]);
  expect(a.schedule[1].subj).not.toBe(a.schedule[0].subj);
  expect(a.subjects[a.schedule[1].subj].name).toBe("Same subject");
  expect(JSON.parse(localStorage.getItem("wieik:timetable:v3:A")).data.schedule).toHaveLength(1);
  expect(api.getCachedTimetableById("A")).toBe(a);
  await api.loadTimetableById("C");
  expect(queries.filter(q => q.faculty === "all")).toHaveLength(1);
});

test("a shared refresh updates composed caches and external selections cannot duplicate global events", async () => {
  const a = await api.loadTimetableById("A");
  await api.loadSharedTimetable({ forceRefresh: true });
  expect(api.getCachedTimetableById("A")).not.toBe(a);
  const { mergeEvents } = require("../logic/mergeEvents");
  const events = mergeEvents({ schedule: a.schedule, groups: { L: "L1" }, weekStart: new Date("2026-09-07T12:00:00"),
    externalSelections: [{ scheduleId: "B", groupType: "L", groupValue: "L1" }],
    timetables: { B: await api.loadTimetableById("B") },
  });
  expect(events.filter(event => event._isGlobal)).toHaveLength(1);
});
