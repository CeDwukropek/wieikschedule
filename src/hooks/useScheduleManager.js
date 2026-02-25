import { useState, useMemo, useCallback, useEffect } from "react";
import { allTimetables as localTimetables } from "../timetables";
import { useFirebaseTimetables } from "./useFirebaseTimetables";

// Build default groups from timetable group configurations
function buildDefaultGroupsForTimetable(timetable) {
  const groups = {};
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
    loading: timetablesLoading,
  } = useFirebaseTimetables(currentSchedule);

  const timetables = useMemo(
    () => (remoteTimetables.length > 0 ? remoteTimetables : localTimetables),
    [remoteTimetables],
  );

  const timetableMap = useMemo(
    () =>
      timetables.reduce((acc, tt) => {
        acc[tt.id] = tt;
        return acc;
      }, {}),
    [timetables],
  );

  const defaultScheduleId = useMemo(() => {
    if (scheduleList && scheduleList.length > 0) {
      return scheduleList[0].collectionId;
    }
    return timetables[0]?.id || "eia2";
  }, [scheduleList, timetables]);

  const [scheduleGroups, setScheduleGroups] = useState(
    savedSettings?.scheduleGroups ?? {},
  );

  // Initialize currentSchedule on first load
  useEffect(() => {
    if (currentSchedule === null && defaultScheduleId) {
      setCurrentSchedule(defaultScheduleId);
    }
  }, [currentSchedule, defaultScheduleId]);

  // Validate current schedule exists
  useEffect(() => {
    if (currentSchedule && !timetableMap[currentSchedule]) {
      setCurrentSchedule(defaultScheduleId);
    }
  }, [currentSchedule, defaultScheduleId, timetableMap]);

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

  const schedule = useMemo(() => currentTimetable.schedule, [currentTimetable]);

  const subjects = useMemo(
    () => currentTimetable.subjects || {},
    [currentTimetable],
  );

  // Get group configs for the current schedule
  const groupConfigs = useMemo(
    () => currentTimetable.groups || [],
    [currentTimetable],
  );

  const handleGroupChange = useCallback(
    (type, number) => {
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
