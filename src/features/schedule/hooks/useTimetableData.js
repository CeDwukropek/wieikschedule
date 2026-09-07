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

export function useTimetableData(savedSettings) {
  const [timetableOptions, setTimetableOptions] = useState(() =>
    getCachedTimetableOptions(),
  );

  const defaultScheduleId = useMemo(
    () => timetableOptions[0]?.id || "",
    [timetableOptions],
  );

  const [currentSchedule, setCurrentSchedule] = useState(
    savedSettings?.currentSchedule ?? defaultScheduleId,
  );

  const [loadedTimetables, setLoadedTimetables] = useState(() => {
    const initial = {};
    const initialId = savedSettings?.currentSchedule ?? defaultScheduleId;
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

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setScheduleRefreshTick((value) => value + 1);
    }, SCHEDULE_REFRESH_CHECK_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
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
          return normalizedOptions[0].id;
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

  useEffect(() => {
    if (savedSettings?.currentSchedule != null) setCurrentSchedule(savedSettings.currentSchedule);
  }, [savedSettings]);

  useEffect(() => {
    let active = true;
    const targetId = currentSchedule || defaultScheduleId;
    if (!targetId) return () => {};

    const hasLoadedTarget = Boolean(loadedTimetables[targetId]);
    const shouldRefreshLoadedTarget =
      hasLoadedTarget && isCachedTimetableStale(targetId);
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
        setLoadedTimetables((prev) => {
          if (prev[targetId] === timetable) return prev;
          return { ...prev, [targetId]: timetable };
        });
      })
      .finally(() => {
        if (scheduleLoadRequestIdRef.current === requestId) {
          setIsScheduleLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [currentSchedule, defaultScheduleId, loadedTimetables, scheduleRefreshTick]);

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
      const shouldRefreshLoadedReference =
        hasLoadedReference && isCachedTimetableStale(scheduleId);
      if (hasLoadedReference && !shouldRefreshLoadedReference) return;

      loadTimetableById(scheduleId, {
        forceRefresh: shouldRefreshLoadedReference,
      }).then((timetable) => {
        if (!active || !timetable) return;
        setLoadedTimetables((prev) => {
          if (prev[scheduleId] === timetable) return prev;
          return { ...prev, [scheduleId]: timetable };
        });
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
