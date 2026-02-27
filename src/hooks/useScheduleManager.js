import { useState, useMemo, useCallback, useEffect } from "react";
import {
  allTimetables,
  defaultTimetable,
  getCachedTimetableById,
  loadTimetableById,
} from "../timetables";

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
  const defaultScheduleId = defaultTimetable?.id || allTimetables[0]?.id || "";

  const [currentSchedule, setCurrentSchedule] = useState(
    savedSettings?.currentSchedule ?? defaultScheduleId,
  );

  const [scheduleGroups, setScheduleGroups] = useState(
    savedSettings?.scheduleGroups ?? {},
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

  useEffect(() => {
    let active = true;
    const targetId = currentSchedule || defaultScheduleId;
    if (!targetId) return () => {};

    if (loadedTimetables[targetId]) return () => {};

    setIsScheduleLoading(true);
    loadTimetableById(targetId)
      .then((timetable) => {
        if (!active || !timetable) return;
        setLoadedTimetables((prev) => {
          if (prev[targetId]) return prev;
          return { ...prev, [targetId]: timetable };
        });
      })
      .finally(() => {
        if (active) setIsScheduleLoading(false);
      });

    return () => {
      active = false;
    };
  }, [currentSchedule, defaultScheduleId, loadedTimetables]);

  // Get current schedule's data - memoized to prevent infinite loops
  const currentTimetable = useMemo(
    () =>
      loadedTimetables[currentSchedule] ||
      loadedTimetables[defaultScheduleId] || {
        id: currentSchedule || defaultScheduleId,
        name: currentSchedule || defaultScheduleId,
        schedule: [],
        subjects: {},
        groups: [],
        minDate: null,
        maxDate: null,
      },
    [loadedTimetables, currentSchedule, defaultScheduleId],
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

  useEffect(() => {
    if (!currentSchedule || !currentTimetable?.groups?.length) return;
    setScheduleGroups((prev) => {
      if (prev[currentSchedule]) return prev;
      return {
        ...prev,
        [currentSchedule]: buildDefaultGroupsForTimetable(currentTimetable),
      };
    });
  }, [currentSchedule, currentTimetable]);

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
    currentTimetable,
    isScheduleLoading,
    handleGroupChange,
    handleScheduleChange,
  };
}
