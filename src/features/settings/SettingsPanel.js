import { selectExportEvents } from "../schedule/export/selectExportEvents";
import React, { useEffect, useRef, useState } from "react";
import { ChevronRight, Book, CalendarOff, X } from "lucide-react";
import GroupFiltersPanel from "../schedule/components/GroupFiltersPanel";
import GroupSetManager from "../schedule/components/GroupSetManager";
import ViewModeSwitch from "./ViewModeSwitch";
import { ExportPngButton } from "../schedule/export/ExportPngButton";
import { exportICS } from "../schedule/export/exportICS";
import { FilterToggle } from "./FilterToggle";
import ExternalGroupSelections from "../schedule/components/ExternalGroupSelections";
import GoogleSignInButton from "../auth/GoogleSignInButton";
import AiSettings from './AiSettings';
import CalendarSyncSettings from './CalendarSyncSettings';

const TAB_KEY = "wieikschedule.settingsTab";
const readTab = () => { try { return localStorage.getItem(TAB_KEY) === "ai" ? "ai" : "plan"; } catch { return "plan"; } };
const SECTION_TITLE = "text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400";

export default function SettingsPanel({
  panelState,
  scheduleState,
  groupSetState,
  viewState,
  filterState,
  exportState,
}) {
  const { isOpen, onToggle, mobileFloatingClose = false } = panelState || {};
  const panelRef = useRef(null);
  // AI and integrations are configured rarely; the plan tab is the everyday one.
  const aiAvailable = process.env.REACT_APP_PERSONAL_SCHEDULE === 'true' || process.env.REACT_APP_CALENDAR_SYNC === 'true';
  const [tab, setTabState] = useState(readTab);
  const activeTab = aiAvailable ? tab : "plan";
  const setTab = value => { setTabState(value); try { localStorage.setItem(TAB_KEY, value); } catch { /* per-viewer convenience only */ } };
  const onCloseRef = useRef(onToggle);
  onCloseRef.current = onToggle;

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement;
    const panel = panelRef.current;
    const getFocusable = () => [...panel.querySelectorAll(
      'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), [tabindex="0"]',
    )].filter((element) => element.getClientRects().length > 0);
    getFocusable()[0]?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current?.();
      }
      if (event.key !== "Tab") return;
      const elements = getFocusable();
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [isOpen]);
  const {
    timetableOptions = [],
    timetableOptionsMessage = "",
    timetableDataSourceLabel = "",
    currentSchedule,
    onScheduleChange,
    isScheduleLoading = false,
  } = scheduleState || {};
  const {
    activeGroupSetId,
    activeGroupSetName,
    groupSetOptions,
    onGroupSetChange,
    onCreateGroupSet,
    onRenameActiveGroupSet,
    onDeleteActiveGroupSet,
    externalSelections = [],
    loadedTimetables = {},
    onAddExternalSelection,
    onUpdateExternalSelection,
    onRemoveExternalSelection,
  } = groupSetState || {};
  const {
    viewMode,
    onViewModeToggle,
    hideLectures,
    onToggleHideLectures,
    showAll,
    onToggleShowAll,
  } = viewState || {};
  const {
    schedule,
    studentGroups,
    groupConfigs,
    onGroupChange,
  } = filterState || {};
  const { exportRef, viewedWeekRange, selection, combinedOptions, addedEvents=[], personalReady=true } =
    exportState || {};
  const scheduleOptions = (
    timetableOptions.length > 0
      ? timetableOptions
      : currentSchedule
        ? [
            {
              id: currentSchedule,
              name: `${currentSchedule} (zapisany lokalnie)`,
            },
          ]
        : []
  ).filter(option => String(option.id || "").trim().toLowerCase() !== "all");

  const scheduleValue = scheduleOptions.some(
    (option) => option.id === currentSchedule,
  )
    ? currentSchedule
    : "";

  const handleExportICS = () => exportICS(selectExportEvents({
    schedule, scheduleId: currentSchedule, groups: studentGroups, hideLectures, showAll,
    externalSelections, timetables: loadedTimetables, addedEvents,
  }));

  return (
    <>
      {/* Side panel backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={onToggle} />
      )}

      {/* Side panel */}
      <div
        id="schedule-settings-panel"
        ref={panelRef}
        role="dialog"
        aria-modal={isOpen ? true : undefined}
        aria-label="Menu i ustawienia"
        aria-hidden={!isOpen}
        inert={!isOpen ? true : undefined}
        className={`fixed right-0 top-0 bottom-0 bg-neutral-900 border-l border-neutral-800 shadow-2xl transition-transform duration-300 ease-out z-50 w-80 flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Sticky header */}
        <div className="sticky top-0 z-10 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between p-6">
          <h2 className="text-lg font-semibold text-white">Opcje</h2>
          <button
            onClick={onToggle}
            className={`p-2 rounded hover:bg-neutral-700 text-gray-300 hover:text-white ${
              mobileFloatingClose ? "hidden sm:inline-flex" : ""
            }`}
            type="button"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Scrollable content */}
        <div
          className="flex-1 overflow-y-auto "
          style={{ scrollbarWidth: "none" }}
        >
          <div className="p-6 space-y-6 ">
            <GoogleSignInButton />
            {aiAvailable && <div role="tablist" aria-label="Sekcje opcji" className="grid grid-cols-2 gap-1 rounded-lg bg-neutral-800 p-1">
              {[["plan", "Plan"], ["ai", "AI i integracje"]].map(([id, label]) => (
                <button key={id} type="button" role="tab" id={`settings-tab-${id}`} aria-controls={`settings-panel-${id}`}
                  aria-selected={activeTab === id} tabIndex={activeTab === id ? 0 : -1}
                  onClick={() => setTab(id)}
                  onKeyDown={event => { if (["ArrowLeft", "ArrowRight"].includes(event.key)) { const next = id === "plan" ? "ai" : "plan"; setTab(next); document.getElementById(`settings-tab-${next}`)?.focus(); } }}
                  className={`rounded-md px-3 py-1.5 text-sm ${activeTab === id ? "bg-neutral-950 text-white shadow" : "text-neutral-400 hover:text-white"}`}>
                  {label}
                </button>
              ))}
            </div>}

            <div id="settings-panel-plan" role={aiAvailable ? "tabpanel" : undefined} aria-labelledby={aiAvailable ? "settings-tab-plan" : undefined}
              hidden={activeTab !== "plan"} className="space-y-6">
            {/* Schedule selector */}
            <section className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="settings-schedule" className={SECTION_TITLE}>Plan zajęć</label>
                {timetableDataSourceLabel ? (
                  <span className="rounded-full border border-neutral-700 bg-neutral-800 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-neutral-300">
                    {timetableDataSourceLabel}
                  </span>
                ) : null}
              </div>
              <select
                id="settings-schedule"
                value={scheduleValue}
                onChange={(e) => onScheduleChange(e.target.value)}
                className="w-full px-3 py-1.5 bg-neutral-800 text-gray-300 border border-neutral-700 rounded text-sm"
                disabled={isScheduleLoading || timetableOptions.length === 0}
              >
                {!scheduleOptions.length ? (
                  <option value="">Brak planów</option>
                ) : null}

                {scheduleOptions.map((tt) => (
                  <option key={tt.id} value={tt.id}>
                    {tt.name}
                  </option>
                ))}
              </select>

              {timetableOptionsMessage ? (
                <p className="text-[11px] text-amber-300">
                  {timetableOptionsMessage}
                </p>
              ) : null}
            </section>

            {/* Group set, its groups and groups from other plans */}
            <section className="space-y-4 border-t border-neutral-800 pt-4">
              <h3 className={SECTION_TITLE}>Moje grupy</h3>
              <GroupSetManager
                activeGroupSetId={activeGroupSetId}
                activeGroupSetName={activeGroupSetName}
                groupSetOptions={groupSetOptions}
                onGroupSetChange={onGroupSetChange}
                onCreateGroupSet={onCreateGroupSet}
                onRenameActiveGroupSet={onRenameActiveGroupSet}
                onDeleteActiveGroupSet={onDeleteActiveGroupSet}
              />
              <GroupFiltersPanel
                groupConfigs={groupConfigs}
                studentGroups={studentGroups}
                onGroupChange={onGroupChange}
              />
              <ExternalGroupSelections
                currentSchedule={currentSchedule}
                timetableOptions={timetableOptions}
                externalSelections={externalSelections}
                loadedTimetables={loadedTimetables}
                onAddExternalSelection={onAddExternalSelection}
                onUpdateExternalSelection={onUpdateExternalSelection}
                onRemoveExternalSelection={onRemoveExternalSelection}
              />
            </section>

            {/* View mode switch */}
            <section className="space-y-2 border-t border-neutral-800 pt-4">
              <h3 className={SECTION_TITLE}>Widok</h3>
              <div className="flex flex-row space-x-2">
                <ViewModeSwitch
                  viewMode={viewMode}
                  onToggle={onViewModeToggle}
                />
                <FilterToggle
                  pressed={hideLectures}
                  onToggle={onToggleHideLectures}
                  label="Ukryj wykłady"
                  icon={<Book className="w-4 h-4" />}
                />
                <FilterToggle
                  pressed={!showAll}
                  onToggle={onToggleShowAll}
                  label="Pokaż tylko wybrane grupy"
                  icon={<CalendarOff className="w-4 h-4" />}
                />
              </div>
            </section>
            {/* Export buttons */}
            <section className="space-y-2 border-t border-neutral-800 pt-4">
              <h3 className={SECTION_TITLE}>Eksport</h3>
              <button
                onClick={handleExportICS}
                disabled={!personalReady}
                className="w-full px-3 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded transition-colors text-sm"
              >
                Eksportuj ICS
              </button>

              <ExportPngButton
                viewMode={viewMode}
                exportRef={exportRef}
                disabled={isScheduleLoading}
                viewedWeekRange={viewedWeekRange}
                selection={selection}
                combinedOptions={combinedOptions}
              />
            </section>
            </div>

            {aiAvailable && <div id="settings-panel-ai" role="tabpanel" aria-labelledby="settings-tab-ai"
              hidden={activeTab !== "ai"} className="space-y-6">
              {process.env.REACT_APP_PERSONAL_SCHEDULE==='true'&&<AiSettings/>}
              {process.env.REACT_APP_CALENDAR_SYNC==='true'&&<CalendarSyncSettings currentSchedule={currentSchedule}
                activeGroupSetId={activeGroupSetId} groupSetOptions={groupSetOptions}/>}
            </div>}
          </div>
        </div>
      </div>

      {mobileFloatingClose && isOpen ? (
        <button
          aria-label="Zamknij ustawienia"
          onClick={onToggle}
          className="sm:hidden fixed right-7 bottom-7 z-[60] flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-white shadow-lg transition hover:bg-neutral-700 active:scale-95"
          type="button"
        >
          <X className="h-5 w-5" />
        </button>
      ) : null}
    </>
  );
}
