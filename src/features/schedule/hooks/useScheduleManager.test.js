import { act, renderHook, waitFor } from "@testing-library/react";
import { useScheduleManager } from "./useScheduleManager";
import { getCachedTimetableById, getCachedTimetableOptions, loadAllTimetableOptions, loadTimetableById, loadSharedTimetable } from "../data/timetableApi";

jest.mock("../data/timetableApi", () => ({
  getCachedTimetableById: jest.fn(), getCachedTimetableOptions: jest.fn(),
  loadAllTimetableOptions: jest.fn(), loadTimetableById: jest.fn(),
  loadSharedTimetable: jest.fn(),
  areCachedTimetableOptionsStale: () => false,
  isCachedTimetableStale: () => false,
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
  getCachedTimetableOptions.mockReturnValue([{ id: "main" }]);
  getCachedTimetableById.mockImplementation(id => id === "main" ? original : external);
  loadAllTimetableOptions.mockResolvedValue([{ id: "main" }]);
  loadTimetableById.mockResolvedValue(external);
  loadSharedTimetable.mockResolvedValue({ schedule: [] });
});

test("manual refresh bypasses cache for the active and external schedules, keeping groups", async () => {
  const { result } = renderHook(() => useScheduleManager(settings));
  await waitFor(() => expect(result.current.loadedTimetables.external).toBe(external));
  loadTimetableById.mockClear();
  const updated = { ...original, schedule: [{ id: "new" }] };
  getCachedTimetableById.mockImplementation(id => id === "main" ? updated : external);
  loadTimetableById.mockImplementation(async (id) => id === "main" ? updated : external);
  await act(async () => { await result.current.handleRefreshSchedule(); });
  expect(loadTimetableById).toHaveBeenCalledWith("main", { forceRefresh: true });
  expect(loadTimetableById).toHaveBeenCalledWith("external", { forceRefresh: true });
  expect(loadSharedTimetable).toHaveBeenCalledWith({ forceRefresh: true });
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

test("catalog failures show the read error instead of claiming no schedules exist", async () => {
  getCachedTimetableOptions.mockReturnValue([]);
  const message = "Brak uprawnień do odczytu listy harmonogramów.";
  loadAllTimetableOptions.mockRejectedValue(new Error(message));
  const log = jest.spyOn(console, "error").mockImplementation(() => {});
  try {
    const { result } = renderHook(() => useScheduleManager(null));
    await waitFor(() => expect(result.current.timetableOptionsMessage).toBe(message));
  } finally {
    log.mockRestore();
  }
});
