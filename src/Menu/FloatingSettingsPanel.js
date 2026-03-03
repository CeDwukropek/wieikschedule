import { Calendar, Eye, EyeOff, List, X } from "lucide-react";
import GroupInput from "../GroupInput";
import GroupSetManager from "../GroupSetManager";
import { exportICS } from "../exportICS";
import { ExportPngBtn } from "../ExportPngBtn";

export function FloatingSettingsPanel({
  open,
  currentSchedule,
  onScheduleChange,
  allTimetables = [],
  activeGroupSetId,
  activeGroupSetName,
  groupSetOptions = [],
  onGroupSetChange,
  onSaveGroupSet,
  onCreateGroupSet,
  onRenameActiveGroupSet,
  onDeleteActiveGroupSet,
  viewMode,
  setViewMode,
  hideLectures,
  setHideLectures,
  showAll,
  setShowAll,
  groupConfigs = [],
  studentGroups,
  handleGroupChange,
  shouldShowLectoratSelect,
  selectedLectoratSubject,
  onLectoratChange,
  lektoratOptions = [],
  setOpen,
  computeFiltered,
  SCHEDULE,
  viewedWeekStart,
  ref,
  viewedWeekRange,
  selection,
  options = [],
}) {
  function clearFilters() {
    setHideLectures(false);
    setShowAll(false);
  }

  return (
    <div
      className={`fixed right-0 bottom-0 top-0 z-40 w-full sm:w-96 bg-neutral-900 text-white shadow-xl transform transition-transform duration-300 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="p-4 space-y-4 overflow-y-auto pb-14"
        style={{ maxHeight: "calc(100vh - 96px)" }}
      >
        <div className="space-y-2">
          <div className="text-xs text-gray-400">Plan zajęć</div>
          <select
            value={currentSchedule}
            onChange={(e) => onScheduleChange(e.target.value)}
            className="w-full px-3 py-2 rounded bg-neutral-800 text-white border border-neutral-700"
          >
            {allTimetables.map((tt) => (
              <option key={tt.id} value={tt.id}>
                {tt.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <GroupSetManager
            compact
            activeGroupSetId={activeGroupSetId}
            activeGroupSetName={activeGroupSetName}
            groupSetOptions={groupSetOptions}
            onGroupSetChange={onGroupSetChange}
            onCreateGroupSet={onCreateGroupSet || onSaveGroupSet}
            onRenameActiveGroupSet={onRenameActiveGroupSet}
            onDeleteActiveGroupSet={onDeleteActiveGroupSet}
          />
        </div>

        <div className="space-y-2">
          <div className="text-xs text-gray-400">Widok</div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("week")}
              className={`flex-1 px-3 py-2 rounded ${
                viewMode === "week"
                  ? "bg-neutral-800"
                  : "bg-neutral-900 text-gray-300"
              }`}
            >
              <Calendar className="w-4 h-4 inline-block mr-2" /> Tydzień
            </button>
            <button
              onClick={() => setViewMode("day")}
              className={`flex-1 px-3 py-2 rounded ${
                viewMode === "day"
                  ? "bg-neutral-800"
                  : "bg-neutral-900 text-gray-300"
              }`}
            >
              <List className="w-4 h-4 inline-block mr-2" /> Dzień
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setHideLectures((s) => !s)}
            className="flex-1 px-3 py-2 rounded bg-neutral-900 text-gray-300 flex items-center gap-2"
          >
            {hideLectures ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            {hideLectures ? "Pokaż wykłady" : "Ukryj wykłady"}
          </button>

          <button
            onClick={() => setShowAll((s) => !s)}
            className="flex-1 px-3 py-2 rounded bg-neutral-900 text-gray-300"
          >
            {showAll ? "Twój plan" : "Pokaż cały plan"}
          </button>
        </div>

        <div className="border-t border-neutral-800 pt-3">
          <div className="text-xs text-gray-400 mb-2">Grupy studenta</div>
          <div className="grid grid-cols-2 gap-2">
            {groupConfigs.map((groupConfig) => (
              <GroupInput
                key={groupConfig.type}
                label={groupConfig.label}
                type={groupConfig.type}
                value={studentGroups[groupConfig.type] || ""}
                onChange={handleGroupChange}
              />
            ))}
          </div>
        </div>

        {shouldShowLectoratSelect ? (
          <div className="border-t border-neutral-800 pt-3 space-y-2">
            <div className="text-xs text-gray-400">Język lektoratu</div>
            <select
              value={selectedLectoratSubject}
              onChange={(e) => onLectoratChange?.(e.target.value)}
              className="w-full px-3 py-2 rounded bg-neutral-800 text-white border border-neutral-700"
            >
              {lektoratOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="pt-3 border-t border-neutral-800 flex gap-2">
          <button
            onClick={clearFilters}
            className="flex-1 px-3 py-2 rounded bg-neutral-800 text-white"
          >
            Wyczyść filtry
          </button>
        </div>

        <div className="pt-3 border-t border-neutral-800 flex gap-2">
          <button
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-700 text-gray-300"
            onClick={() => {
              const dataForICS = computeFiltered(
                SCHEDULE,
                studentGroups,
                hideLectures,
                showAll,
                viewedWeekStart,
                selectedLectoratSubject,
              );
              exportICS(dataForICS);
            }}
          >
            Export ICS
          </button>

          <ExportPngBtn
            viewMode={viewMode}
            exportRef={ref}
            viewedWeekRange={viewedWeekRange}
            selection={selection}
            combinedOptions={options}
          />
        </div>
      </div>

      <button
        aria-label="Zamknij ustawienia"
        onClick={() => setOpen(false)}
        className="absolute right-7 bottom-6 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white shadow-lg"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
