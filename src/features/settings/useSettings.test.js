import { act, renderHook } from "@testing-library/react";
import { usePersistSettings } from "./useSettings";
import { setDoc } from "firebase/firestore";
import { useFirebaseAuth } from "../auth/useFirebaseAuth";

jest.mock("firebase/firestore", () => ({ doc: (...args) => args, setDoc: jest.fn(), serverTimestamp: () => "now" }));
jest.mock("../../lib/firebaseClient", () => ({ db: {} }));
jest.mock("../auth/useGuestId", () => ({ useGuestId: () => "guest" }));
jest.mock("../auth/useFirebaseAuth", () => ({ useFirebaseAuth: jest.fn() }));

beforeEach(() => {
  jest.useFakeTimers(); jest.clearAllMocks(); localStorage.clear();
  useFirebaseAuth.mockReturnValue({ user: { uid: "a" }, isConfigured: true });
  setDoc.mockResolvedValue();
});
afterEach(() => jest.useRealTimers());

test("rapid changes stay local immediately and produce one cloud write with the latest settings", async () => {
  const { rerender } = renderHook(settings => usePersistSettings(settings), { initialProps: { weekOffset: 0 } });
  act(() => jest.advanceTimersByTime(400));
  rerender({ weekOffset: 1 });
  act(() => jest.advanceTimersByTime(400));
  rerender({ weekOffset: 2 });
  expect(JSON.parse(localStorage.getItem("wieikschedule.a.settings"))).toEqual({ weekOffset: 2 });
  expect(setDoc).not.toHaveBeenCalled();
  await act(async () => jest.advanceTimersByTime(800));
  expect(setDoc).toHaveBeenCalledTimes(1);
  expect(setDoc.mock.calls[0][1].settings).toEqual({ weekOffset: 2 });
});

test("a structurally identical rerender does not cancel the pending write", async () => {
  const { rerender } = renderHook(settings => usePersistSettings(settings), { initialProps: { weekOffset: 1 } });
  act(() => jest.advanceTimersByTime(400));
  rerender({ weekOffset: 1 });
  await act(async () => jest.advanceTimersByTime(400));
  expect(setDoc).toHaveBeenCalledTimes(1);
});

test("pagehide flushes once and a user switch cancels the previous user's pending save", async () => {
  const { rerender } = renderHook(settings => usePersistSettings(settings), { initialProps: { weekOffset: 1 } });
  useFirebaseAuth.mockReturnValue({ user: { uid: "b" }, isConfigured: true });
  rerender({ weekOffset: 2 });
  await act(async () => window.dispatchEvent(new Event("pagehide")));
  await act(async () => jest.advanceTimersByTime(800));
  expect(setDoc).toHaveBeenCalledTimes(1);
  expect(setDoc.mock.calls[0][0][2]).toBe("b");
});

test("reverting settings while a different save is in flight preserves the newest choice", async () => {
  const { rerender } = renderHook(settings => usePersistSettings(settings), { initialProps: { weekOffset: 1 } });
  await act(async () => jest.advanceTimersByTime(800));
  let finish;
  setDoc.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  rerender({ weekOffset: 2 });
  await act(async () => jest.advanceTimersByTime(800));
  rerender({ weekOffset: 1 });
  await act(async () => jest.advanceTimersByTime(800));
  expect(setDoc).toHaveBeenCalledTimes(2);
  await act(async () => finish());
  expect(setDoc).toHaveBeenCalledTimes(3);
  expect(setDoc.mock.calls[2][1].settings).toEqual({ weekOffset: 1 });
});
