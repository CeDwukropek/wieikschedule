import { act, renderHook } from "@testing-library/react";
import { onSnapshot, setDoc } from "firebase/firestore";
import { useSettings, usePersistSettings } from "./useSettings";
import { useGroupSets } from "../schedule/hooks/useGroupSets";

let mockAuth;
jest.mock("../auth/useFirebaseAuth", () => ({ useFirebaseAuth: () => mockAuth }));
jest.mock("../auth/useGuestId", () => ({ useGuestId: () => "guest" }));
jest.mock("../../lib/firebaseClient", () => ({ db: {} }));
jest.mock("firebase/firestore", () => ({
  doc: (_db, collection, uid) => `${collection}/${uid}`,
  onSnapshot: jest.fn(), setDoc: jest.fn(), serverTimestamp: () => "server-time",
}));

const configs = [{ type: "Ć", prefix: "Ć" }];
const cloudSettings = {
  scheduleGroupSets: { main: { sets: [{ id: "custom", name: "Saved on A", groups: { "Ć": "Ć5" }, externalSelections: [] }] } },
  activeGroupSetBySchedule: { main: "custom" },
};
function snapshot(settings, metadata = {}) {
  return { exists: () => Boolean(settings), data: () => ({ settings }),
    metadata: { fromCache: false, hasPendingWrites: false, ...metadata } };
}
function useSyncedGroups() {
  const loaded = useSettings();
  const groups = useGroupSets({ savedSettings: loaded.savedSettings, currentSchedule: "main", groupConfigs: configs });
  usePersistSettings({ scheduleGroupSets: groups.scheduleGroupSets,
    activeGroupSetBySchedule: groups.activeGroupSetBySchedule }, !loaded.isLoading);
  return { ...loaded, ...groups };
}
const tick = () => act(() => jest.advanceTimersByTime(300));
const deliver = (value, index = 0) => act(() => onSnapshot.mock.calls[index][2](value));

beforeEach(() => {
  jest.useFakeTimers();
  localStorage.clear();
  jest.clearAllMocks();
  mockAuth = { user: { uid: "account-a" }, isConfigured: true, isLoading: false };
  onSnapshot.mockImplementation(() => jest.fn());
  setDoc.mockResolvedValue(undefined);
});
afterEach(() => jest.useRealTimers());

test("device B cannot overwrite cloud sets before server hydration and saves hydrated groups", async () => {
  const { result } = renderHook(useSyncedGroups);
  tick();
  expect(setDoc).not.toHaveBeenCalled();
  deliver(snapshot(null, { fromCache: true }));
  tick();
  expect(setDoc).not.toHaveBeenCalled();
  deliver(snapshot(cloudSettings));
  expect(result.current.activeGroupSetName).toBe("Saved on A");
  tick();
  await act(async () => {});
  expect(setDoc).toHaveBeenCalledWith("userSettings/account-a", {
    settings: cloudSettings, updatedAt: "server-time",
  });
  expect(setDoc).toHaveBeenCalledTimes(1);
});

test("auth restoration blocks guest persistence", () => {
  mockAuth = { ...mockAuth, user: null, isLoading: true };
  renderHook(useSyncedGroups);
  tick();
  expect(localStorage.getItem("wieikschedule.guest.settings")).toBeNull();
  expect(setDoc).not.toHaveBeenCalled();
});

test("switching accounts clears old sets and waits for the new account", () => {
  const { result, rerender } = renderHook(useSyncedGroups);
  deliver(snapshot(cloudSettings));
  mockAuth = { ...mockAuth, user: { uid: "account-b" } };
  rerender();
  tick();
  expect(setDoc).not.toHaveBeenCalled();
  expect(result.current.activeGroupSetName).toBe("Zestaw 1");
  expect(result.current.isLoading).toBe(true);
  deliver(snapshot(null), 1);
  tick();
  expect(setDoc.mock.calls[0][0]).toBe("userSettings/account-b");
  expect(setDoc.mock.calls[0][1].settings.scheduleGroupSets.main.sets[0].groups).toEqual({ "Ć": "Ć1" });
});

test("server updates propagate but acknowledgements of local writes do not rehydrate", () => {
  const { result } = renderHook(useSyncedGroups);
  deliver(snapshot(cloudSettings));
  const initial = result.current.savedSettings;
  deliver(snapshot({ activeGroupSetBySchedule: cloudSettings.activeGroupSetBySchedule,
    scheduleGroupSets: cloudSettings.scheduleGroupSets }));
  expect(result.current.savedSettings).toBe(initial);
  const changed = { ...cloudSettings, activeGroupSetBySchedule: { main: "different" } };
  deliver(snapshot(changed));
  expect(result.current.savedSettings).toEqual(changed);
});

test("a failed initial server read cannot enable destructive cloud writes", () => {
  const log = jest.spyOn(console, "error").mockImplementation(() => {});
  const { result } = renderHook(useSyncedGroups);
  act(() => onSnapshot.mock.calls[0][3](new Error("permission-denied")));
  tick();
  expect(result.current.isLoading).toBe(true);
  expect(setDoc).not.toHaveBeenCalled();
  log.mockRestore();
});
