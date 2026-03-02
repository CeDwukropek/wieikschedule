import React from "react";
import { ChevronRight, Eye, EyeOff } from "lucide-react";
import GroupFiltersPanel from "./GroupFiltersPanel";
import GroupSetManager from "./GroupSetManager";
import ViewModeSwitch from "./ViewModeSwitch";
import { ExportPngBtn } from "./ExportPngBtn";
import { exportICS } from "./exportICS";

export default function ControlsPanel({
  isOpen,
  onToggle,
  currentSchedule,
  onScheduleChange,
  allTimetables,
  activeGroupSetId,
  activeGroupSetName,
  groupSetOptions,
  onGroupSetChange,
  onCreateGroupSet,
  onRenameActiveGroupSet,
  onDeleteActiveGroupSet,
  viewMode,
  onViewModeToggle,
  hideLectures,
  onToggleHideLectures,
  showAll,
  onToggleShowAll,
  schedule,
  studentGroups,
  viewedWeekStart,
  selectedLectoratSubject,
  exportRef,
  viewedWeekRange,
  selection,
  combinedOptions,
  computeFiltered,
  groupConfigs,
  onGroupChange,
  shouldShowLectoratSelect,
  onLectoratChange,
  lektoratOptions,
}) {
  const sectionClass =
    "rounded-xl border border-neutral-800/80 bg-neutral-900/50 p-4 space-y-2";
  const fieldClass =
    "w-full px-3 py-2 bg-neutral-900/80 text-gray-200 border border-neutral-700/80 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/60";
  const actionBtnClass =
    "w-full flex items-center justify-between px-3 py-2 bg-neutral-900/80 hover:bg-neutral-800 text-gray-200 hover:text-white border border-neutral-700/80 rounded-lg transition-colors text-sm";

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
        <div
          className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[1px]"
          onClick={onToggle}
        />
      )}

      {/* Side panel */}
      <div
        className={`fixed right-0 top-0 bottom-0 bg-neutral-950/95 backdrop-blur-xl border-l border-neutral-700/70 shadow-[0_0_30px_rgba(0,0,0,0.45)] transition-transform duration-300 ease-out z-50 w-80 flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Sticky header */}
        <div className="sticky top-0 z-10 bg-neutral-950/95 backdrop-blur-xl border-b border-neutral-800 flex items-center justify-between p-5">
          <h2 className="text-base font-semibold text-white tracking-wide">
            Opcje
          </h2>
          <button
            onClick={onToggle}
            className="p-2 rounded-lg border border-neutral-700/80 bg-neutral-900/70 hover:bg-neutral-800 text-gray-300 hover:text-white transition-colors"
            type="button"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Scrollable content */}
        <div
          className="flex-1 overflow-y-auto scrollbar-hide"
          style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
        >
          <div className="p-5 space-y-4">
            {/* Schedule selector */}
            <div className={sectionClass}>
              <label className="text-xs text-gray-400 uppercase tracking-wide">
                Plan zajęć
              </label>
              <select
                value={currentSchedule}
                onChange={(e) => onScheduleChange(e.target.value)}
                className={fieldClass}
              >
                {allTimetables.map((tt) => (
                  <option key={tt.id} value={tt.id}>
                    {tt.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Group filters */}
            <div className={sectionClass}>
              <h3 className="text-sm font-medium text-gray-100">Filtry grup</h3>
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
            <div className={sectionClass}>
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
            <div className={`${sectionClass} flex flex-col`}>
              <label className="text-xs text-gray-400 uppercase tracking-wide">
                Widok
              </label>
              <ViewModeSwitch viewMode={viewMode} onToggle={onViewModeToggle} />
            </div>

            {/* Hide lectures toggle */}
            <button onClick={onToggleHideLectures} className={actionBtnClass}>
              <span>{hideLectures ? "Pokaż wykłady" : "Ukryj wykłady"}</span>
              {hideLectures ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>

            {/* Show all toggle */}
            <button
              onClick={onToggleShowAll}
              className="w-full px-3 py-2 bg-neutral-900/80 hover:bg-neutral-800 text-gray-200 hover:text-white border border-neutral-700/80 rounded-lg transition-colors text-sm"
            >
              {showAll ? "Pokaż twój plan" : "Pokaż cały plan"}
            </button>

            {/* Export buttons */}
            <div className={sectionClass}>
              <button
                onClick={handleExportICS}
                className="w-full px-3 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
              >
                Eksportuj ICS
              </button>

              <ExportPngBtn
                viewMode={viewMode}
                exportRef={exportRef}
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
