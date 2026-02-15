import React, { useState, useRef, useMemo } from "react";
import { Calendar, List, Eye, EyeOff } from "lucide-react";
import { allTimetables } from "./timetables";
import GroupInput from "./GroupInput";
import WeekView from "./View/WeekView";
import DayView from "./View/DayView";
import FloatingMenu from "./Menu/FloatingMenu";
import FAQ from "./FAQ";
import { exportICS } from "./exportICS";
import { ExportPngBtn } from "./ExportPngBtn";
import { useSettings } from "./hooks/useSettings";
import { useScheduleManager } from "./hooks/useScheduleManager";
import { useEventFiltering } from "./hooks/useEventFiltering";
import { useDateHelpers } from "./hooks/useDateHelpers";

export default function Timetable() {
  const exportRef = useRef(null);
  const [open, setOpen] = useState(false);

  // Load saved settings from localStorage
  const savedSettings = useSettings({});

  // View and filter states
  const [viewMode, setViewMode] = useState(savedSettings?.viewMode ?? "week");
  const [weekParity, setWeekParity] = useState(
    savedSettings?.weekParity ?? "all",
  );
  const [hideLectures, setHideLectures] = useState(
    savedSettings?.hideLectures ?? false,
  );
  const [showAll, setShowAll] = useState(savedSettings?.showAll ?? false);

  // Schedule and group management
  const {
    currentSchedule,
    scheduleGroups,
    studentGroups,
    schedule,
    handleGroupChange,
    handleScheduleChange,
  } = useScheduleManager(savedSettings);

  // Date helpers and parity calculations
  const {
    currentParity,
    nextParity,
    currentRange,
    nextRange,
    combinedOptions,
    defaultDayIndex,
  } = useDateHelpers();

  // Event filtering with caching
  const { filtered, computeFiltered } = useEventFiltering(
    schedule,
    studentGroups,
    hideLectures,
    weekParity,
    showAll,
  );

  // Persist all settings
  useSettings({
    viewMode,
    weekParity,
    hideLectures,
    showAll,
    currentSchedule,
    scheduleGroups,
  });

  // Day view selection
  const [selection, setSelection] = useState(`current:${defaultDayIndex}`);

  // Events for DayView filtered by selection's parity
  const dayEvents = useMemo(() => {
    try {
      const parts = (selection || "current:0").split(":");
      const selParityToken = parts[0];
      const parityToUse =
        selParityToken === "current" ? currentParity : nextParity;
      return computeFiltered(
        schedule,
        studentGroups,
        hideLectures,
        parityToUse,
        showAll,
      );
    } catch (e) {
      return filtered;
    }
  }, [
    selection,
    computeFiltered,
    studentGroups,
    hideLectures,
    showAll,
    currentParity,
    nextParity,
    filtered,
    schedule,
  ]);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* --- Kontrolki --- */}
      {/* hidden on mobile, visible on sm and up */}
      <div className="hidden sm:flex flex-wrap items-center gap-3 mb-6">
        {/* Schedule selector */}
        <select
          value={currentSchedule}
          onChange={(e) => handleScheduleChange(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-neutral-900 text-gray-300 border border-neutral-800"
        >
          {allTimetables.map((tt) => (
            <option key={tt.id} value={tt.id}>
              {tt.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => setViewMode("week")}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${
            viewMode === "week"
              ? "bg-neutral-800 text-white"
              : "bg-neutral-900 text-gray-400"
          }`}
        >
          <Calendar className="w-4 h-4" /> Tydzień
        </button>
        <button
          onClick={() => setViewMode("day")}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${
            viewMode === "day"
              ? "bg-neutral-800 text-white"
              : "bg-neutral-900 text-gray-400"
          }`}
        >
          <List className="w-4 h-4" /> Dzień
        </button>

        <button
          onClick={() => setHideLectures(!hideLectures)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-900 text-gray-300"
        >
          {hideLectures ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
          {hideLectures ? "Pokaż wykłady" : "Ukryj wykłady"}
        </button>

        <button
          onClick={() => setShowAll(!showAll)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-900 text-gray-300"
        >
          {showAll ? "Twój plan" : "Pokaż cały plan"}
        </button>
        <button
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-900 text-gray-300"
          onClick={() => {
            const dataForICS = computeFiltered(
              schedule,
              studentGroups,
              hideLectures,
              "all", // ⬅️ klucz: ignorujemy parzystość
              showAll,
            );
            exportICS(dataForICS);
          }}
        >
          Export ICS
        </button>
        <ExportPngBtn
          viewMode={viewMode}
          exportRef={exportRef}
          weekParity={weekParity}
          currentParity={currentParity}
          currentRange={currentRange}
          nextRange={nextRange}
          nextParity={nextParity}
          selection={selection}
          combinedOptions={combinedOptions}
        />
      </div>

      {/* --- Wybór grup --- hidden on mobile, visible on sm+ */}
      <div className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <GroupInput
          label="Ćwiczenia"
          type="C"
          value={studentGroups.C}
          onChange={handleGroupChange}
        />
        <GroupInput
          label="Laboratoria"
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
      {/* --- Current period bar: auto parity + next week --- */}

      <div className="hidden sm:block gap-3 items-center mb-4 ">
        {viewMode === "week" ? (
          <>
            <button
              onClick={() => setWeekParity(currentParity)}
              className={`px-3 py-1 rounded text-sm ${
                weekParity === currentParity
                  ? "bg-neutral-800"
                  : "bg-neutral-900 text-gray-300"
              }`}
            >
              {currentRange}
            </button>

            <button
              onClick={() => setWeekParity(nextParity)}
              className={`px-3 ml-3 py-1 rounded text-sm ${
                weekParity === nextParity
                  ? "bg-neutral-800"
                  : "bg-neutral-900 text-gray-300"
              }`}
            >
              {nextRange}
            </button>
          </>
        ) : null}
      </div>

      {/* Floating menu / settings (bottom-right) */}

      <FloatingMenu
        viewMode={viewMode}
        setViewMode={setViewMode}
        setWeekParity={setWeekParity}
        hideLectures={hideLectures}
        setHideLectures={setHideLectures}
        showAll={showAll}
        setShowAll={setShowAll}
        studentGroups={studentGroups}
        handleGroupChange={handleGroupChange}
        activeParity={weekParity}
        currentParity={currentParity}
        currentRange={currentRange}
        nextRange={nextRange}
        nextParity={nextParity}
        filtered={filtered}
        open={open}
        setOpen={setOpen}
        options={combinedOptions}
        selection={selection}
        onChange={setSelection}
        ref={exportRef}
        weekParity={weekParity}
        computeFiltered={computeFiltered}
        SCHEDULE={schedule}
        currentSchedule={currentSchedule}
        onScheduleChange={handleScheduleChange}
        allTimetables={allTimetables}
      />
      {/* --- Widok planu --- */}
      {viewMode === "week" ? (
        <WeekView
          key={`week-${weekParity}`}
          events={filtered}
          ref={exportRef}
        />
      ) : (
        <DayView
          key={`day-${selection}`}
          events={dayEvents}
          // parity/date helpers from App so DayView can show ranges and switch parity
          currentParity={currentParity}
          nextParity={nextParity}
          currentRange={currentRange}
          nextRange={nextRange}
          setWeekParity={setWeekParity}
          // control selection externally so BottomDayNav drives it
          options={combinedOptions}
          selection={selection}
          onSelectionChange={setSelection}
          ref={exportRef}
        />
      )}
      <FAQ />
    </div>
  );
}
