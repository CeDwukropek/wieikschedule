import { act, renderHook, waitFor } from "@testing-library/react";
import { useMyPlanEvents } from "./useMyPlanEvents";
import { getAddedEventsFromMyPlan, removeAddedEventFromMyPlan } from "./myPlanApi";
import { writeMyPlanCache, readMyPlanCache, isMyPlanCacheStale } from "./myPlanCache";

jest.mock("./myPlanApi", () => ({ getAddedEventsFromMyPlan: jest.fn(), removeAddedEventFromMyPlan: jest.fn() }));
const props = { scheduleName: "A", scopeId: "user-a", enabled: true, viewMode: "week",
  viewedWeekStart: new Date("2026-09-07T12:00:00"), selectedDayWeekStart: new Date("2026-09-14T12:00:00") };
const slot = { event_id: "event", date: "2026-09-07", start_time: "08:00", duration_min: 90, subject: "Test" };

beforeEach(() => {
  localStorage.clear(); jest.clearAllMocks();
  getAddedEventsFromMyPlan.mockResolvedValue({ events: [] });
  removeAddedEventFromMyPlan.mockResolvedValue({ ok: true });
});
afterEach(() => jest.restoreAllMocks());

test("only fetches the visible week and reuses fresh weeks, including empty results", async () => {
  const { result, rerender } = renderHook(p => useMyPlanEvents(p), { initialProps: props });
  await waitFor(() => expect(result.current.addedEventsByWeek["2026-09-07"]).toEqual([]));
  expect(getAddedEventsFromMyPlan).toHaveBeenCalledTimes(1);
  rerender({ ...props, viewMode: "day" });
  await waitFor(() => expect(result.current.addedEventsByWeek["2026-09-14"]).toEqual([]));
  rerender(props);
  expect(getAddedEventsFromMyPlan).toHaveBeenCalledTimes(2);
  act(() => result.current.refresh());
  await waitFor(() => expect(getAddedEventsFromMyPlan).toHaveBeenCalledTimes(3));
  expect(getAddedEventsFromMyPlan.mock.calls[2][0].forceRefresh).toBe(true);
});

test("cache hydration does not extend freshness and users cannot reuse each other's cache", async () => {
  const now = Date.now();
  const clock = jest.spyOn(Date, "now").mockReturnValue(now);
  writeMyPlanCache("user-a", "A", "2026-09-07", []);
  clock.mockReturnValue(now + 59000);
  const { result, rerender } = renderHook(p => useMyPlanEvents(p), { initialProps: props });
  expect(result.current.addedEventsByWeek["2026-09-07"]).toEqual([]);
  expect(getAddedEventsFromMyPlan).not.toHaveBeenCalled();
  clock.mockReturnValue(now + 61000);
  expect(isMyPlanCacheStale("user-a", "A", "2026-09-07")).toBe(true);
  rerender({ ...props, scopeId: "user-b" });
  await waitFor(() => expect(getAddedEventsFromMyPlan).toHaveBeenCalledTimes(1));
});

test("successful mutations update a fresh week without an extra read; optimistic data is not persisted", async () => {
  writeMyPlanCache("user-a", "A", "2026-09-07", []);
  const { result } = renderHook(() => useMyPlanEvents(props));
  let optimistic;
  act(() => { optimistic = result.current.optimisticAdd(slot); });
  expect(readMyPlanCache("user-a", "A", "2026-09-07")).toEqual([]);
  act(() => result.current.confirmAdd({ temporaryAddedEventId: optimistic.added_event_id,
    confirmedAddedEvent: { id: "added", event_id: "event", status: "active" } }));
  expect(readMyPlanCache("user-a", "A", "2026-09-07")[0].added_event_id).toBe("added");
  await act(async () => { await result.current.removeEvent("added"); });
  expect(readMyPlanCache("user-a", "A", "2026-09-07")).toEqual([]);
  expect(getAddedEventsFromMyPlan).not.toHaveBeenCalled();
});

test("a failed removal restores the event and forces reconciliation", async () => {
  writeMyPlanCache("user-a", "A", "2026-09-07", [{ added_event_id: "added", dates: ["2026-09-07"] }]);
  removeAddedEventFromMyPlan.mockRejectedValue(new Error("offline"));
  getAddedEventsFromMyPlan.mockRejectedValue(new Error("offline"));
  const { result } = renderHook(() => useMyPlanEvents(props));
  await act(async () => { await expect(result.current.removeEvent("added")).rejects.toThrow("offline"); });
  expect(result.current.addedEventsByWeek["2026-09-07"][0].added_event_id).toBe("added");
  expect(getAddedEventsFromMyPlan).toHaveBeenCalledTimes(1);
});
