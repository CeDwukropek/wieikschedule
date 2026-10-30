import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  areCachedTimetableOptionsStale,
  getCachedTimetableById,
  getCachedTimetableOptions,
  isCachedTimetableStale,
  loadAllTimetableOptions,
  loadTimetableById,
  TIMETABLE_REFRESH_INTERVAL_MS,
} from "../data/timetableApi";
import { isSupabaseConfigured } from "../../../lib/supabaseClient";

const SCHEDULE_LOAD_RETRY_COOLDOWN_MS = 15000;
const SCHEDULE_REFRESH_CHECK_INTERVAL_MS = Math.min(
  60 * 1000,
  TIMETABLE_REFRESH_INTERVAL_MS,
);

// settingsLoading: the saved plan may still arrive (account settings); the first plan is not loaded meanwhile.
export function useTimetableData(savedSettings, { settingsLoading = false } = {}) {
  const [timetableOptions, setTimetableOptions] = useState(() =>
    getCachedTimetableOptions(),
  );

  const defaultScheduleId = useMemo(
    () => timetableOptions[0]?.id || "",
    [timetableOptions],
  );

  const [currentSchedule, setCurrentSchedule] = useState(
    savedSettings?.currentSchedule ?? (settingsLoading ? "" : defaultScheduleId),
  );

  const [loadedTimetables, setLoadedTimetables] = useState(() => {
    const initial = {};
    const initialId = savedSettings?.currentSchedule ?? (settingsLoading ? "" : defaultScheduleId);
    if (initialId) {
      const cached = getCachedTimetableById(initialId);
      if (cached) initial[initialId] = cached;
    }
    return initial;
  });

  const [isScheduleLoading, setIsScheduleLoading] = useState(false);

  const [isScheduleRefreshing, setIsScheduleRefreshing] = useState(false);

  const manualRefreshRef = useRef(false);

  const [isTimetableOptionsLoading, setIsTimetableOptionsLoading] =
    useState(false);

  const [hasLoadedTimetableOptions, setHasLoadedTimetableOptions] =
    useState(false);

  const [scheduleRefreshTick, setScheduleRefreshTick] = useState(0);

  const scheduleLoadRequestIdRef = useRef(0);

  // A tab in the background does not refresh; it catches up as soon as it is shown again.
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState !== "hidden") setScheduleRefreshTick((value) => value + 1);
    };
    const intervalId = window.setInterval(tick, SCHEDULE_REFRESH_CHECK_INTERVAL_MS);
    document.addEventListener("visibilitychange", tick);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", tick);
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedTimetableOptions) return () => {};
    if (!areCachedTimetableOptionsStale()) return () => {};

    let active = true;
    loadAllTimetableOptions({ forceRefresh: true })
      .then((options) => {
        if (!active) return;
        setTimetableOptions(Array.isArray(options) ? options : []);
      })
      .catch((err) => {
        if (!active) return;
        console.error("[schedule] Failed to refresh timetable options", err);
      });

    return () => {
      active = false;
    };
  }, [hasLoadedTimetableOptions, scheduleRefreshTick]);

  useEffect(() => {
    let active = true;
    setIsTimetableOptionsLoading(true);

    loadAllTimetableOptions()
      .then((options) => {
        if (!active) return;
        const normalizedOptions = Array.isArray(options) ? options : [];
        setTimetableOptions(normalizedOptions);

        setCurrentSchedule((prev) => {
          const current = String(prev || "").trim();
          if (!normalizedOptions.length) {
            return current;
          }

          const exists = normalizedOptions.some(
            (option) => option.id === current,
          );
          if (exists) return current;
          // No choice yet: the default is picked once the settings are known (below).
          return current ? normalizedOptions[0].id : current;
        });
      })
      .catch((err) => {
        if (!active) return;
        console.error("[schedule] Failed to load timetable options", err);
      })
      .finally(() => {
        if (!active) return;
        setHasLoadedTimetableOptions(true);
        setIsTimetableOptionsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const timetableOptionsMessage = useMemo(() => {
    if (!isSupabaseConfigured) {
      return "Brak konfiguracji Supabase (REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_ANON_KEY).";
    }

    if (isTimetableOptionsLoading) {
      return "Ładowanie listy planów...";
    }

    if (hasLoadedTimetableOptions && timetableOptions.length === 0) {
      return "Nie znaleziono planów w bazie Supabase (tabela events).";
    }

    return "";
  }, [hasLoadedTimetableOptions, isTimetableOptionsLoading, timetableOptions]);

  const failedScheduleLoadsRef = useRef(new Map());
  // Freshness of the displayed data must not depend solely on persistent cache.
  // Updating loadedTimetables reruns loading effects, so track successful loads
  // independently to avoid immediately fetching the same plan again.
  const successfulScheduleLoadsRef = useRef(new Map());

  useEffect(() => {
    if (savedSettings?.currentSchedule != null) setCurrentSchedule(savedSettings.currentSchedule);
  }, [savedSettings]);
  // Someone without a saved plan sees the first one, but only once their settings are known.
  useEffect(() => {
    if (!settingsLoading && !currentSchedule && savedSettings?.currentSchedule == null && defaultScheduleId) {
      setCurrentSchedule(defaultScheduleId);
    }
  }, [settingsLoading, currentSchedule, defaultScheduleId, savedSettings]);

  useEffect(() => {
    let active = true;
    // The saved plan is about to be set (or the settings are still loading): never the first plan meanwhile.
    const waiting = settingsLoading || savedSettings?.currentSchedule != null;
    const targetId = currentSchedule || (waiting ? "" : defaultScheduleId);
    if (!targetId) return () => {};

    const hasLoadedTarget = Boolean(loadedTimetables[targetId]);
    const loadedAt = successfulScheduleLoadsRef.current.get(targetId);
    const recentlyLoaded = Number.isFinite(loadedAt) &&
      Date.now() - loadedAt < TIMETABLE_REFRESH_INTERVAL_MS;
    const shouldRefreshLoadedTarget =
      !recentlyLoaded && isCachedTimetableStale(targetId);
    if (hasLoadedTarget && !shouldRefreshLoadedTarget) return () => {};

    const lastFailedAt = failedScheduleLoadsRef.current.get(targetId);
    if (
      Number.isFinite(lastFailedAt) &&
      Date.now() - Number(lastFailedAt) < SCHEDULE_LOAD_RETRY_COOLDOWN_MS
    ) {
      return () => {};
    }

    const requestId = scheduleLoadRequestIdRef.current + 1;
    scheduleLoadRequestIdRef.current = requestId;

    setIsScheduleLoading(true);
    loadTimetableById(targetId, { forceRefresh: shouldRefreshLoadedTarget })
      .then((timetable) => {
        if (!active) return;

        if (!timetable) {
          failedScheduleLoadsRef.current.set(targetId, Date.now());
          return;
        }

        failedScheduleLoadsRef.current.delete(targetId);
        successfulScheduleLoadsRef.current.set(targetId, Date.now());
        setLoadedTimetables((prev) => {
          if (prev[targetId] === timetable) return prev;
          return { ...prev, [targetId]: timetable };
        });
      })
      .catch((error) => {
        if (!active) return;
        failedScheduleLoadsRef.current.set(targetId, Date.now());
        console.error("[schedule] Failed to load timetable", error);
      })
      .finally(() => {
        if (scheduleLoadRequestIdRef.current === requestId) {
          setIsScheduleLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [currentSchedule, defaultScheduleId, loadedTimetables, scheduleRefreshTick, settingsLoading, savedSettings]);

  const currentTimetable = useMemo(
    () =>
      loadedTimetables[currentSchedule] ||
      loadedTimetables[defaultScheduleId] || {
        id: currentSchedule || defaultScheduleId || "",
        name: currentSchedule || defaultScheduleId || "",
        schedule: [],
        subjects: {},
        groups: [],
        minDate: null,
        maxDate: null,
      },
    [loadedTimetables, currentSchedule, defaultScheduleId],
  );

  const timetableDataSourceLabel = useMemo(() => {
    if (isTimetableOptionsLoading || isScheduleLoading) {
      return "Supabase · ładowanie";
    }

    return "";
  }, [isScheduleLoading, isTimetableOptionsLoading]);

  const refreshSchedules = useCallback(async (activeExternalSelections = []) => {
    if (manualRefreshRef.current || !currentSchedule) return;
    if (!isSupabaseConfigured) {
      throw new Error("Brak połączenia ze źródłem planu.");
    }
    manualRefreshRef.current = true;
    setIsScheduleRefreshing(true);
    try {
      const ids = [...new Set([
        currentSchedule,
        ...activeExternalSelections.map((item) => item.scheduleId),
      ].filter(Boolean))];
      const results = await Promise.allSettled(
        ids.map((id) => loadTimetableById(id, { forceRefresh: true })),
      );
      const updates = {};
      results.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value) {
          updates[ids[index]] = result.value;
          failedScheduleLoadsRef.current.delete(ids[index]);
          successfulScheduleLoadsRef.current.set(ids[index], Date.now());
        }
      });
      setLoadedTimetables((prev) => ({ ...prev, ...updates }));
      if (Object.keys(updates).length !== ids.length) {
        throw new Error("Nie udało się odświeżyć całego planu. Spróbuj ponownie.");
      }
    } finally {
      manualRefreshRef.current = false;
      setIsScheduleRefreshing(false);
    }
  }, [currentSchedule]);

  const loadExternalTimetables = useCallback((activeExternalSelections) => {
    let active = true;
    const referencedScheduleIds = Array.from(
      new Set(
        (activeExternalSelections || [])
          .map((item) => String(item?.scheduleId || "").trim())
          .filter(Boolean)
          .filter((id) => id !== currentSchedule),
      ),
    );

    if (!referencedScheduleIds.length) return () => {};

    referencedScheduleIds.forEach((scheduleId) => {
      const hasLoadedReference = Boolean(loadedTimetables[scheduleId]);
      const loadedAt = successfulScheduleLoadsRef.current.get(scheduleId);
      const recentlyLoaded = Number.isFinite(loadedAt) &&
        Date.now() - loadedAt < TIMETABLE_REFRESH_INTERVAL_MS;
      const shouldRefreshLoadedReference =
        !recentlyLoaded && isCachedTimetableStale(scheduleId);
      if (hasLoadedReference && !shouldRefreshLoadedReference) return;
      const lastFailedAt = failedScheduleLoadsRef.current.get(scheduleId);
      if (Number.isFinite(lastFailedAt) &&
          Date.now() - lastFailedAt < SCHEDULE_LOAD_RETRY_COOLDOWN_MS) return;

      loadTimetableById(scheduleId, {
        forceRefresh: shouldRefreshLoadedReference,
      }).then((timetable) => {
        if (!active) return;
        if (!timetable) {
          failedScheduleLoadsRef.current.set(scheduleId, Date.now());
          return;
        }
        failedScheduleLoadsRef.current.delete(scheduleId);
        successfulScheduleLoadsRef.current.set(scheduleId, Date.now());
        setLoadedTimetables((prev) => {
          if (prev[scheduleId] === timetable) return prev;
          return { ...prev, [scheduleId]: timetable };
        });
      }).catch((error) => {
        if (!active) return;
        failedScheduleLoadsRef.current.set(scheduleId, Date.now());
        console.error("[schedule] Failed to load external timetable", error);
      });
    });

    return () => {
      active = false;
    };
  }, [currentSchedule, loadedTimetables]);

  const handleScheduleChange = useCallback((scheduleId) => {
    const normalizedId = String(scheduleId || "").trim();
    if (normalizedId) {
      failedScheduleLoadsRef.current.delete(normalizedId);
    }
    setCurrentSchedule(normalizedId);
  }, []);

  return {
    timetableOptions, timetableOptionsMessage, timetableDataSourceLabel,
    currentSchedule, currentTimetable, loadedTimetables,
    isScheduleLoading, isScheduleRefreshing,
    refreshSchedules, loadExternalTimetables, handleScheduleChange,
    refreshTick: scheduleRefreshTick,
  };
}
