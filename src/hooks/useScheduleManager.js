import { useState, useMemo, useCallback } from "react";
import { allTimetables, timetableMap } from "../timetables";

// Build default groups from timetable group configurations
function buildDefaultGroupsForTimetable(timetable) {
  const groups = {};
  if (timetable.groups && Array.isArray(timetable.groups)) {
    timetable.groups.forEach((g) => {
      groups[g.type] = `${g.prefix}1`;
    });
  }
  return groups;
}

export function useScheduleManager(savedSettings) {
  const defaultScheduleId = allTimetables[0]?.id || "eia2";

  // Build initial groups for all schedules
  const initialScheduleGroups = useMemo(
    () =>
      allTimetables.reduce((acc, tt) => {
        acc[tt.id] = buildDefaultGroupsForTimetable(tt);
        return acc;
      }, {}),
    [],
  );

  const [currentSchedule, setCurrentSchedule] = useState(
    savedSettings?.currentSchedule ?? defaultScheduleId,
  );

  const [scheduleGroups, setScheduleGroups] = useState(
    savedSettings?.scheduleGroups ?? initialScheduleGroups,
  );

  // Get current schedule's data - memoized to prevent infinite loops
  const currentTimetable = useMemo(
    () => timetableMap[currentSchedule] || allTimetables[0],
    [currentSchedule],
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
