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
import {seriesMembers} from '../features/my-plan/seriesChanges';
import EventDetailsDialog from '../features/schedule/components/EventDetailsDialog';
import {dialogEventFromItem,ghostEvents,overlaps,parseDate,startTimeOptions} from '../features/my-plan/planEditing';
import {getWeekStart,parseDaySelection,toIsoDate} from '../utils/date';
import {usePlanItems} from '../features/plan-items/usePlanItems';
import {filterItems,isDayOff,itemsWindow,placeItems,planItemsEnabled,upcomingItems,visibleItems,weekendWeeks} from '../features/plan-items/planItemLogic';
import PlanItemDialog from '../features/plan-items/PlanItemDialog';
import UpcomingPanel from '../features/plan-items/UpcomingPanel';
import StarostaPanel from '../features/plan-items/StarostaPanel';
import {planItemsRequest} from '../features/plan-items/planItemsApi';
import {makeupItem,slotTerm,subjectsOf,termsLabel,withRevisions} from '../features/plan-items/planItemEditing';
import {usePlanReminders} from '../features/plan-items/usePlanReminders';
import {reviewItems} from '../features/plan-items/planRoles';
import {CalendarPlus,ShieldCheck} from 'lucide-react';
import {subjectNames,withSubjectColors} from '../features/schedule/logic/subjectColors';
import {BROWSE_MODES,browseFromSearch,browseSearch,browseTimetable,cleanRoom,roomKey} from '../features/browse/browseLogic';
import {useBrowse} from '../features/browse/useBrowse';
import FreeRoomsView from '../features/browse/FreeRoomsView';

