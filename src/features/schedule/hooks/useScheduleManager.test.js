import { act, renderHook, waitFor } from "@testing-library/react";
import { useScheduleManager } from "./useScheduleManager";
import { getCachedTimetableById, getCachedTimetableOptions, isCachedTimetableStale, loadAllTimetableOptions, loadTimetableById } from "../data/timetableApi";

jest.mock("../data/timetableApi", () => ({
  getCachedTimetableById: jest.fn(), getCachedTimetableOptions: jest.fn(),
  loadAllTimetableOptions: jest.fn(), loadTimetableById: jest.fn(),
  areCachedTimetableOptionsStale: () => false,
  isCachedTimetableStale: jest.fn(),
  TIMETABLE_REFRESH_INTERVAL_MS: 60000,
}));
jest.mock("../../../lib/supabaseClient", () => ({ isSupabaseConfigured: true }));

const original = { id: "main", schedule: [{ id: "old" }], groups: [], subjects: {} };
const external = { id: "external", schedule: [], groups: [], subjects: {} };
const settings = {
  currentSchedule: "main",
  scheduleGroupSets: { main: { sets: [{ id: "set-1", name: "Moje grupy", groups: { Lab: "L2" }, externalSelections: [{ scheduleId: "external" }] }] } },
};

beforeEach(() => {
  jest.clearAllMocks();
  isCachedTimetableStale.mockReturnValue(false);
  getCachedTimetableOptions.mockReturnValue([{ id: "main" }]);
  getCachedTimetableById.mockReturnValue(original);
  loadAllTimetableOptions.mockResolvedValue([{ id: "main" }]);
  loadTimetableById.mockResolvedValue(external);
});

test("selecting EiAs1 from EiAs3 does not loop when loaded data has no fresh cache entry", async () => {
  const main = { ...original, id: "EiAs3" };
  const selected = { ...external, id: "EiAs1" };
  getCachedTimetableOptions.mockReturnValue([{ id: "EiAs3" }, { id: "EiAs1" }]);
  loadAllTimetableOptions.mockResolvedValue([{ id: "EiAs3" }, { id: "EiAs1" }]);
  getCachedTimetableById.mockReturnValue(main);
  isCachedTimetableStale.mockImplementation(id => id === "EiAs1");
  let calls = 0;
  // Bound the old loop so the regression test itself cannot freeze.
  loadTimetableById.mockImplementation(async () => ++calls <= 3 ? { ...selected } : null);
  const initialSettings = { currentSchedule: "EiAs3" };
  const { result } = renderHook(() => useScheduleManager(initialSettings));
  act(() => result.current.handleAddExternalSelection());
  const id = result.current.activeExternalSelections[0].id;
  act(() => result.current.handleUpdateExternalSelection(id, { scheduleId: "EiAs1" }));
  await act(async () => {});
  expect(result.current.activeExternalSelections[0].scheduleId).toBe("EiAs1");
  expect(result.current.loadedTimetables.EiAs1?.id).toBe("EiAs1");
  expect(loadTimetableById).toHaveBeenCalledTimes(1);
  expect(loadTimetableById).toHaveBeenCalledWith("EiAs1", { forceRefresh: true });
});

test("an external plan can still refresh after its in-memory freshness expires", async () => {
  jest.useFakeTimers();
  try {
    isCachedTimetableStale.mockImplementation(id => id === "external");
    loadTimetableById.mockImplementation(async () => ({ ...external }));
    const { result } = renderHook(() => useScheduleManager(settings));
    await act(async () => {});
    expect(loadTimetableById).toHaveBeenCalledTimes(1);
    await act(async () => jest.advanceTimersByTime(60000));
    expect(loadTimetableById).toHaveBeenCalledTimes(2);
    expect(loadTimetableById).toHaveBeenLastCalledWith("external", { forceRefresh: true });
    expect(result.current.loadedTimetables.external.id).toBe("external");
  } finally {
    jest.useRealTimers();
  }
});

