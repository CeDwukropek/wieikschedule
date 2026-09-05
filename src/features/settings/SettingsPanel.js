import { selectExportEvents } from "../schedule/export/selectExportEvents";
import React, { useEffect, useRef } from "react";
import { ChevronRight, Book, CalendarOff, X } from "lucide-react";
import GroupFiltersPanel from "../schedule/components/GroupFiltersPanel";
import GroupSetManager from "../schedule/components/GroupSetManager";
import ViewModeSwitch from "./ViewModeSwitch";
import { ExportPngButton } from "../schedule/export/ExportPngButton";
import { exportICS } from "../schedule/export/exportICS";
import { FilterToggle } from "./FilterToggle";
import ExternalGroupSelections from "../schedule/components/ExternalGroupSelections";
import GoogleSignInButton from "../auth/GoogleSignInButton";

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
  const { exportRef, viewedWeekRange, selection, combinedOptions } =
    exportState || {};
  const scheduleOptions =
    timetableOptions.length > 0
      ? timetableOptions
      : currentSchedule
        ? [
            {
              id: currentSchedule,
              name: `${currentSchedule} (zapisany lokalnie)`,
            },
          ]
        : [];

  const scheduleValue = scheduleOptions.some(
    (option) => option.id === currentSchedule,
  )
    ? currentSchedule
    : "";

  const handleExportICS = () => exportICS(selectExportEvents({
    schedule, groups: studentGroups, hideLectures, showAll,
    externalSelections, timetables: loadedTimetables,
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

            {/* Schedule selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs text-gray-400">Plan zajęć</label>
                {timetableDataSourceLabel ? (
                  <span className="rounded-full border border-neutral-700 bg-neutral-800 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-neutral-300">
                    {timetableDataSourceLabel}
                  </span>
                ) : null}
              </div>
              <select
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
            </div>

            {/* Group filters */}
            <div className="space-y-2 pb-4 border-b border-neutral-800">
              <h3 className="text-sm font-medium text-gray-200">Filtry grup</h3>
              <GroupFiltersPanel
                groupConfigs={groupConfigs}
                studentGroups={studentGroups}
                onGroupChange={onGroupChange}
              />
            </div>

            <div className="space-y-2 pb-4 border-b border-neutral-800">
              <ExternalGroupSelections
                currentSchedule={currentSchedule}
                timetableOptions={timetableOptions}
                externalSelections={externalSelections}
                loadedTimetables={loadedTimetables}
                onAddExternalSelection={onAddExternalSelection}
                onUpdateExternalSelection={onUpdateExternalSelection}
                onRemoveExternalSelection={onRemoveExternalSelection}
              />
            </div>

            {/* Group set manager */}
            <div className="space-y-2">
              <GroupSetManager
                activeGroupSetId={activeGroupSetId}
                activeGroupSetName={activeGroupSetName}
                groupSetOptions={groupSetOptions}
                onGroupSetChange={onGroupSetChange}
                onCreateGroupSet={onCreateGroupSet}
                onRenameActiveGroupSet={onRenameActiveGroupSet}
                onDeleteActiveGroupSet={onDeleteActiveGroupSet}
              />
            </div>

            {/* View mode switch */}
            <div className="space-y-2 flex flex-col">
              <label className="text-xs text-gray-400">Widok</label>
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
            </div>
            {/* Export buttons */}
            <div className="space-y-2 pt-4 border-t border-neutral-800">
              <button
                onClick={handleExportICS}
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
            </div>
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
