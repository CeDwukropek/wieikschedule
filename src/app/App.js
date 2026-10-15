import { useEffect, useMemo, useRef, useState } from "react";
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
import {usePersonalOverrides} from '../features/my-plan/usePersonalOverrides';
import {effectiveTimetables,effectiveAddedEvents} from '../features/my-plan/effectiveSchedule';
import PersonalChangeDialog from '../features/my-plan/PersonalChangeDialog';

export default function App() {
  const exportRef = useRef(null);
  const [open, setOpen] = useState(false);
  const { user } = useFirebaseAuth();
  const guestId = useGuestId();
  const { savedSettings, isLoading: settingsLoading } = useSettings();
  const view = useViewSettings(savedSettings);
  const schedule = useScheduleManager(savedSettings);
  const personalEnabled=process.env.REACT_APP_PERSONAL_SCHEDULE==='true';
  const [editing,setEditing]=useState(null);
  const [proposals,setProposals]=useState([]);
  useEffect(()=>{setEditing(null);setProposals([]);},[user?.uid,schedule.currentSchedule]);
  const personal=usePersonalOverrides(user,personalEnabled);
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
  const sourceById=useMemo(()=>new Map([
    ...Object.values(schedule.loadedTimetables).flatMap(table=>table.rawRows||[]),
    ...myPlan.allAddedEvents.map(event=>({...event._raw,id:event.event_id})),
    ...personal.rows.map(row=>row.events).filter(Boolean),
  ].map(row=>[row.id,row])),[schedule.loadedTimetables,myPlan.allAddedEvents,personal.rows]);
  const source=editing&&user&&editing.uid===user.uid?(editing.proposal?.source||sourceById.get(editing.id)):null;

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
  const weekEvents = useMemo(
    () =>
      mergeEvents({
        ...eventOptions,
        weekStart: navigation.viewedWeekStart,
        addedEvents,
      }),
    [eventOptions, navigation.viewedWeekStart, addedEvents],
  );
  const dayEvents = useMemo(
    () =>
      mergeEvents({
        ...eventOptions,
        weekStart: navigation.selectedDayWeekStart,
        addedEvents,
      }),
    [eventOptions, navigation.selectedDayWeekStart, addedEvents],
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

  const calendarProps = {
    subjects: schedule.subjects,
    onRemoveAddedEvent: myPlan.removeEvent,
    removingAddedEventId: myPlan.removingAddedEventId,
    onEditEvent: user&&personalEnabled&&personal.ready?id=>setEditing({uid:user.uid,id}):undefined,
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
          onMyPlanChanged: myPlan.refresh,
          onOptimisticAdd: myPlan.optimisticAdd,
          onOptimisticAddConfirmed: myPlan.confirmAdd,
          onOptimisticAddFailed: myPlan.rollbackAdd,
          onProposal: proposal=>setProposals(previous=>[...previous,{uid:user.uid,proposal}]),
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
        {proposals.filter(item=>item.uid===user.uid).map(({proposal})=><div key={proposal.id} className="my-2 rounded bg-sky-950 p-3">
          Agent proponuje zmianę: {proposal.source.subject} ({proposal.source.date}). <button className="underline" onClick={()=>setEditing({uid:user.uid,id:proposal.event_id,proposal})}>Sprawdź podgląd</button>
          <button className="ml-3 text-neutral-400" onClick={()=>setProposals(previous=>previous.filter(item=>item.proposal.id!==proposal.id))}>Odrzuć</button>
        </div>)}
        {!personal.ready&&<p role="status">{personal.error||'Sprawdzanie prywatnych zmian…'} <button onClick={personal.refresh} className="underline">Odśwież</button></p>}
        {personal.ready&&personal.rows.length>0&&<details><summary className="cursor-pointer text-sky-300">Moje zmiany ({personal.rows.length})</summary>
          {personal.rows.map(row=><button key={row.id} className="block p-2 underline" onClick={()=>setEditing({uid:user.uid,id:row.event_id})}>{row.events?.subject} — {row.action==='cancel'?'odwołane':'zmienione'} ({row.events?.date})</button>)}
        </details>}
      </section>}
      {personal.ready&&(view.viewMode === "week" ? (
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
      ))}
      {source&&personal.ready&&<PersonalChangeDialog key={`${user.uid}:${editing.id}:${editing.proposal?.id||'manual'}`} source={source} initialProposal={editing.proposal} override={personal.rows.find(row=>row.event_id===source.id)} onClose={()=>setEditing(null)} onSaved={()=>{setProposals(previous=>previous.filter(item=>item.proposal.id!==editing.proposal?.id));setEditing(null);personal.refresh();myPlan.refresh();}}/>}
      <FAQ />
    </div>
  );
}