test("failed external requests retain the selected plan, pause retries and then recover", async () => {
  jest.useFakeTimers();
  const log = jest.spyOn(console, "error").mockImplementation(() => {});
  try {
    loadTimetableById.mockRejectedValue(new Error("unavailable"));
    const { result } = renderHook(() => useScheduleManager(settings));
    await act(async () => {});
    expect(loadTimetableById).toHaveBeenCalledTimes(1);
    act(() => result.current.handleAddExternalSelection("external"));
    await act(async () => {});
    expect(loadTimetableById).toHaveBeenCalledTimes(1);
    expect(result.current.activeExternalSelections.map(item => item.scheduleId)).toEqual(["external", "external"]);
    loadTimetableById.mockResolvedValue(external);
    await act(async () => jest.advanceTimersByTime(60000));
    expect(loadTimetableById).toHaveBeenCalledTimes(2);
    expect(result.current.loadedTimetables.external).toBe(external);
  } finally {
    log.mockRestore();
    jest.useRealTimers();
  }
});

test("manual refresh bypasses cache for the active and external schedules, keeping groups", async () => {
  const { result } = renderHook(() => useScheduleManager(settings));
  await waitFor(() => expect(result.current.loadedTimetables.external).toBe(external));
  loadTimetableById.mockClear();
  const updated = { ...original, schedule: [{ id: "new" }] };
  loadTimetableById.mockImplementation(async (id) => id === "main" ? updated : external);
  await act(async () => { await result.current.handleRefreshSchedule(); });
  expect(loadTimetableById).toHaveBeenCalledWith("main", { forceRefresh: true });
  expect(loadTimetableById).toHaveBeenCalledWith("external", { forceRefresh: true });
  expect(result.current.schedule).toEqual([{ id: "new" }]);
  expect(result.current.studentGroups).toEqual({ Lab: "L2" });
  expect(result.current.isScheduleRefreshing).toBe(false);
});

test("failed refresh retains the last plan and permits retry", async () => {
  const { result } = renderHook(() => useScheduleManager(settings));
  await waitFor(() => expect(result.current.loadedTimetables.external).toBe(external));
  loadTimetableById.mockResolvedValue(null);
  await act(async () => {
    await expect(result.current.handleRefreshSchedule()).rejects.toThrow("Nie udało się odświeżyć");
  });
  expect(result.current.schedule).toBe(original.schedule);
  expect(result.current.isScheduleRefreshing).toBe(false);
  loadTimetableById.mockImplementation(async (id) => id === "main" ? original : external);
  await act(async () => { await result.current.handleRefreshSchedule(); });
  expect(result.current.isScheduleRefreshing).toBe(false);
});

test("while the account's settings load, the first plan is neither chosen nor downloaded", async () => {
  getCachedTimetableOptions.mockReturnValue([{ id: "first" }, { id: "mine" }]);
  loadAllTimetableOptions.mockResolvedValue([{ id: "first" }, { id: "mine" }]);
  getCachedTimetableById.mockReturnValue(null);
  loadTimetableById.mockImplementation(async id => ({ ...external, id }));
  const { result, rerender } = renderHook(({ saved, loading }) => useScheduleManager(saved, { settingsLoading: loading }),
    { initialProps: { saved: {}, loading: true } });
  await waitFor(() => expect(loadAllTimetableOptions).toHaveBeenCalled());
  await act(async () => {});
  expect(result.current.currentSchedule).toBe("");
  expect(loadTimetableById).not.toHaveBeenCalled();
  rerender({ saved: { currentSchedule: "mine" }, loading: false });
  await waitFor(() => expect(result.current.currentSchedule).toBe("mine"));
  expect(loadTimetableById.mock.calls.map(([id]) => id)).not.toContain("first");
});

test("without a saved plan the first one is shown once the settings are known", async () => {
  getCachedTimetableOptions.mockReturnValue([{ id: "first" }, { id: "mine" }]);
  loadAllTimetableOptions.mockResolvedValue([{ id: "first" }, { id: "mine" }]);
  const saved = {};
  const { result } = renderHook(() => useScheduleManager(saved, { settingsLoading: false }));
  await waitFor(() => expect(result.current.currentSchedule).toBe("first"));
});
