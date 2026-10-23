import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import {usePersonalPlan} from '../features/my-plan/usePersonalPlan';
import UndoToast from '../features/my-plan/UndoToast';
import {addEventToMyPlan} from '../features/my-plan/myPlanApi';
import {effectiveTimetables,effectiveAddedEvents} from '../features/my-plan/effectiveSchedule';
import MyPlanPanel from '../features/my-plan/MyPlanPanel';
import EventDetailsDialog from '../features/schedule/components/EventDetailsDialog';
import {dialogEventFromItem,ghostEvents,overlaps,parseDate,startTimeOptions} from '../features/my-plan/planEditing';
import {getWeekStart} from '../utils/date';

export default function App() {
  const exportRef = useRef(null);
  const [open, setOpen] = useState(false);
  const { user } = useFirebaseAuth();
  const guestId = useGuestId();
  const { savedSettings, isLoading: settingsLoading } = useSettings();
  const view = useViewSettings(savedSettings);
  const schedule = useScheduleManager(savedSettings);
  const personalEnabled=process.env.REACT_APP_PERSONAL_SCHEDULE==='true';
  const [planOpen,setPlanOpen]=useState(false);
  const [shownItem,setShownItem]=useState(null);
  const [toast,setToast]=useState(null);
  useEffect(()=>{setPlanOpen(false);setShownItem(null);setToast(null);},[user?.uid,schedule.currentSchedule]);
  const dismissToast=useCallback(()=>setToast(null),[]);
  const personal=usePersonalPlan(user,personalEnabled);
  const tables=useMemo(()=>effectiveTimetables(schedule.loadedTimetables,personal.rows),[schedule.loadedTimetables,personal.rows]);
  const effectiveTable=tables[schedule.currentSchedule]||schedule.currentTimetable;
  const navigation = useScheduleNavigation({
    minDate: effectiveTable.minDate,
    maxDate: effectiveTable.maxDate,
    savedSettings,
  });
  const myPlan = useMyPlanEvents({
    scheduleName: schedule.currentSchedule,
    scopeId: user?.uid || guestId,
    enabled: Boolean(user),
    viewedWeekStart: navigation.viewedWeekStart,
    selectedDayWeekStart: navigation.selectedDayWeekStart,
  });

  const addedEvents=useMemo(()=>effectiveAddedEvents(myPlan.allAddedEvents,personal.rows),[myPlan.allAddedEvents,personal.rows]);
  const proposals=personal.proposals;

  // Own edits are saved at once; the toast offers to restore the previous state.
  const applyChange=async change=>{
    const undo=await personal.apply(change);
    myPlan.refresh();
    const message=change.operation==='delete'?'Przywrócono plan uczelni.':change.action==='cancel'?'Odwołano zajęcia w Twoim planie.':'Zapisano zmianę w Twoim planie.';
    setToast({message,undo:async()=>{await personal.apply(undo);myPlan.refresh();}});
  };
  const confirmProposal=async proposal=>{
    await personal.confirmProposal(proposal);
    myPlan.refresh();
    setToast({message:'Zatwierdzono propozycję agenta.'});
  };
  const removeAddedEvent=async addedEventId=>{
    const removed=myPlan.allAddedEvents.find(event=>event.added_event_id===addedEventId);
    await myPlan.removeEvent(addedEventId);
    personal.refresh();
    setToast({message:'Usunięto dopisane zajęcia z planu.',undo:removed?.event_id?async()=>{
      await addEventToMyPlan({eventId:removed.event_id,scheduleName:schedule.currentSchedule});
      myPlan.refresh();personal.refresh();
    }:undefined});
  };

  const eventOptions = useMemo(
    () => ({
      schedule: effectiveTable.schedule,
      scheduleId: schedule.currentSchedule,
      groups: schedule.studentGroups,
      hideLectures: view.hideLectures,
      showAll: view.showAll,
      externalSelections: schedule.activeExternalSelections,
      timetables: tables,
    }),
    [
      effectiveTable.schedule,
      schedule.currentSchedule,
      schedule.studentGroups,
      schedule.activeExternalSelections,
      tables,
      view.hideLectures,
      view.showAll,
    ],
  );
  // Cancelled classes and moved-from slots are shown faded; they are not part of the plan itself.
  const showGhosts=Boolean(user&&personalEnabled&&personal.ready);
  const ghostFaculties=useMemo(()=>[schedule.currentSchedule,...schedule.activeExternalSelections.map(item=>item.scheduleId)],
    [schedule.currentSchedule,schedule.activeExternalSelections]);
  const weekEvents = useMemo(
    () => [
      ...mergeEvents({
        ...eventOptions,
        weekStart: navigation.viewedWeekStart,
        addedEvents,
      }),
      ...(showGhosts?ghostEvents(personal.items,{faculties:ghostFaculties,weekStart:navigation.viewedWeekStart,hideLectures:view.hideLectures}):[]),
    ],
    [eventOptions, navigation.viewedWeekStart, addedEvents, showGhosts, personal.items, ghostFaculties, view.hideLectures],
  );
  const dayEvents = useMemo(
    () => [
      ...mergeEvents({
        ...eventOptions,
        weekStart: navigation.selectedDayWeekStart,
        addedEvents,
      }),
      ...(showGhosts?ghostEvents(personal.items,{faculties:ghostFaculties,weekStart:navigation.selectedDayWeekStart,hideLectures:view.hideLectures}):[]),
    ],
    [eventOptions, navigation.selectedDayWeekStart, addedEvents, showGhosts, personal.items, ghostFaculties, view.hideLectures],
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
    view.ready && !settingsLoading,
  );

  // Private changes made from a class's details dialog; absent for guests.
  const startTimes=useMemo(()=>startTimeOptions(effectiveTable.rawRows).filter(Boolean),[effectiveTable.rawRows]);
  const planActions=user&&personalEnabled&&personal.ready?{
    overrideFor:id=>personal.rows.find(row=>row.event_id===id),
    apply:applyChange,
    removeAdded:removeAddedEvent,
    startTimes,
    bounds:{min:effectiveTable.minDate,max:effectiveTable.maxDate},
    conflictsFor:(eventId,{date,start,end})=>{
      const day=(parseDate(date).getDay()+6)%7;
      return mergeEvents({...eventOptions,weekStart:getWeekStart(parseDate(date)),addedEvents})
        .filter(other=>other.day===day&&String(other.event_id||'')!==String(eventId)&&overlaps(other,{start,end}))
        .map(other=>({title:other.title||other.subj,start:other.start,end:other.end,room:other.room}));
    },
  }:undefined;
  const calendarProps = {
    subjects: schedule.subjects,
    planActions,
    ref: exportRef,
  };
  const today=new Date().toISOString().slice(0,10);
  const shownEvent=shownItem&&dialogEventFromItem(shownItem);

  return (
    <div className="min-h-screen bg-black text-white px-2 pt-2 sm:px-4 sm:pt-4 lg:px-6 lg:pt-6 pb-[calc(140px+env(safe-area-inset-bottom))]">
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
          schedule: effectiveTable.schedule,
          isScheduleLoading: schedule.isScheduleLoading,
          isScheduleRefreshing: schedule.isScheduleRefreshing,
          onRefreshSchedule: async () => {
            await schedule.handleRefreshSchedule();
            myPlan.refresh();
            personal.refresh();
          },
          activeGroupSetId: schedule.activeGroupSetId,
          activeGroupSetName: schedule.activeGroupSetName,
          groupSetOptions: schedule.groupSetOptions,
          onGroupSetChange: schedule.handleGroupSetChange,
          onCreateGroupSet: schedule.handleCreateGroupSet,
          onRenameActiveGroupSet: schedule.handleRenameActiveGroupSet,
          onDeleteActiveGroupSet: schedule.handleDeleteActiveGroupSet,
          externalSelections: schedule.activeExternalSelections,
          loadedTimetables: tables,
          onAddExternalSelection: schedule.handleAddExternalSelection,
          onUpdateExternalSelection: schedule.handleUpdateExternalSelection,
          onRemoveExternalSelection: schedule.handleRemoveExternalSelection,
          onScheduleChange: schedule.handleScheduleChange,
        }}
        exportState={{ exportRef, addedEvents, personalReady:personal.ready }}
        chatState={{
          enabled: process.env.REACT_APP_ENABLE_AI_CHAT !== "false",
          scheduleName: schedule.currentSchedule,
          selectedGroups: schedule.studentGroups,
          externalSelections: schedule.activeExternalSelections.map(item=>({
            faculty:item.scheduleId,groups:{[item.groupType]:item.groupValue},
            subject:item.subjectKey?tables[item.scheduleId]?.subjects?.[item.subjectKey]?.name:null,
          })),
          onMyPlanChanged: myPlan.refresh,
          onOptimisticAdd: myPlan.optimisticAdd,
          onOptimisticAddConfirmed: myPlan.confirmAdd,
          onOptimisticAddFailed: myPlan.rollbackAdd,
          // Agent previews are stored server-side; reload so they survive a page refresh.
          onProposal: personal.refresh,
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
      {user&&personalEnabled&&<section className="mb-4 text-sm">
        {!personal.ready&&!personal.error&&<p role="status">Sprawdzanie prywatnych zmian…</p>}
        {/* The university plan stays visible; only private changes, edits and ICS export wait for the API. */}
        {!personal.ready&&personal.error&&<p role="alert">
          Twoje prywatne zmiany są chwilowo niedostępne — widzisz plan uczelni bez nich. ({personal.error}){' '}
          <button onClick={personal.refresh} className="underline">Spróbuj ponownie</button>
        </p>}
        {personal.ready&&<button type="button" className="plan-panel-trigger" aria-haspopup="dialog" onClick={()=>setPlanOpen(true)}>
          Mój plan{personal.items.length>0&&<span className="plan-panel-count">{personal.items.length}</span>}
          {proposals.length>0&&<span className="plan-panel-count plan-panel-count-attention">{proposals.length} do zatwierdzenia</span>}
        </button>}
      </section>}
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
          weekStart={navigation.selectedDayWeekStart}
          selection={navigation.daySelection.selection}
        />
      )}
      {planOpen&&planActions&&<MyPlanPanel items={personal.items} proposals={proposals} today={today} onClose={()=>setPlanOpen(false)}
        onApply={applyChange} onRemoveAdded={removeAddedEvent} onConfirmProposal={confirmProposal}
        onDismissProposal={personal.rejectProposal}
        onShow={item=>{setPlanOpen(false);setShownItem(item);}}/>}
      {shownEvent&&planActions&&<EventDetailsDialog ev={shownEvent} subjects={schedule.subjects} date={parseDate((shownItem.current||shownItem.original).date)}
        onClose={()=>setShownItem(null)} planActions={planActions}/>}
      <UndoToast toast={toast} onDismiss={dismissToast}/>
      <FAQ />
    </div>
  );
}
