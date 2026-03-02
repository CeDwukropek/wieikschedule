import React, { useState, useRef, useMemo, useEffect } from "react";
import { Menu } from "lucide-react";
import { allTimetables } from "./timetables";
import ControlsPanel from "./ControlsPanel";
import WeekView from "./View/WeekView";
import DayView from "./View/DayView";
import FloatingMenu from "./Menu/FloatingMenu";
import FAQ from "./FAQ";
import { useSettings } from "./hooks/useSettings";
import { useScheduleManager } from "./hooks/useScheduleManager";
import { useEventFiltering } from "./hooks/useEventFiltering";
import { useDateHelpers } from "./hooks/useDateHelpers";

export default function Timetable() {
  const exportRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [isControlsPanelOpen, setIsControlsPanelOpen] = useState(false);

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
    activeGroupSetName,
    groupSetOptions,
    scheduleGroups,
    studentGroups,
    schedule,
    subjects,
    groupConfigs,
    currentTimetable,
    handleGroupChange,
    handleGroupSetChange,
    handleCreateGroupSet,
    handleUpdateActiveGroupSet,
    handleRenameActiveGroupSet,
    handleDeleteActiveGroupSet,
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

  const selectedLectoratSubject = "";
  const shouldShowLectoratSelect = false;

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
      <ControlsPanel
        isOpen={isControlsPanelOpen}
        onToggle={() => setIsControlsPanelOpen(!isControlsPanelOpen)}
        currentSchedule={currentSchedule}
        onScheduleChange={handleScheduleChange}
        allTimetables={allTimetables}
        activeGroupSetId={activeGroupSetId}
        activeGroupSetName={activeGroupSetName}
        groupSetOptions={groupSetOptions}
        onGroupSetChange={handleGroupSetChange}
        onCreateGroupSet={handleCreateGroupSet}
        onRenameActiveGroupSet={handleRenameActiveGroupSet}
        onDeleteActiveGroupSet={handleDeleteActiveGroupSet}
        viewMode={viewMode}
        onViewModeToggle={() =>
          setViewMode((prev) => (prev === "week" ? "day" : "week"))
        }
        hideLectures={hideLectures}
        onToggleHideLectures={() => setHideLectures(!hideLectures)}
        showAll={showAll}
        onToggleShowAll={() => setShowAll(!showAll)}
        schedule={schedule}
        studentGroups={studentGroups}
        viewedWeekStart={viewedWeekStart}
        selectedLectoratSubject={selectedLectoratSubject}
        exportRef={exportRef}
        viewedWeekRange={viewedWeekRange}
        selection={selection}
        combinedOptions={combinedOptions}
        computeFiltered={computeFiltered}
        groupConfigs={groupConfigs}
        onGroupChange={handleGroupChange}
        shouldShowLectoratSelect={shouldShowLectoratSelect}
        onLectoratChange={handleLectoratChange}
        lektoratOptions={lektoratOptions}
      />

      {/* --- Current period bar: auto parity + next week --- */}

      <div className="hidden sm:flex gap-3 items-center justify-between mb-4 ">
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

        {/* Menu button */}
        <button
          onClick={() => setIsControlsPanelOpen(!isControlsPanelOpen)}
          className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-neutral-900 text-gray-300 hover:bg-neutral-800 transition-colors rounded"
          title="Pokaż opcje"
        >
          <Menu size={18} />
        </button>
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
        onSaveGroupSet={handleCreateGroupSet}
        onCreateGroupSet={handleCreateGroupSet}
        onUpdateActiveGroupSet={handleUpdateActiveGroupSet}
        onRenameActiveGroupSet={handleRenameActiveGroupSet}
        onDeleteActiveGroupSet={handleDeleteActiveGroupSet}
        activeGroupSetName={activeGroupSetName}
        lektoratOptions={lektoratOptions}
        selectedLectoratSubject={selectedLectoratSubject}
        onLectoratChange={handleLectoratChange}
        shouldShowLectoratSelect={shouldShowLectoratSelect}
        onScheduleChange={handleScheduleChange}
        allTimetables={allTimetables}
      />
      {/* --- Widok planu --- */}
      {viewMode === "week" ? (
        <WeekView
          events={filtered}
          subjects={subjects}
          weekStartDate={viewedWeekStart}
          ref={exportRef}
        />
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
