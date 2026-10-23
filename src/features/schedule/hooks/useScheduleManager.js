import { useCallback, useEffect } from "react";
import { useTimetableData } from "./useTimetableData";
import { useGroupSets } from "./useGroupSets";

export function useScheduleManager(savedSettings) {
  const data = useTimetableData(savedSettings);
  const groups = useGroupSets({
    savedSettings,
    currentSchedule: data.currentSchedule,
    groupConfigs: data.currentTimetable.groups,
  });
  const { loadExternalTimetables, refreshSchedules, refreshTick } = data;
  const { activeExternalSelections } = groups;

  useEffect(() => loadExternalTimetables(activeExternalSelections),
    [loadExternalTimetables, activeExternalSelections, refreshTick]);
  const handleRefreshSchedule = useCallback(() => refreshSchedules(activeExternalSelections),
    [refreshSchedules, activeExternalSelections]);

  return {
    ...groups,
    timetableOptions: data.timetableOptions,
    timetableOptionsMessage: data.timetableOptionsMessage,
    timetableDataSourceLabel: data.timetableDataSourceLabel,
    currentSchedule: data.currentSchedule,
    currentTimetable: data.currentTimetable,
    loadedTimetables: data.loadedTimetables,
    isScheduleLoading: data.isScheduleLoading,
    isScheduleRefreshing: data.isScheduleRefreshing,
    schedule: data.currentTimetable.schedule,
    subjects: data.currentTimetable.subjects,
    groupConfigs: data.currentTimetable.groups,
    handleScheduleChange: data.handleScheduleChange,
    handleRefreshSchedule,
  };
}
