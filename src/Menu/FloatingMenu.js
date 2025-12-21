import { Menu, X, Calendar, List, Eye, EyeOff, Palette } from "lucide-react";
import GroupInput from "../GroupInput";
import { exportICS } from "../exportICS";
import { DayMenu } from "./DayMenu";
import { WeekMenu } from "./WeekMenu";
import { ExportPngBtn } from "../ExportPngBtn";

export default function FloatingMenu({
  viewMode,
  setViewMode,
  setWeekParity,
  hideLectures,
  setHideLectures,
  showAll,
  setShowAll,
  studentGroups,
  setStudentGroups,
  handleGroupChange,
  filtered,
  open,
  setOpen,
  options = [],
  selection,
  onChange,
  activeParity,
  currentParity,
  currentRange,
  nextRange,
  nextParity,
  ref,
  weekParity,
  computeFiltered,
  SCHEDULE,
  theme,
  toggleTheme,
}) {
  function clearFilters() {
    setWeekParity("all");
    setHideLectures(false);
    setShowAll(false);
    setStudentGroups({ C: "Ć1", L: "L1", Lek: "Lek1", Lk: "Lk1" });
  }

  // whole floating menu visible only on mobile (hidden on sm and larger)
  return (
    <div className="sm:hidden">
      {/* Floating toggle button (bottom-right) */}
      <div className="sm:hidden fixed left-4 right-4 bottom-4 z-50 flex items-center justify-between gap-3 bg-neutral-900/90 backdrop-blur-md border border-neutral-800 rounded-full px-3 py-2 shadow-lg">
        <button
          onClick={() => setViewMode(viewMode === "week" ? "day" : "week")}
          className="ds-btn-ghost w-12 h-12"
        >
          {viewMode === "week" ? (
            <Calendar className="w-6 h-6 inline-block mr-2" />
          ) : (
            <List className="w-6 h-6 inline-block mr-2" />
          )}
        </button>
        {viewMode === "day" && (
          <DayMenu
            options={options}
            selection={selection}
            onChange={onChange}
          />
        )}
        {viewMode === "week" && (
          <WeekMenu
            events={filtered}
            activeParity={activeParity}
            setWeekParity={setWeekParity}
            currentParity={currentParity}
            nextParity={nextParity}
            currentRange={currentRange}
            nextRange={nextRange}
            open={open}
          />
        )}
        <button
          aria-label={open ? "Zamknij menu" : "Otwórz menu"}
          onClick={() => setOpen((s) => !s)}
          className={` z-50 ds-btn w-12 h-12 flex items-center justify-center rounded-full`}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {/* Slide-over panel */}
      <div
        className={`fixed right-0 bottom-0 top-0 z-40 w-full sm:w-96 bg-neutral-900 text-white shadow-xl transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="p-4 space-y-4 overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 96px)" }}
        >
          <div className="space-y-2">
            <div className="text-xs text-gray-400">Widok</div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("week")}
                className="ds-btn flex-1"
                data-active={viewMode === "week"}
              >
                <Calendar className="w-4 h-4 inline-block mr-2" /> Tydzień
              </button>
              <button
                onClick={() => setViewMode("day")}
                className="ds-btn flex-1"
                data-active={viewMode === "day"}
              >
                <List className="w-4 h-4 inline-block mr-2" /> Dzień
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setHideLectures((s) => !s)}
              className="ds-btn flex-1"
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
              className="ds-btn flex-1"
              data-active={showAll}
            >
              {showAll ? "Twój plan" : "Pokaż cały plan"}
            </button>
          </div>

          <div className="border-t border-neutral-800 pt-3">
            <button
              onClick={toggleTheme}
              className="ds-btn w-full"
            >
              <Palette className="w-4 h-4" />
              {theme === 'dark' ? 'Motyw niebieski' : 'Motyw ciemny'}
            </button>
          </div>

          <div className="border-t border-neutral-800 pt-3">
            <div className="text-xs text-gray-400 mb-2">Grupy studenta</div>
            <div className="grid grid-cols-2 gap-2">
              <GroupInput
                label="Ćw."
                type="C"
                value={studentGroups.C}
                onChange={handleGroupChange}
              />
              <GroupInput
                label="Lab."
                type="L"
                value={studentGroups.L}
                onChange={handleGroupChange}
              />
              <GroupInput
                label="Lektorat"
                type="Lek"
                value={studentGroups.Lek}
                onChange={handleGroupChange}
              />
              <GroupInput
                label="Lab. komp."
                type="Lk"
                value={studentGroups.Lk}
                onChange={handleGroupChange}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-800 flex gap-2">
            <button
              onClick={clearFilters}
              className="ds-btn flex-1"
            >
              Wyczyść filtry
            </button>
          </div>
          <div className="pt-3 border-t border-neutral-800 flex gap-2">
            <button
              className="ds-btn"
              onClick={() => {
                const dataForICS = computeFiltered(
                  SCHEDULE,
                  studentGroups,
                  hideLectures,
                  "all", // ⬅️ klucz: ignorujemy parzystość
                  showAll
                );
                exportICS(dataForICS);
              }}
            >
              Export ICS
            </button>
            <ExportPngBtn
              viewMode={viewMode}
              exportRef={ref}
              weekParity={weekParity}
              currentParity={currentParity}
              currentRange={currentRange}
              nextRange={nextRange}
              nextParity={nextParity}
              selection={selection}
              combinedOptions={options}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
