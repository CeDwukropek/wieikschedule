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

test("device B cannot overwrite cloud sets before server hydration and does not write them back unchanged", async () => {
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
  expect(setDoc).not.toHaveBeenCalled();
  act(() => result.current.handleGroupChange("Ć", "Ć7"));
  tick();
  await act(async () => {});
  expect(setDoc).toHaveBeenCalledTimes(1);
  expect(setDoc.mock.calls[0][1].settings.scheduleGroupSets.main.sets[0].groups).toEqual({ "Ć": "Ć7" });
});

test("the viewed week stays on this device and is never written to the cloud", async () => {
  function useWeek({ weekOffset }) {
    const loaded = useSettings();
    usePersistSettings({ ...cloudSettings, weekOffset }, !loaded.isLoading);
    return loaded;
  }
  const { result, rerender } = renderHook(useWeek, { initialProps: { weekOffset: 0 } });
  deliver(snapshot({ ...cloudSettings, weekOffset: 7 }));
  expect(result.current.savedSettings.weekOffset).toBeUndefined();
  for (const weekOffset of [1, 2, 3]) {
    rerender({ weekOffset });
    tick();
    await act(async () => {});
  }
  expect(setDoc).not.toHaveBeenCalled();
  expect(JSON.parse(localStorage.getItem("wieikschedule.account-a.settings")).weekOffset).toBe(3);
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

test("while the session is restored, the last account's saved settings are used, not a guest's", () => {
  localStorage.clear();
  localStorage.setItem("wieikschedule.lastAccount", "user-a");
  localStorage.setItem("wieikschedule.user-a.settings", JSON.stringify({ currentSchedule: "EiAs3" }));
  localStorage.setItem("wieikschedule.guest.settings", JSON.stringify({ currentSchedule: "AwP4.0s2" }));
  mockAuth = { user: null, isLoading: true, isConfigured: true };
  const { result, rerender } = renderHook(() => useSettings());
  expect(result.current.savedSettings.currentSchedule).toBe("EiAs3");
  expect(result.current.isLoading).toBe(true);
  // Signed out meanwhile: the guest's settings, and the device forgets the account.
  mockAuth = { user: null, isLoading: false, isConfigured: true };
  rerender();
  expect(result.current.savedSettings.currentSchedule).toBe("AwP4.0s2");
  expect(localStorage.getItem("wieikschedule.lastAccount")).toBeNull();
});
