import { useMemo } from "react";

const USER_KEY = "wieikschedule.userId";

function generateUserId() {
  try {
    let id = localStorage.getItem(USER_KEY);
    if (!id) {
      id =
        (typeof crypto !== "undefined" &&
          crypto.randomUUID &&
          crypto.randomUUID()) ||
        `u${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem(USER_KEY, id);
    }
    return id;
  } catch (e) {
    return "default";
  }
}

export function useUserId() {
  return useMemo(() => generateUserId(), []);
}