const WORKDAYS=[0,1,2,3,4],WHOLE_WEEK=[0,1,2,3,4,5,6];

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
  // A new entry at a free time chosen in the grid (or with the "Dodaj termin" button).
  const [draft,setDraft]=useState(null);
  useEffect(()=>{setPlanOpen(false);setShownItem(null);setToast(null);setDraft(null);},[user?.uid,schedule.currentSchedule]);
  const dismissToast=useCallback(()=>setToast(null),[]);
  const personal=usePersonalPlan(user,personalEnabled);
  const tables=useMemo(()=>effectiveTimetables(schedule.loadedTimetables,personal.rows),[schedule.loadedTimetables,personal.rows]);
  const effectiveTable=tables[schedule.currentSchedule]||schedule.currentTimetable;
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
  // Kolokwia, deadlines and other entries of the shown plans; group entries also for guests.
  const itemsOn=planItemsEnabled();
  const [today]=useState(()=>new Date());
  const itemsRange=useMemo(()=>itemsWindow(today),[today]);
  const faculties=useMemo(()=>[...new Set([schedule.currentSchedule,...schedule.activeExternalSelections.map(item=>item.scheduleId)].filter(Boolean))],
    [schedule.currentSchedule,schedule.activeExternalSelections]);
  const planItems=usePlanItems({enabled:itemsOn,uid:user?.uid,faculties,window:itemsRange});
  const planReminders=usePlanReminders({enabled:itemsOn,uid:user?.uid});
  // Every occurrence of the plan (lectures included, so an entry on a hidden lecture still shows).
  const planEvents=useMemo(()=>mergeEvents({...eventOptions,hideLectures:false,weekStart:null}),[eventOptions]);
  const relevantItems=useMemo(()=>visibleItems(planItems.items,planEvents,{scheduleId:schedule.currentSchedule,showAll:view.showAll}),
    [planItems.items,planEvents,schedule.currentSchedule,view.showAll]);
  const items=useMemo(()=>filterItems(relevantItems,{scope:view.entryScope,hiddenKinds:view.hiddenKinds}),
    [relevantItems,view.entryScope,view.hiddenKinds]);
  const hiddenItems=useMemo(()=>visibleItems(planItems.items,planEvents,{scheduleId:schedule.currentSchedule,showAll:view.showAll,hidden:true}),
    [planItems.items,planEvents,schedule.currentSchedule,view.showAll]);
  // Rows chosen in an agent's preview, drawn as drafts until they are saved.
  const [agentDrafts,setAgentDrafts]=useState({});
  const setDrafts=useCallback((id,drafts)=>setAgentDrafts(previous=>{
    if(!drafts.length&&!previous[id])return previous;
    const next={...previous};
    if(drafts.length)next[id]=drafts;else delete next[id];
    return next;
  }),[]);
  const placedItems=useMemo(()=>{const drafts=Object.values(agentDrafts).flat();return drafts.length?[...items,...drafts]:items;},[items,agentDrafts]);
  const weekendSet=useMemo(()=>weekendWeeks(planEvents,placedItems),[planEvents,placedItems]);
  const showWeekend=useCallback(weekStart=>view.alwaysShowWeekend||weekendSet.has(toIsoDate(weekStart)),[view.alwaysShowWeekend,weekendSet]);
  const [openItemId,setOpenItemId]=useState(null);
  const [upcomingOpen,setUpcomingOpen]=useState(false);
  const [starostaOpen,setStarostaOpen]=useState(false);
  const openItem=planItems.items.find(item=>item.id===openItemId&&!item.my_state?.hidden);
  const onItemState=user&&itemsOn?planItems.setItemState:undefined;
  const navigation = useScheduleNavigation({
    minDate: effectiveTable.minDate,
    maxDate: effectiveTable.maxDate,
    savedSettings,
    showWeekend,
  });
  // Browsing an instructor's or a room's plan, or free rooms, across all plans; kept in the address for sharing.
  const [browse,setBrowseState]=useState(()=>browseFromSearch(window.location.search));
  const [wantDirectory,setWantDirectory]=useState(false);
  const setBrowse=useCallback(next=>{
    setBrowseState(next);
    try{window.history.replaceState(window.history.state,'',`${window.location.pathname}${browseSearch(window.location.search,next)}${window.location.hash}`);}
    catch{/* the address is a convenience only */}
  },[]);
  const browsing=browse.mode!=='mine';
  const browseData=useBrowse({browsing,weekStart:view.viewMode==='week'?navigation.viewedWeekStart:navigation.selectedDayWeekStart,
    wantDirectory:wantDirectory||browse.mode==='free'});
  const browsed=useMemo(()=>browse.mode==='teacher'||browse.mode==='room'?browseTimetable(browseData.rows,browse):null,[browseData.rows,browse]);
  const browsedSubjects=useMemo(()=>browsed?withSubjectColors(browsed.subjects,view.subjectColors):{},[browsed,view.subjectColors]);
  const browseFrom=useCallback(({teacher,room})=>setBrowse(teacher?{mode:'teacher',key:teacher,label:teacher}
    :{mode:'room',key:roomKey(room),label:cleanRoom(room)}),[setBrowse]);
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
  const applyBatchChange=async(changes,message)=>{
    const undo=await personal.applyBatch(changes);
    myPlan.refresh();
    setToast({message,undo:async()=>{await personal.applyBatch(undo);myPlan.refresh();}});
  };
  // Makeup at another group: the class joins the plan (as added classes do) with a private entry on it.
  const makeUp=async(entry,candidate)=>{
    const {added_event:added,already_added:existed}=await addEventToMyPlan({eventId:candidate.event_id,scheduleName:candidate.faculty});
    let saved;
    try{saved=await planItems.save([makeupItem(entry,candidate)]);}
    catch(failure){if(!existed&&added?.id)await myPlan.removeEvent(added.id).catch(()=>{});myPlan.refresh();throw failure;}
    myPlan.refresh();personal.refresh();
    setToast({message:`Wpisano odrobienie z grupą ${candidate.group}. Zapytaj prowadzącego o zgodę.`,undo:async()=>{
      await planItems.remove(saved.map(({id,revision})=>({id,revision})));
      if(!existed&&added?.id){await myPlan.removeEvent(added.id);personal.refresh();}
    }});
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
  const weekPlaced=useMemo(()=>placeItems(placedItems,navigation.viewedWeekStart,weekEvents),[placedItems,navigation.viewedWeekStart,weekEvents]);
  const dayPlaced=useMemo(()=>placeItems(placedItems,navigation.selectedDayWeekStart,dayEvents),[placedItems,navigation.selectedDayWeekStart,dayEvents]);
  const weekDays=useMemo(()=>showWeekend(navigation.viewedWeekStart)||weekPlaced.events.some(ev=>ev.day>=5&&!isDayOff(ev))
    ||Object.keys(weekPlaced.strip).some(day=>Number(day)>=5)?WHOLE_WEEK:WORKDAYS,[showWeekend,navigation.viewedWeekStart,weekPlaced]);
  const reviewCount=useMemo(()=>reviewItems(planItems.items).length,[planItems.items]);
  const upcomingCount=useMemo(()=>{const {upcoming,overdue}=upcomingItems(items,today);return upcoming.length+overdue.length;},[items,today]);

  usePersistSettings(
    {
      viewMode: view.viewMode,
      hideLectures: view.hideLectures,
      showAll: view.showAll,
      alwaysShowWeekend: view.alwaysShowWeekend,
      entryScope: view.entryScope,
      hiddenKinds: view.hiddenKinds,
      subjectColors: view.subjectColors,
      dimPast: view.dimPast,
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
    applyBatch:applyBatchChange,
    makeUp:itemsOn&&planItems.ready?makeUp:undefined,
    // The university occurrences of the class's series in its own plan (not makeup classes of other plans).
    seriesFor:ev=>seriesMembers(schedule.loadedTimetables[ev._sourceScheduleId||schedule.currentSchedule]?.rawRows||[],ev.event_id,
      id=>personal.rows.find(row=>row.event_id===id)),
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
  const todayIso=toIsoDate(today);
  // Adding, editing and removing entries; each write can be undone from the toast. The server checks the roles.
  const itemActions=user&&itemsOn&&planItems.ready?{
    roles:planItems.roles,items:planItems.items,scheduleId:schedule.currentSchedule,planEvents,today:todayIso,
    show:id=>planItems.setItemState(id,{hidden:false}),
    subjectsFor:faculty=>subjectsOf((tables[faculty]||(faculty===schedule.currentSchedule?effectiveTable:null))?.schedule),
    create:async entries=>{
      const saved=await planItems.save(entries);
      setToast({message:`Dodano ${termsLabel(saved.length)}.`,undo:async()=>{await planItems.remove(saved.map(({id,revision})=>({id,revision})));}});
    },
    update:async(changes,undo)=>{
      const saved=await planItems.save(changes);
      setToast({message:changes.length>1?`Zmieniono ${termsLabel(changes.length)}.`:'Zapisano zmianę terminu.',
        undo:async()=>{await planItems.save(withRevisions(undo,saved));}});
    },
    remove:async members=>{
      const done=await planItems.remove(members.map(({id,revision})=>({id,revision})));
      setToast({message:members.length>1?`Usunięto ${termsLabel(members.length)}.`:'Usunięto termin.',undo:async()=>{await planItems.remove(done,true);}});
    },
  }:undefined;
  // A role from an invite code; the entries reload so that the new rights apply at once.
  const redeemInvite=async code=>{
    const {role}=await planItemsRequest('redeem',{method:'POST',body:{code}});
    planItems.refresh();
    return role;
  };
  const groupsFor=useCallback(faculty=>(tables[faculty]||(faculty===schedule.currentSchedule?effectiveTable:null))?.schedule||[],
    [tables,schedule.currentSchedule,effectiveTable]);
  const newDraft=()=>{
    const weekStart=toIsoDate(navigation.viewedWeekStart),inWeek=todayIso>=weekStart&&todayIso<=toIsoDate(new Date(navigation.viewedWeekStart.getFullYear(),navigation.viewedWeekStart.getMonth(),navigation.viewedWeekStart.getDate()+6));
    const start=inWeek?Math.min(Math.max(new Date().getHours()+1,8),20)*60:8*60;
    setDraft({term:slotTerm(inWeek?todayIso:weekStart,start,start),faculty:schedule.currentSchedule});
  };
  const subjects=useMemo(()=>withSubjectColors(schedule.subjects,view.subjectColors),[schedule.subjects,view.subjectColors]);
  const planSubjectNames=useMemo(()=>subjectNames(schedule.subjects,effectiveTable.schedule),[schedule.subjects,effectiveTable.schedule]);
  const calendarProps = {
    subjects,
    dimPast: view.dimPast,
    planActions,
    ref: exportRef,
    // Drafts from an agent's preview are not saved yet, so they have no details to open.
    onOpenItem: item=>{if(!item.draft)setOpenItemId(item.id);},
    onItemState,
    itemActions,
    onCreateAt: itemActions?term=>setDraft({term,faculty:schedule.currentSchedule}):undefined,
    onBrowse: browseFrom,
  };
  // Another plan is only looked at: no private changes, entries or new terms there.
  const browseProps={subjects:browsedSubjects,dimPast:view.dimPast,ref:exportRef,onBrowse:browseFrom,
    events:browsed?.schedule||[]};
  const browseDays=view.alwaysShowWeekend||browseProps.events.some(ev=>ev.day>=5)?WHOLE_WEEK:WORKDAYS;
  const shownEvent=shownItem&&dialogEventFromItem(shownItem);

  return (
    <div className="min-h-screen bg-black text-white px-2 pt-2 sm:px-4 sm:pt-4 lg:px-6 lg:pt-6 pb-[calc(140px+env(safe-area-inset-bottom))]">
      <FloatingMenu
        panelState={{ open, setOpen }}
        viewState={{...view,subjectNames:planSubjectNames,entriesOn:itemsOn,onRedeemInvite:user&&itemsOn?redeemInvite:undefined,
          entryReminders:planReminders.reminders?{reminders:planReminders.reminders,custom:planReminders.custom,onSave:planReminders.save}:undefined}}
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
        exportState={{ exportRef, addedEvents, personalReady:personal.ready, planItems:items, reminders:planReminders.reminders }}
        browseState={{browse,onBrowse:setBrowse,directory:browseData.directory,directoryError:browseData.directoryError,
          onWantDirectory:()=>setWantDirectory(true)}}
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
          // Kolokwia and deadlines from the agent: saved only from its preview, exactly as prepared.
          entriesEnabled: Boolean(user&&itemsOn),
          onDrafts: setDrafts,
          onConfirmEntries: async body=>{
            const data=await planItemsRequest('confirm-agent',{method:'POST',body});
            planItems.refresh();
            return data;
          },
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
      {itemsOn&&<section className="mb-2 text-sm">
        {planItems.error&&<p role="alert">Kolokwia i terminy są chwilowo niedostępne. ({planItems.error}){' '}
          <button onClick={planItems.refresh} className="underline">Spróbuj ponownie</button></p>}
        {planItems.ready&&<button type="button" className="plan-panel-trigger plan-items-trigger" aria-haspopup="dialog" onClick={()=>setUpcomingOpen(true)}>
          Nadchodzące terminy{upcomingCount>0&&<span className="plan-panel-count">{upcomingCount}</span>}
        </button>}
        {itemActions&&<button type="button" className="plan-panel-trigger plan-items-add" aria-haspopup="dialog" onClick={newDraft}>
          <CalendarPlus size={15} aria-hidden="true"/>Dodaj termin</button>}
        {itemActions&&planItems.roles.length>0&&<button type="button" className="plan-panel-trigger plan-items-add" aria-haspopup="dialog"
          onClick={()=>setStarostaOpen(true)}><ShieldCheck size={15} aria-hidden="true"/>Panel starosty
          {reviewCount>0&&<span className="plan-panel-count plan-panel-count-attention">{reviewCount} do sprawdzenia</span>}</button>}
      </section>}
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
      {browsing&&<section className="browse-banner" aria-live="polite">
        <p><span>{browse.mode==='free'?'Wolne sale':`Plan: ${BROWSE_MODES[browse.mode].toLowerCase()}`}</span>
          {browse.label&&<strong>{browse.label}</strong>}
          {browsed&&!browseData.loading&&!browseData.error&&<small>{browsed.schedule.length?'zajęcia ze wszystkich planów':'brak zajęć w tym tygodniu we wszystkich planach'}</small>}
        </p>
        <button type="button" onClick={()=>setBrowse({mode:'mine'})}>Wróć do mojego planu</button>
        {browsed&&browseData.loading&&<p role="status">Wczytywanie zajęć wszystkich planów…</p>}
        {browsed&&browseData.error&&<p role="alert">{browseData.error} <button type="button" className="underline" onClick={browseData.retry}>Spróbuj ponownie</button></p>}
      </section>}
      {browse.mode==='free'?(
        <FreeRoomsView key={toIsoDate(view.viewMode==='week'?navigation.viewedWeekStart:navigation.selectedDayWeekStart)}
          rows={browseData.rows} rooms={browseData.directory?.rooms} loading={browseData.loading} error={browseData.error} onRetry={browseData.retry}
          weekStart={view.viewMode==='week'?navigation.viewedWeekStart:navigation.selectedDayWeekStart}
          initialDay={view.viewMode==='day'?parseDaySelection(navigation.daySelection.selection,(today.getDay()+6)%7).dayIndex
            :toIsoDate(getWeekStart(today))===toIsoDate(navigation.viewedWeekStart)?(today.getDay()+6)%7:0}
          onOpenRoom={room=>setBrowse({mode:'room',key:room.key,label:room.label})}/>
      ):browsing?(view.viewMode==='week'?(
        <WeekView {...browseProps} days={browseDays} viewedWeekStart={navigation.viewedWeekStart}/>
      ):(
        <DayView {...browseProps} key={navigation.daySelection.selection} weekStart={navigation.selectedDayWeekStart}
          selection={navigation.daySelection.selection}/>
      )):view.viewMode === "week" ? (
        <WeekView
          {...calendarProps}
          events={weekPlaced.events}
          strip={weekPlaced.strip}
          days={weekDays}
          viewedWeekStart={navigation.viewedWeekStart}
        />
      ) : (
        <DayView
          {...calendarProps}
          key={navigation.daySelection.selection}
          events={dayPlaced.events}
          strip={dayPlaced.strip}
          weekStart={navigation.selectedDayWeekStart}
          selection={navigation.daySelection.selection}
        />
      )}
      {planOpen&&planActions&&<MyPlanPanel items={personal.items} proposals={proposals} today={todayIso} onClose={()=>setPlanOpen(false)}
        onApply={applyChange} onRemoveAdded={removeAddedEvent} onConfirmProposal={confirmProposal}
        onDismissProposal={personal.rejectProposal}
        onShow={item=>{setPlanOpen(false);setShownItem(item);}}/>}
      {shownEvent&&planActions&&<EventDetailsDialog ev={shownEvent} subjects={subjects} date={parseDate((shownItem.current||shownItem.original).date)}
        onClose={()=>setShownItem(null)} planActions={planActions}/>}
      {upcomingOpen&&<UpcomingPanel items={items} hidden={hiddenItems} today={today} onClose={()=>setUpcomingOpen(false)}
        onShow={onItemState&&(id=>onItemState(id,{hidden:false}))}
        onOpen={item=>{setUpcomingOpen(false);setOpenItemId(item.id);}}/>}
      {openItem&&<PlanItemDialog key={openItem.id} item={openItem} onClose={()=>setOpenItemId(null)} onState={onItemState} actions={itemActions}/>}
      {draft&&itemActions&&<PlanItemDialog draft={draft} onClose={()=>setDraft(null)} actions={itemActions}/>}
      {starostaOpen&&itemActions&&<StarostaPanel roles={planItems.roles} items={planItems.items} scheduleId={schedule.currentSchedule}
        timetableOptions={schedule.timetableOptions} groupsFor={groupsFor} onChanged={planItems.refresh} onClose={()=>setStarostaOpen(false)}
        onOpenItem={item=>{setStarostaOpen(false);setOpenItemId(item.id);}}/>}
      <UndoToast toast={toast} onDismiss={dismissToast}/>
      <FAQ />
    </div>
  );
}
