import React, { useState, useRef, useMemo, useEffect } from "react";
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
  const [hideLectures, setHideLectures] = useState(
    savedSettings?.hideLectures ?? false,
  );
  const [showAll, setShowAll] = useState(savedSettings?.showAll ?? false);
  const [selectedLectoratBySchedule, setSelectedLectoratBySchedule] = useState(
    savedSettings?.selectedLectoratBySchedule ?? {},
  );

  // Schedule and group management
  const {
    currentSchedule,
    scheduleGroupSets,
    activeGroupSetBySchedule,
    activeGroupSetId,
    groupSetOptions,
    scheduleGroups,
    studentGroups,
    schedule,
    subjects,
    groupConfigs,
    currentTimetable,
    handleGroupChange,
    handleGroupSetChange,
    handleSaveCurrentAsNewSet,
    handleScheduleChange,
  } = useScheduleManager(savedSettings);

  // Date helpers and parity calculations
  const {
    currentParity,
    nextParity,
    currentRange,
    nextRange,
    getRangeByOffset,
    getWeekStartByOffset,
    getOffsetForDate,
    combinedOptions,
    defaultDayIndex,
  } = useDateHelpers();

  const minAllowedOffset = useMemo(() => {
    const value = getOffsetForDate(currentTimetable?.minDate);
    return value == null ? Number.NEGATIVE_INFINITY : value;
  }, [currentTimetable, getOffsetForDate]);

  const maxAllowedOffset = useMemo(() => {
    const value = getOffsetForDate(currentTimetable?.maxDate);
    return value == null ? Number.POSITIVE_INFINITY : value;
  }, [currentTimetable, getOffsetForDate]);

  const [weekOffset, setWeekOffset] = useState(
    Number.isFinite(savedSettings?.weekOffset)
      ? Number(savedSettings.weekOffset)
      : savedSettings?.activeWeekKey === "prev"
        ? -1
        : savedSettings?.activeWeekKey === "next"
          ? 1
          : 0,
  );

  const viewedWeekRange = useMemo(
    () => getRangeByOffset(weekOffset),
    [getRangeByOffset, weekOffset],
  );

  const viewedWeekStart = useMemo(
    () => getWeekStartByOffset(weekOffset),
    [getWeekStartByOffset, weekOffset],
  );

  const canGoPrevWeek = weekOffset > minAllowedOffset;
  const canGoNextWeek = weekOffset < maxAllowedOffset;

  const lektoratOptions = useMemo(() => {
    const normalizeText = (value) =>
      String(value || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    const isLectorat = (ev) => {
      const eventType = normalizeText(ev?.type);
      if (eventType.includes("lekt")) return true;
      if (!Array.isArray(ev?.groups)) return false;
      return ev.groups.some((group) => normalizeText(group).startsWith("lek"));
    };

    const map = new Map();
    (schedule || []).forEach((ev) => {
      if (!isLectorat(ev)) return;
      const key = String(ev?.subj || ev?.title || "").trim();
      if (!key || map.has(key)) return;
      const label =
        String(
          subjects?.[ev?.subj]?.name || ev?.title || ev?.subj || "",
        ).trim() || key;
      map.set(key, label);
    });

    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, "pl"));
  }, [schedule, subjects]);

  const selectedLectoratSubject =
    selectedLectoratBySchedule[currentSchedule] || "";
  const shouldShowLectoratSelect =
    !showAll &&
    !String(studentGroups?.Lek || "").trim() &&
    lektoratOptions.length > 1;

  useEffect(() => {
    if (!currentSchedule || !lektoratOptions.length) return;
    const current = selectedLectoratBySchedule[currentSchedule];
    const exists = lektoratOptions.some((option) => option.value === current);
    if (exists) return;

    setSelectedLectoratBySchedule((prev) => ({
      ...prev,
      [currentSchedule]: lektoratOptions[0].value,
    }));
  }, [currentSchedule, lektoratOptions, selectedLectoratBySchedule]);

  const handleLectoratChange = (value) => {
    setSelectedLectoratBySchedule((prev) => ({
      ...prev,
      [currentSchedule]: value,
    }));
  };

  useEffect(() => {
    const clamped = Math.min(
      Math.max(weekOffset, minAllowedOffset),
      maxAllowedOffset,
    );
    if (clamped !== weekOffset) {
      setWeekOffset(clamped);
    }
  }, [weekOffset, minAllowedOffset, maxAllowedOffset]);

  const goToPrevWeek = () => {
    if (!canGoPrevWeek) return;
    setWeekOffset((prev) => Math.max(prev - 1, minAllowedOffset));
  };

  const goToNextWeek = () => {
    if (!canGoNextWeek) return;
    setWeekOffset((prev) => Math.min(prev + 1, maxAllowedOffset));
  };

  const resetToCurrentWeek = () => {
    setWeekOffset(0);
  };

  // Event filtering with caching
  const { filtered, computeFiltered } = useEventFiltering(
    schedule,
    studentGroups,
    hideLectures,
    showAll,
    viewedWeekStart,
    selectedLectoratSubject,
  );

  // Persist all settings
  useSettings({
    viewMode,
    weekOffset,
    hideLectures,
    showAll,
    currentSchedule,
    scheduleGroupSets,
    activeGroupSetBySchedule,
    selectedLectoratBySchedule,
    scheduleGroups,
  });

  // Day view selection
  const [selection, setSelection] = useState(`current:${defaultDayIndex}`);

  // Events for DayView filtered by selection's parity
  const dayEvents = useMemo(() => {
    try {
      const parts = (selection || "current:0").split(":");
      const selParityToken = parts[0];
      const selectedOffset = selParityToken === "next" ? 1 : 0;
      const selectedWeekStart = getWeekStartByOffset(selectedOffset);
      return computeFiltered(
        schedule,
        studentGroups,
        hideLectures,
        showAll,
        selectedWeekStart,
        selectedLectoratSubject,
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
    selectedLectoratSubject,
    getWeekStartByOffset,
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
        <select
          value={activeGroupSetId}
          onChange={(e) => handleGroupSetChange(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-neutral-900 text-gray-300 border border-neutral-800"
        >
          {groupSetOptions.map((set) => (
            <option key={set.id} value={set.id}>
              {set.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleSaveCurrentAsNewSet}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-900 text-gray-300"
        >
          Zapisz nowy zestaw
        </button>
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
          exportRef={exportRef}
          viewedWeekRange={viewedWeekRange}
          selection={selection}
          combinedOptions={combinedOptions}
        />
      </div>

      {/* --- Wybór grup --- hidden on mobile, visible on sm+ */}
      <div className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
      {shouldShowLectoratSelect ? (
        <div className="hidden sm:flex items-center gap-2 mb-4">
          <span className="text-sm text-gray-400">Język lektoratu:</span>
          <select
            value={selectedLectoratSubject}
            onChange={(e) => handleLectoratChange(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-neutral-900 text-gray-300 border border-neutral-800"
          >
            {lektoratOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      {/* --- Current period bar: auto parity + next week --- */}

      <div className="hidden sm:block gap-3 items-center mb-4 ">
        {viewMode === "week" ? (
          <div className="flex items-center gap-3">
            <button
              onClick={goToPrevWeek}
              disabled={!canGoPrevWeek}
              className={`px-3 py-1 rounded text-sm ${
                canGoPrevWeek
                  ? "bg-neutral-900 text-gray-300"
                  : "bg-neutral-900/50 text-gray-600 cursor-not-allowed"
              }`}
            >
              Prev
            </button>

            <button
              onClick={resetToCurrentWeek}
              className={`px-3 ml-3 py-1 rounded text-sm ${
                weekOffset === 0
                  ? "bg-neutral-800"
                  : "bg-neutral-900 text-gray-300"
              }`}
            >
              {viewedWeekRange}
            </button>

            <button
              onClick={goToNextWeek}
              disabled={!canGoNextWeek}
              className={`px-3 ml-3 py-1 rounded text-sm ${
                canGoNextWeek
                  ? "bg-neutral-900 text-gray-300"
                  : "bg-neutral-900/50 text-gray-600 cursor-not-allowed"
              }`}
            >
              Next
            </button>
          </div>
        ) : null}
      </div>

      {/* Floating menu / settings (bottom-right) */}

      <FloatingMenu
        viewMode={viewMode}
        setViewMode={setViewMode}
        hideLectures={hideLectures}
        setHideLectures={setHideLectures}
        showAll={showAll}
        setShowAll={setShowAll}
        studentGroups={studentGroups}
        groupConfigs={groupConfigs}
        handleGroupChange={handleGroupChange}
        onPrevWeek={goToPrevWeek}
        onResetWeek={resetToCurrentWeek}
        onNextWeek={goToNextWeek}
        viewedWeekRange={viewedWeekRange}
        viewedWeekStart={viewedWeekStart}
        isCurrentWeek={weekOffset === 0}
        canGoPrevWeek={canGoPrevWeek}
        canGoNextWeek={canGoNextWeek}
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
        computeFiltered={computeFiltered}
        SCHEDULE={schedule}
        currentSchedule={currentSchedule}
        activeGroupSetId={activeGroupSetId}
        groupSetOptions={groupSetOptions}
        onGroupSetChange={handleGroupSetChange}
        onSaveGroupSet={handleSaveCurrentAsNewSet}
        lektoratOptions={lektoratOptions}
        selectedLectoratSubject={selectedLectoratSubject}
        onLectoratChange={handleLectoratChange}
        shouldShowLectoratSelect={shouldShowLectoratSelect}
        onScheduleChange={handleScheduleChange}
        allTimetables={allTimetables}
      />
      {/* --- Widok planu --- */}
      {viewMode === "week" ? (
        <WeekView events={filtered} subjects={subjects} ref={exportRef} />
      ) : (
        <DayView
          key={`day-${selection}`}
          events={dayEvents}
          subjects={subjects}
          // parity/date helpers from App so DayView can show ranges and switch parity
          currentParity={currentParity}
          nextParity={nextParity}
          currentRange={currentRange}
          nextRange={nextRange}
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
