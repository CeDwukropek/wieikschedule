import React, {
  useState,
  useRef,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import { Menu } from "lucide-react";
import ControlsPanel from "./ControlsPanel";
import WeekView from "./View/WeekView";
import DayView from "./View/DayView";
import FloatingMenu from "./Menu/FloatingMenu";
import FAQ from "./FAQ";
import { useSettings } from "./hooks/useSettings";
import { useScheduleManager } from "./hooks/useScheduleManager";
import { useEventFiltering } from "./hooks/useEventFiltering";
import { useDateHelpers } from "./hooks/useDateHelpers";
import { formatDate } from "./utils/dateUtils";

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
    isScheduleLoading,
    handleGroupChange,
    handleGroupSetChange,
    handleCreateGroupSet,
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

  const dayOptions = useMemo(() => {
    const names = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek"];

    if (
      !Number.isFinite(minAllowedOffset) ||
      !Number.isFinite(maxAllowedOffset)
    ) {
      return [0, 1].flatMap((offset) => {
        const baseDate = getWeekStartByOffset(offset);
        return names.map((name, i) => {
          const d = new Date(baseDate);
          d.setDate(d.getDate() + i);
          return {
            value: `${offset}:${i}`,
            label: name,
            date: formatDate(d),
          };
        });
      });
    }

    const result = [];
    for (
      let offset = minAllowedOffset;
      offset <= maxAllowedOffset;
      offset += 1
    ) {
      const baseDate = getWeekStartByOffset(offset);
      names.forEach((name, i) => {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + i);
        result.push({
          value: `${offset}:${i}`,
          label: name,
          date: formatDate(d),
        });
      });
    }
    return result;
  }, [getWeekStartByOffset, maxAllowedOffset, minAllowedOffset]);

  const parseDaySelection = useCallback(
    (value) => {
      const [rawOffset, rawDay] = String(value || "").split(":");
      const dayIndex = Number(rawDay);
      const safeDayIndex = Number.isFinite(dayIndex)
        ? Math.min(Math.max(dayIndex, 0), 4)
        : defaultDayIndex;

      if (rawOffset === "current") {
        return { selectedWeekOffset: 0, selectedDayIndex: safeDayIndex };
      }

      if (rawOffset === "next") {
        return { selectedWeekOffset: 1, selectedDayIndex: safeDayIndex };
      }

      const parsedOffset = Number(rawOffset);
      const selectedWeekOffset = Number.isFinite(parsedOffset)
        ? parsedOffset
        : 0;

      return { selectedWeekOffset, selectedDayIndex: safeDayIndex };
    },
    [defaultDayIndex],
  );

  // Day view selection
  const [selection, setSelection] = useState(`0:${defaultDayIndex}`);

  useEffect(() => {
    if (!dayOptions.length) return;
    const exists = dayOptions.some((option) => option.value === selection);
    if (exists) return;

    const todayValue = `0:${defaultDayIndex}`;
    const fallbackValue = dayOptions.some(
      (option) => option.value === todayValue,
    )
      ? todayValue
      : dayOptions[0].value;
    setSelection(fallbackValue);
  }, [dayOptions, defaultDayIndex, selection]);

  // Events for DayView filtered by selected week offset
  const dayEvents = useMemo(() => {
    try {
      const { selectedWeekOffset } = parseDaySelection(selection);
      const selectedWeekStart = getWeekStartByOffset(selectedWeekOffset);
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
    parseDaySelection,
    computeFiltered,
    studentGroups,
    hideLectures,
    showAll,
    selectedLectoratSubject,
    getWeekStartByOffset,
    filtered,
    schedule,
  ]);

  const selectedDayOptionIndex = useMemo(() => {
    const index = dayOptions.findIndex((option) => option.value === selection);
    return index >= 0 ? index : 0;
  }, [dayOptions, selection]);

  const selectedDayOption = dayOptions[selectedDayOptionIndex] || null;

  const currentDayLabel = selectedDayOption
    ? `${selectedDayOption.label} ${selectedDayOption.date}`
    : "";

  const canGoPrevDay = selectedDayOptionIndex > 0;
  const canGoNextDay = selectedDayOptionIndex < dayOptions.length - 1;

  const goToPrevDay = () => {
    if (!canGoPrevDay) return;
    setSelection(dayOptions[selectedDayOptionIndex - 1].value);
  };

  const goToNextDay = () => {
    if (!canGoNextDay) return;
    setSelection(dayOptions[selectedDayOptionIndex + 1].value);
  };

  const resetToCurrentDay = () => {
    setSelection(`0:${defaultDayIndex}`);
  };

  const { selectedWeekOffset, selectedDayIndex } = parseDaySelection(selection);
  const isCurrentDay =
    selectedWeekOffset === 0 && selectedDayIndex === defaultDayIndex;

  const floatingMenuProps = {
    panelState: {
      open,
      setOpen,
      isControlsPanelOpen,
    },
    viewState: {
      viewMode,
      setViewMode,
      hideLectures,
      setHideLectures,
      showAll,
      setShowAll,
    },
    groupState: {
      studentGroups,
      groupConfigs,
      handleGroupChange,
    },
    weekNavigation: {
      onPrevWeek: goToPrevWeek,
      onResetWeek: resetToCurrentWeek,
      onNextWeek: goToNextWeek,
      viewedWeekRange,
      viewedWeekStart,
      isCurrentWeek: weekOffset === 0,
      canGoPrevWeek,
      canGoNextWeek,
    },
    daySelection: {
      options: dayOptions,
      selection,
      onChange: setSelection,
    },
    dayNavigation: {
      onPrevDay: goToPrevDay,
      onResetDay: resetToCurrentDay,
      onNextDay: goToNextDay,
      currentDayLabel,
      isCurrentDay,
      canGoPrevDay,
      canGoNextDay,
    },
    filtering: {
      filtered,
      computeFiltered,
    },
    scheduleState: {
      schedule,
      currentSchedule,
      activeGroupSetId,
      activeGroupSetName,
      groupSetOptions,
      onGroupSetChange: handleGroupSetChange,
      onCreateGroupSet: handleCreateGroupSet,
      onRenameActiveGroupSet: handleRenameActiveGroupSet,
      onDeleteActiveGroupSet: handleDeleteActiveGroupSet,
      onScheduleChange: handleScheduleChange,
    },
    lektoratState: {
      lektoratOptions,
      selectedLectoratSubject,
      onLectoratChange: handleLectoratChange,
      shouldShowLectoratSelect,
    },
    exportState: {
      exportRef,
    },
    chatState: {
      scheduleName: currentSchedule,
      selectedGroups: studentGroups,
    },
  };

  const controlsPanelProps = {
    panelState: {
      isOpen: isControlsPanelOpen,
      onToggle: () => setIsControlsPanelOpen((prev) => !prev),
    },
    scheduleState: {
      currentSchedule,
      onScheduleChange: handleScheduleChange,
      isScheduleLoading,
    },
    groupSetState: {
      activeGroupSetId,
      activeGroupSetName,
      groupSetOptions,
      onGroupSetChange: handleGroupSetChange,
      onCreateGroupSet: handleCreateGroupSet,
      onRenameActiveGroupSet: handleRenameActiveGroupSet,
      onDeleteActiveGroupSet: handleDeleteActiveGroupSet,
    },
    viewState: {
      viewMode,
      onViewModeToggle: () =>
        setViewMode((prev) => (prev === "week" ? "day" : "week")),
      hideLectures,
      onToggleHideLectures: () => setHideLectures((prev) => !prev),
      showAll,
      onToggleShowAll: () => setShowAll((prev) => !prev),
    },
    filterState: {
      schedule,
      studentGroups,
      computeFiltered,
      groupConfigs,
      onGroupChange: handleGroupChange,
    },
    lektoratState: {
      shouldShowLectoratSelect,
      selectedLectoratSubject,
      onLectoratChange: handleLectoratChange,
      lektoratOptions,
    },
    exportState: {
      exportRef,
      viewedWeekRange,
      selection,
      combinedOptions: dayOptions,
    },
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* --- Kontrolki --- */}
      {/* hidden on mobile, visible on sm and up */}
      <ControlsPanel {...controlsPanelProps} />

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
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={goToPrevDay}
              disabled={!canGoPrevDay}
              className={`px-3 py-1 rounded text-sm ${
                canGoPrevDay
                  ? "bg-neutral-900 text-gray-300"
                  : "bg-neutral-900/50 text-gray-600 cursor-not-allowed"
              }`}
            >
              Prev
            </button>

            <button
              onClick={resetToCurrentDay}
              className={`px-3 ml-3 py-1 rounded text-sm ${
                isCurrentDay ? "bg-neutral-800" : "bg-neutral-900 text-gray-300"
              }`}
            >
              {currentDayLabel || "Dzień"}
            </button>

            <button
              onClick={goToNextDay}
              disabled={!canGoNextDay}
              className={`px-3 ml-3 py-1 rounded text-sm ${
                canGoNextDay
                  ? "bg-neutral-900 text-gray-300"
                  : "bg-neutral-900/50 text-gray-600 cursor-not-allowed"
              }`}
            >
              Next
            </button>
          </div>
        )}

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

      <FloatingMenu {...floatingMenuProps} />
      {/* --- Widok planu --- */}
      {viewMode === "week" ? (
        <WeekView
          events={filtered}
          subjects={subjects}
          viewedWeekStart={viewedWeekStart}
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
          options={dayOptions}
          selection={selection}
          onSelectionChange={setSelection}
          ref={exportRef}
        />
      )}
      <FAQ />
    </div>
  );
}
