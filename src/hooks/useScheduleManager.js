import { useState, useMemo, useCallback, useEffect } from "react";
import { allTimetables as localTimetables } from "../timetables";
import { useFirebaseTimetables } from "./useFirebaseTimetables";
import { firebaseEnabled } from "../firebase/client";

// Build default groups from timetable group configurations
function buildDefaultGroupsForTimetable(timetable) {
  const groups = {};
  if (!timetable) return groups;
  if (timetable.groups && Array.isArray(timetable.groups)) {
    timetable.groups.forEach((g) => {
      groups[g.type] = g.defaultValue || `${g.prefix}1`;
    });
  }
  return groups;
}

export function useScheduleManager(savedSettings) {
  const [currentSchedule, setCurrentSchedule] = useState(
    savedSettings?.currentSchedule ?? null,
  );

  const {
    timetables: remoteTimetables,
    scheduleList,
    fetchedCache,
    loading: timetablesLoading,
  } = useFirebaseTimetables(currentSchedule);

  console.log("useScheduleManager - scheduleList:", scheduleList);

  // If Firebase is enabled and we have a schedule list, use Firebase data exclusively.
  // Otherwise fall back to local timetables if Firebase is disabled.
  const hasDynamicSchedules =
    firebaseEnabled && scheduleList && scheduleList.length > 0;

  const timetables = useMemo(() => {
    // If Firebase is available with schedules, use only Firebase data
    if (hasDynamicSchedules) {
      return remoteTimetables && remoteTimetables.length > 0
        ? remoteTimetables
        : []; // Empty while loading from Firebase
    }
    // If Firebase is disabled or schedule list is empty, use local timetables
    return localTimetables;
  }, [remoteTimetables, hasDynamicSchedules]);

  const timetableMap = useMemo(() => {
    const map = {};

    // Add all cached schedules to the map so we can look them up later
    if (fetchedCache && fetchedCache.size > 0) {
      for (const [, tt] of fetchedCache) {
        if (tt) map[tt.id] = tt;
      }
    }

    // Also add current timetables (in case they're not in cache for some reason)
    for (const tt of timetables) {
      if (tt) map[tt.id] = tt;
    }

    return map;
  }, [fetchedCache, timetables]);

  const defaultScheduleId = useMemo(() => {
    if (scheduleList && scheduleList.length > 0) {
      return scheduleList[0].collectionId;
    }
    if (hasDynamicSchedules) {
      // Firebase is enabled but no schedules loaded yet
      return null;
    }
    return timetables[0]?.id || "eia2";
  }, [scheduleList, timetables, hasDynamicSchedules]);

  const [scheduleGroups, setScheduleGroups] = useState(
    savedSettings?.scheduleGroups ?? {},
  );

  // Initialize currentSchedule on first load
  useEffect(() => {
    if (currentSchedule === null && defaultScheduleId) {
      setCurrentSchedule(defaultScheduleId);
    }
  }, [currentSchedule, defaultScheduleId]);

  useEffect(() => {
    setScheduleGroups((prev) => {
      const next = { ...prev };
      let changed = false;

      for (const timetable of timetables) {
        if (!next[timetable.id]) {
          next[timetable.id] = buildDefaultGroupsForTimetable(timetable);
          changed = true;
        }
      }

      return changed ? next : prev;
    });
  }, [timetables]);

  // Get current schedule's data - memoized to prevent infinite loops
  const currentTimetable = useMemo(
    () => timetableMap[currentSchedule] || timetables[0],
    [currentSchedule, timetableMap, timetables],
  );

  const defaultGroups = useMemo(
    () => buildDefaultGroupsForTimetable(currentTimetable),
    [currentTimetable],
  );

  const studentGroups = useMemo(
    () => scheduleGroups[currentSchedule] || defaultGroups,
    [scheduleGroups, currentSchedule, defaultGroups],
  );

  const schedule = useMemo(
    () => currentTimetable?.schedule || [],
    [currentTimetable],
  );

  const subjects = useMemo(
    () => currentTimetable?.subjects || {},
    [currentTimetable],
  );

  // Get group configs for the current schedule
  const groupConfigs = useMemo(
    () => currentTimetable?.groups || [],
    [currentTimetable],
  );

  const handleGroupChange = useCallback(
    (type, number) => {
      if (!currentSchedule) return;
      const digits = (number ?? "").toString().replace(/\D/g, "");
      // Find the prefix for this type
      const groupConfig = groupConfigs.find((g) => g.type === type);
      const prefix = groupConfig ? groupConfig.prefix : type;

      setScheduleGroups((prev) => ({
        ...prev,
        [currentSchedule]: {
          ...prev[currentSchedule],
          [type]: digits ? prefix + digits : "",
        },
      }));
    },
    [currentSchedule, groupConfigs],
  );

  const handleScheduleChange = useCallback((scheduleId) => {
    setCurrentSchedule(scheduleId);
  }, []);

  return {
    timetables,
    scheduleList,
    timetablesLoading,
    currentSchedule,
    scheduleGroups,
    studentGroups,
    schedule,
    subjects,
    groupConfigs,
    handleGroupChange,
    handleScheduleChange,
  };
}
