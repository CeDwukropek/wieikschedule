import React, {
  useState,
  useRef,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import WeekView from "./View/WeekView";
import DayView from "./View/DayView";
import FloatingMenu from "./Menu/FloatingMenu";
import FAQ from "./FAQ";
import { usePersistSettings, useSettings } from "./hooks/useSettings";
import { useScheduleManager } from "./hooks/useScheduleManager";
import { useEventFiltering } from "./hooks/useEventFiltering";
import { useDateHelpers } from "./hooks/useDateHelpers";
import { formatDate } from "./utils/dateUtils";

export default function Timetable() {
  const exportRef = useRef(null);
  const appliedSettingsSignatureRef = useRef("");
  const [open, setOpen] = useState(false);
  const [settingsConflict, setSettingsConflict] = useState(null);
  const isAiChatEnabled = process.env.REACT_APP_ENABLE_AI_CHAT === "true";

  const resolveCloudConflict = useCallback(() => {
    return new Promise((resolve) => {
      setSettingsConflict({ resolve });
    });
  }, []);

  // Load saved settings from localStorage
  const { savedSettings } = useSettings({
    resolveCloudConflict,
  });
  const [settingsReady, setSettingsReady] = useState(false);

  const chooseCloudSettings = useCallback(() => {
    if (!settingsConflict?.resolve) return;
    settingsConflict.resolve("cloud");
    setSettingsConflict(null);
  }, [settingsConflict]);

  const chooseLocalSettings = useCallback(() => {
    if (!settingsConflict?.resolve) return;
    settingsConflict.resolve("local");
    setSettingsConflict(null);
  }, [settingsConflict]);

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
    loadedTimetables,
    activeExternalSelections,
    currentTimetable,
    handleGroupChange,
    handleGroupSetChange,
    handleCreateGroupSet,
    handleRenameActiveGroupSet,
    handleDeleteActiveGroupSet,
    handleAddExternalSelection,
    handleUpdateExternalSelection,
    handleRemoveExternalSelection,
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

  useEffect(() => {
    if (!savedSettings || typeof savedSettings !== "object") {
      setSettingsReady(true);
      return;
    }

    const signature = JSON.stringify({
      viewMode: savedSettings.viewMode,
      hideLectures: savedSettings.hideLectures,
      showAll: savedSettings.showAll,
      weekOffset: savedSettings.weekOffset,
      selectedLectoratBySchedule: savedSettings.selectedLectoratBySchedule,
    });

    if (signature && signature !== appliedSettingsSignatureRef.current) {
      appliedSettingsSignatureRef.current = signature;

      if (typeof savedSettings.viewMode === "string") {
        setViewMode(savedSettings.viewMode);
      }

      if (typeof savedSettings.hideLectures === "boolean") {
        setHideLectures(savedSettings.hideLectures);
      }

      if (typeof savedSettings.showAll === "boolean") {
        setShowAll(savedSettings.showAll);
      }

      if (Number.isFinite(Number(savedSettings.weekOffset))) {
        setWeekOffset(Number(savedSettings.weekOffset));
      }

      if (
        savedSettings.selectedLectoratBySchedule &&
        typeof savedSettings.selectedLectoratBySchedule === "object"
      ) {
        setSelectedLectoratBySchedule(savedSettings.selectedLectoratBySchedule);
      }
    }

    setSettingsReady(true);
  }, [savedSettings]);

  const viewedWeekRange = useMemo(
    () => getRangeByOffset(weekOffset),
    [getRangeByOffset, weekOffset],
  );

  const viewedWeekStart = useMemo(
    () => getWeekStartByOffset(weekOffset),
    [getWeekStartByOffset, weekOffset],
  );

  const weekOptions = useMemo(() => {
    if (
      !Number.isFinite(minAllowedOffset) ||
      !Number.isFinite(maxAllowedOffset)
    ) {
      return [-1, 0, 1].map((offset) => ({
        value: offset,
        label: getRangeByOffset(offset),
      }));
    }

    const result = [];
    for (
      let offset = minAllowedOffset;
      offset <= maxAllowedOffset;
      offset += 1
    ) {
      result.push({
        value: offset,
        label: getRangeByOffset(offset),
      });
    }
    return result;
  }, [getRangeByOffset, maxAllowedOffset, minAllowedOffset]);

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

  const buildMergedEvents = useCallback(
    (weekStartDate) => {
      const baseEvents = computeFiltered(
        schedule,
        studentGroups,
        hideLectures,
        showAll,
        weekStartDate,
        selectedLectoratSubject,
      );

      const merged = new Map();
      baseEvents.forEach((ev) => {
        const key = ["base", ev.id, ev.day, ev.start, ev.end, ev.room].join(
          "::",
        );
        merged.set(key, ev);
      });

      (activeExternalSelections || []).forEach((item) => {
        const scheduleId = String(item?.scheduleId || "").trim();
        const groupType = String(item?.groupType || "").trim();
        const groupValue = String(item?.groupValue || "").trim();
        const subjectKey = String(item?.subjectKey || "").trim();

        if (!scheduleId || !groupType || !groupValue) return;

        const externalTimetable = loadedTimetables[scheduleId];
        if (!externalTimetable?.schedule?.length) return;

        const externalGroups = {
          [groupType]: groupValue,
        };

        const externalEvents = computeFiltered(
          externalTimetable.schedule,
          externalGroups,
          hideLectures,
          false,
          weekStartDate,
          "",
        ).filter((event) => {
          if (!subjectKey) return true;
          return String(event?.subj || "").trim() === subjectKey;
        });

        externalEvents.forEach((ev) => {
          const taggedEvent = {
            ...ev,
            _sourceScheduleId: scheduleId,
            _isExternal: true,
          };

          const key = [
            "external",
            scheduleId,
            groupType,
            groupValue,
            subjectKey || "*",
            ev.id,
            ev.day,
            ev.start,
            ev.end,
            ev.room,
          ].join("::");

          merged.set(key, taggedEvent);
        });
      });

      return Array.from(merged.values()).sort((a, b) => {
        if (a.day !== b.day) return a.day - b.day;
        if (a.start !== b.start) return a.start.localeCompare(b.start);
        return String(a.id).localeCompare(String(b.id));
      });
    },
    [
      computeFiltered,
      schedule,
      studentGroups,
      hideLectures,
      showAll,
      selectedLectoratSubject,
      activeExternalSelections,
      loadedTimetables,
    ],
  );

  const mergedWeekEvents = useMemo(
    () => buildMergedEvents(viewedWeekStart),
    [buildMergedEvents, viewedWeekStart],
  );

  // Persist all settings
  usePersistSettings(
    {
      viewMode,
      weekOffset,
      hideLectures,
      showAll,
      currentSchedule,
      scheduleGroupSets,
      activeGroupSetBySchedule,
      selectedLectoratBySchedule,
      scheduleGroups,
    },
    settingsReady,
  );

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
      return buildMergedEvents(selectedWeekStart);
    } catch (e) {
      return mergedWeekEvents;
    }
  }, [
    selection,
    parseDaySelection,
    getWeekStartByOffset,
    buildMergedEvents,
    mergedWeekEvents,
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

  const conflictPrompt = settingsConflict ? (
    <div className="fixed inset-0 z-[250] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-neutral-700 bg-neutral-900 p-5 shadow-2xl">
        <h3 className="text-base font-semibold text-white">
          Wykryto zapisane ustawienia
        </h3>
        <p className="mt-2 text-sm text-neutral-300">
          W Firebase masz zapisane ustawienia grup i filtrów. Co chcesz zrobić?
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={chooseCloudSettings}
            className="w-full rounded-lg bg-lime-600 px-3 py-2 text-sm font-medium text-white hover:bg-lime-500"
          >
            Zaciągnij ustawienia z Firebase
          </button>
          <button
            type="button"
            onClick={chooseLocalSettings}
            className="w-full rounded-lg bg-neutral-800 px-3 py-2 text-sm font-medium text-neutral-100 hover:bg-neutral-700"
          >
            Zostaw lokalne i nadpisz Firebase
          </button>
        </div>
      </div>
    </div>
  ) : null;

  const floatingMenuProps = {
    panelState: {
      open,
      setOpen,
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
    weekSelection: {
      options: weekOptions,
      selection: weekOffset,
      onChange: setWeekOffset,
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
      externalSelections: activeExternalSelections,
      loadedTimetables,
      onAddExternalSelection: handleAddExternalSelection,
      onUpdateExternalSelection: handleUpdateExternalSelection,
      onRemoveExternalSelection: handleRemoveExternalSelection,
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
      enabled: isAiChatEnabled,
      scheduleName: currentSchedule,
      selectedGroups: studentGroups,
    },
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Floating menu / settings for all breakpoints */}

      <FloatingMenu {...floatingMenuProps} />
      {/* --- Widok planu --- */}
      {viewMode === "week" ? (
        <WeekView
          events={mergedWeekEvents}
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
      {conflictPrompt}
    </div>
  );
}
