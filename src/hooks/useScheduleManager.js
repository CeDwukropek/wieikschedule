import { useState, useMemo, useCallback } from "react";
import { allTimetables, timetableMap } from "../timetables";

const DEFAULT_GROUPS = { C: "Ć1", L: "L1", Lek: "Lek1", Lk: "Lk1" };

export function useScheduleManager(savedSettings) {
  const defaultScheduleId = allTimetables[0]?.id || "eia2";

  // Memoize default values to prevent object recreation
  const defaultGroups = useMemo(() => ({ ...DEFAULT_GROUPS }), []);

  const initialScheduleGroups = useMemo(
    () =>
      allTimetables.reduce((acc, tt) => {
        acc[tt.id] = { ...defaultGroups };
        return acc;
      }, {}),
    [defaultGroups],
  );

  const [currentSchedule, setCurrentSchedule] = useState(
    savedSettings?.currentSchedule ?? defaultScheduleId,
  );

  const [scheduleGroups, setScheduleGroups] = useState(
    savedSettings?.scheduleGroups ?? initialScheduleGroups,
  );

  // Get current schedule's groups and data - memoized to prevent infinite loops
  const studentGroups = useMemo(
    () => scheduleGroups[currentSchedule] || defaultGroups,
    [scheduleGroups, currentSchedule, defaultGroups],
  );

  const currentTimetable = useMemo(
    () => timetableMap[currentSchedule] || allTimetables[0],
    [currentSchedule],
  );

  const schedule = useMemo(() => currentTimetable.schedule, [currentTimetable]);

  const subjects = useMemo(
    () => currentTimetable.subjects || {},
    [currentTimetable],
  );

  const handleGroupChange = useCallback(
    (type, number) => {
      const digits = (number ?? "").toString().replace(/\D/g, "");
      const prefixes = { C: "Ć", L: "L", Lek: "Lek", Lk: "Lk" };
      setScheduleGroups((prev) => ({
        ...prev,
        [currentSchedule]: {
          ...prev[currentSchedule],
          [type]: digits ? prefixes[type] + digits : "",
        },
      }));
    },
    [currentSchedule],
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
    handleGroupChange,
    handleScheduleChange,
  };
}
