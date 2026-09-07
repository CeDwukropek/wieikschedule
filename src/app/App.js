import { useMemo, useRef, useState } from "react";
import WeekView from "../features/schedule/components/WeekView";
import DayView from "../features/schedule/components/DayView";
import FloatingMenu from "./navigation/FloatingMenu";
import FAQ from "./FAQ";
import {
  useSettings,
  usePersistSettings,
} from "../features/settings/useSettings";
import { useViewSettings } from "../features/settings/useViewSettings";
import { useScheduleManager } from "../features/schedule/hooks/useScheduleManager";
import { useScheduleNavigation } from "../features/schedule/hooks/useScheduleNavigation";
import { mergeEvents } from "../features/schedule/logic/mergeEvents";
import { useFirebaseAuth } from "../features/auth/useFirebaseAuth";
import { useGuestId } from "../features/auth/useGuestId";
import { useMyPlanEvents } from "../features/my-plan/useMyPlanEvents";
import { toIsoDate } from "../utils/date";

export default function App() {
  const exportRef = useRef(null);
  const [open, setOpen] = useState(false);
  const { user } = useFirebaseAuth();
  const guestId = useGuestId();
  const { savedSettings } = useSettings();
  const view = useViewSettings(savedSettings);
  const schedule = useScheduleManager(savedSettings);
  const navigation = useScheduleNavigation({
    minDate: schedule.currentTimetable.minDate,
    maxDate: schedule.currentTimetable.maxDate,
    savedSettings,
  });
  const myPlan = useMyPlanEvents({
    scheduleName: schedule.currentSchedule,
    scopeId: user?.uid || guestId,
    enabled: Boolean(user),
    viewedWeekStart: navigation.viewedWeekStart,
    selectedDayWeekStart: navigation.selectedDayWeekStart,
  });

  const eventOptions = useMemo(
    () => ({
      schedule: schedule.schedule,
      groups: schedule.studentGroups,
      hideLectures: view.hideLectures,
      showAll: view.showAll,
      externalSelections: schedule.activeExternalSelections,
      timetables: schedule.loadedTimetables,
    }),
    [
      schedule.schedule,
      schedule.studentGroups,
      schedule.activeExternalSelections,
      schedule.loadedTimetables,
      view.hideLectures,
      view.showAll,
    ],
  );
  const weekEvents = useMemo(
    () =>
      mergeEvents({
        ...eventOptions,
        weekStart: navigation.viewedWeekStart,
        addedEvents:
          myPlan.addedEventsByWeek[toIsoDate(navigation.viewedWeekStart)] || [],
      }),
    [eventOptions, navigation.viewedWeekStart, myPlan.addedEventsByWeek],
  );
  const dayEvents = useMemo(
    () =>
      mergeEvents({
        ...eventOptions,
        weekStart: navigation.selectedDayWeekStart,
        addedEvents:
          myPlan.addedEventsByWeek[
            toIsoDate(navigation.selectedDayWeekStart)
          ] || [],
      }),
    [eventOptions, navigation.selectedDayWeekStart, myPlan.addedEventsByWeek],
  );

  usePersistSettings(
    {
      viewMode: view.viewMode,
      hideLectures: view.hideLectures,
      showAll: view.showAll,
      weekOffset: navigation.weekOffset,
      currentSchedule: schedule.currentSchedule,
      scheduleGroupSets: schedule.scheduleGroupSets,
      activeGroupSetBySchedule: schedule.activeGroupSetBySchedule,
    },
    view.ready,
  );

  const calendarProps = {
    subjects: schedule.subjects,
    onRemoveAddedEvent: myPlan.removeEvent,
    removingAddedEventId: myPlan.removingAddedEventId,
    ref: exportRef,
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-[calc(140px+env(safe-area-inset-bottom))]">
      <FloatingMenu
        panelState={{ open, setOpen }}
        viewState={view}
        weekNavigation={navigation.weekNavigation}
        weekSelection={navigation.weekSelection}
        dayNavigation={navigation.dayNavigation}
        daySelection={navigation.daySelection}
        groupState={{
          studentGroups: schedule.studentGroups,
          groupConfigs: schedule.groupConfigs,
          handleGroupChange: schedule.handleGroupChange,
        }}
        scheduleState={{
          timetableOptions: schedule.timetableOptions,
          timetableOptionsMessage: schedule.timetableOptionsMessage,
          timetableDataSourceLabel: schedule.timetableDataSourceLabel,
          currentSchedule: schedule.currentSchedule,
          schedule: schedule.schedule,
          isScheduleLoading: schedule.isScheduleLoading,
          isScheduleRefreshing: schedule.isScheduleRefreshing,
          onRefreshSchedule: async () => {
            await schedule.handleRefreshSchedule();
            myPlan.refresh();
          },
          activeGroupSetId: schedule.activeGroupSetId,
          activeGroupSetName: schedule.activeGroupSetName,
          groupSetOptions: schedule.groupSetOptions,
          onGroupSetChange: schedule.handleGroupSetChange,
          onCreateGroupSet: schedule.handleCreateGroupSet,
          onRenameActiveGroupSet: schedule.handleRenameActiveGroupSet,
          onDeleteActiveGroupSet: schedule.handleDeleteActiveGroupSet,
          externalSelections: schedule.activeExternalSelections,
          loadedTimetables: schedule.loadedTimetables,
          onAddExternalSelection: schedule.handleAddExternalSelection,
          onUpdateExternalSelection: schedule.handleUpdateExternalSelection,
          onRemoveExternalSelection: schedule.handleRemoveExternalSelection,
          onScheduleChange: schedule.handleScheduleChange,
        }}
        exportState={{ exportRef }}
        chatState={{
          enabled: process.env.REACT_APP_ENABLE_AI_CHAT !== "false",
          scheduleName: schedule.currentSchedule,
          selectedGroups: schedule.studentGroups,
          onMyPlanChanged: myPlan.refresh,
          onOptimisticAdd: myPlan.optimisticAdd,
          onOptimisticAddConfirmed: myPlan.confirmAdd,
          onOptimisticAddFailed: myPlan.rollbackAdd,
        }}
      />
      <div className="inline-flex gap-2">
        <img
          src="/PK_SYGNET_BIALY.png"
          alt="Logo firmy"
          className="mb-4 w-14"
        />
        <div>
          <p className="text-2xl font-black ">PK</p>
          <p>Schedule App</p>
        </div>
      </div>
      {view.viewMode === "week" ? (
        <WeekView
          {...calendarProps}
          events={weekEvents}
          viewedWeekStart={navigation.viewedWeekStart}
        />
      ) : (
        <DayView
          {...calendarProps}
          key={navigation.daySelection.selection}
          events={dayEvents}
          selection={navigation.daySelection.selection}
        />
      )}
      <FAQ />
    </div>
  );
}
