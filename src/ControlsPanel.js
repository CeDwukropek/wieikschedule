import React from "react";
import { ChevronRight, Book, CalendarOff } from "lucide-react";
import GroupFiltersPanel from "./GroupFiltersPanel";
import GroupSetManager from "./GroupSetManager";
import ViewModeSwitch from "./ViewModeSwitch";
import { ExportPngBtn } from "./ExportPngBtn";
import { exportICS } from "./exportICS";
import { allTimetables } from "./timetables";
import { HideLectures } from "./HideLectures";

export default function ControlsPanel({
  panelState,
  scheduleState,
  groupSetState,
  viewState,
  filterState,
  lektoratState,
  exportState,
}) {
  const { isOpen, onToggle } = panelState || {};
  const { currentSchedule, onScheduleChange } = scheduleState || {};
  const {
    activeGroupSetId,
    activeGroupSetName,
    groupSetOptions,
    onGroupSetChange,
    onCreateGroupSet,
    onRenameActiveGroupSet,
    onDeleteActiveGroupSet,
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
    computeFiltered,
    groupConfigs,
    onGroupChange,
  } = filterState || {};
  const {
    shouldShowLectoratSelect,
    selectedLectoratSubject,
    onLectoratChange,
    lektoratOptions,
  } = lektoratState || {};
  const { exportRef, viewedWeekRange, selection, combinedOptions } =
    exportState || {};

  const handleExportICS = () => {
    // Export should include ALL events from the schedule with user's group filters applied
    // but without week filtering. We pass null as weekStartDate to bypass week filtering
    const allWeeksFiltered = computeFiltered(
      schedule,
      studentGroups,
      hideLectures,
      showAll,
      null, // null weekStartDate = no week filtering
      selectedLectoratSubject,
    );
    exportICS(allWeeksFiltered);
  };

  return (
    <>
      {/* Side panel backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={onToggle} />
      )}

      {/* Side panel */}
      <div
        className={`fixed right-0 top-0 bottom-0 bg-neutral-900 border-l border-neutral-800 shadow-2xl transition-transform duration-300 ease-out z-50 w-80 flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Sticky header */}
        <div className="sticky top-0 z-10 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between p-6">
          <h2 className="text-lg font-semibold text-white">Opcje</h2>
          <button
            onClick={onToggle}
            className="p-2 rounded hover:bg-neutral-700 text-gray-300 hover:text-white"
            type="button"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Scrollable content */}
        <div
          className="flex-1 overflow-y-auto "
          style={{ "scrollbar-width": "none" }}
        >
          <div className="p-6 space-y-6 ">
            {/* Schedule selector */}
            <div className="space-y-2">
              <label className="text-xs text-gray-400">Plan zajęć</label>
              <select
                value={currentSchedule}
                onChange={(e) => onScheduleChange(e.target.value)}
                className="w-full px-3 py-1.5 bg-neutral-800 text-gray-300 border border-neutral-700 rounded text-sm"
              >
                {allTimetables.map((tt) => (
                  <option key={tt.id} value={tt.id}>
                    {tt.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Group filters */}
            <div className="space-y-2 pb-4 border-b border-neutral-800">
              <h3 className="text-sm font-medium text-gray-200">Filtry grup</h3>
              <GroupFiltersPanel
                groupConfigs={groupConfigs}
                studentGroups={studentGroups}
                onGroupChange={onGroupChange}
                shouldShowLectoratSelect={shouldShowLectoratSelect}
                selectedLectoratSubject={selectedLectoratSubject}
                onLectoratChange={onLectoratChange}
                lektoratOptions={lektoratOptions}
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
                compact
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
                <HideLectures
                  val={hideLectures}
                  setVal={onToggleHideLectures}
                  icon={<Book className="w-4 h-4" />}
                />
                <HideLectures
                  val={!showAll}
                  setVal={onToggleShowAll}
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

              <ExportPngBtn
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
    </>
  );
}
