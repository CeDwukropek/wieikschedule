import { useMemo, useEffect } from "react";
import { useUserId } from "./useUserId";

export function useSettings(settings) {
  const userId = useUserId();

  const SETTINGS_KEY = useMemo(
    () => `wieikschedule.${userId}.settings`,
    [userId],
  );

  // Load saved settings on mount
  const savedSettings = useMemo(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error("Failed to load settings:", e);
    }
    return null;
  }, [SETTINGS_KEY]);

  // Persist settings whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error("Failed to save settings:", e);
    }
  }, [settings, SETTINGS_KEY]);

  return savedSettings;
}
