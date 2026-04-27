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
import {
  getAddedEventsFromMyPlan,
  removeAddedEventFromMyPlan,
} from "./myPlanApi";

function toIsoDate(dateValue) {
  if (!(dateValue instanceof Date) || Number.isNaN(dateValue.getTime())) {
    return "";
  }

  const y = String(dateValue.getFullYear());
  const m = String(dateValue.getMonth() + 1).padStart(2, "0");
  const d = String(dateValue.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function toDayIndex(dateValue) {
  const date = new Date(`${String(dateValue || "").slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return (date.getDay() + 6) % 7;
}

function normalizeHm(value) {
  const raw = String(value || "").trim();
  const match = raw.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return "";
  return `${String(Number(match[1])).padStart(2, "0")}:${match[2]}`;
}

function addMinutes(startHm, durationMin) {
  const match = String(startHm || "").match(/^(\d{2}):(\d{2})$/);
  if (!match) return "";
  const base = Number(match[1]) * 60 + Number(match[2]);
  const duration = Number(durationMin);
  const safeDuration =
    Number.isFinite(duration) && duration > 0 ? duration : 90;
  const end = (base + safeDuration) % (24 * 60);
  return `${String(Math.floor(end / 60)).padStart(2, "0")}:${String(
    end % 60,
  ).padStart(2, "0")}`;
}

function mapAddedEventToViewShape(event) {
  const day = toDayIndex(event?.date);
  const start = normalizeHm(event?.start_time);

  if (day == null || day < 0 || day > 4 || !start) {
    return null;
  }

  const duration = Number(event?.duration_min);
  const safeDuration =
    Number.isFinite(duration) && duration > 0 ? duration : 90;

  return {
    id: `added-${
      event?.added_event_id ||
      event?.event_id ||
      [event?.date, start, event?.subject].filter(Boolean).join("-")
    }`,
    event_id: String(event?.event_id || "").trim() || undefined,
    added_event_id: String(event?.added_event_id || "").trim() || undefined,
    origin: "added",
    reason: String(event?.reason || "makeup").trim() || "makeup",
    subj: String(event?.subject || "").trim() || "ADDED_EVENT",
    title: String(event?.subject || "").trim() || "Dopisane zajecia",
    type: String(event?.type || "").trim() || "Zajecia",
    status: String(event?.status || "").trim() || "aktywne",
    teacher: String(event?.instructor || "").trim(),
    groups: event?.group ? [String(event.group).trim()] : [],
    appliesToAllGroups: false,
    day,
    start,
    end: addMinutes(start, safeDuration),
    room: String(event?.room || "").trim(),
    dates: [String(event?.date || "").trim()],
  };
}

export default function Timetable() {
  const exportRef = useRef(null);
  const appliedSettingsSignatureRef = useRef("");
  const [open, setOpen] = useState(false);
  const isAiChatEnabled = process.env.REACT_APP_ENABLE_AI_CHAT === "true";

  // Load saved settings from localStorage
  const { savedSettings } = useSettings();
  const [settingsReady, setSettingsReady] = useState(false);

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
    timetableOptions,
    timetableOptionsMessage,
    timetableDataSourceLabel,
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
    isScheduleLoading,
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

  const [addedEventsByWeek, setAddedEventsByWeek] = useState({});
  const [myPlanRefreshNonce, setMyPlanRefreshNonce] = useState(0);
  const [removingAddedEventId, setRemovingAddedEventId] = useState(null);

  const refreshMyPlanEvents = useCallback(() => {
    setMyPlanRefreshNonce((prev) => prev + 1);
  }, []);

  const handleRemoveAddedEvent = useCallback(
    async (addedEventId) => {
      const cleanId = String(addedEventId || "").trim();
      if (!cleanId) {
        throw new Error("Brak identyfikatora dopisanego wydarzenia.");
      }

      setRemovingAddedEventId(cleanId);
      try {
        await removeAddedEventFromMyPlan(cleanId);
        refreshMyPlanEvents();
      } finally {
        setRemovingAddedEventId((current) =>
          current === cleanId ? null : current,
        );
      }
    },
    [refreshMyPlanEvents],
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
      const baseEventIds = new Set();

      baseEvents.forEach((ev) => {
        const baseEvent = {
          ...ev,
          origin: "base",
        };

        const eventId = String(ev?.event_id || "").trim();
        if (eventId) {
          baseEventIds.add(eventId);
        }

        const key = ["base", ev.id, ev.day, ev.start, ev.end, ev.room].join(
          "::",
        );
        merged.set(key, baseEvent);
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
            origin: "base",
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

      const weekKey = toIsoDate(weekStartDate);
      const addedEvents = weekKey ? addedEventsByWeek[weekKey] || [] : [];

      addedEvents.forEach((event) => {
        const eventId = String(event?.event_id || "").trim();
        if (eventId && baseEventIds.has(eventId)) return;

        const dedupeKey = [
          "added",
          event?.added_event_id || "",
          event?.event_id || "",
          event?.day,
          event?.start,
          event?.end,
          event?.room,
        ].join("::");

        merged.set(dedupeKey, event);
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
      addedEventsByWeek,
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

  const selectedDayWeekStart = useMemo(() => {
    const { selectedWeekOffset } = parseDaySelection(selection);
    return getWeekStartByOffset(selectedWeekOffset);
  }, [parseDaySelection, selection, getWeekStartByOffset]);

  const loadAddedEventsForWeek = useCallback(async (weekStartDate) => {
    if (
      !(weekStartDate instanceof Date) ||
      Number.isNaN(weekStartDate.getTime())
    ) {
      return;
    }

    const dateFrom = toIsoDate(weekStartDate);
    if (!dateFrom) return;

    const endDate = new Date(weekStartDate);
    endDate.setDate(endDate.getDate() + 6);
    const dateTo = toIsoDate(endDate);

    try {
      const response = await getAddedEventsFromMyPlan({ dateFrom, dateTo });
      const mapped = (response?.events || [])
        .map(mapAddedEventToViewShape)
        .filter(Boolean);

      setAddedEventsByWeek((prev) => ({
        ...prev,
        [dateFrom]: mapped,
      }));
    } catch (err) {
      const message = String(err?.message || "").toLowerCase();
      const isAuthMissing =
        message.includes("zalogowany") ||
        message.includes("autoryz") ||
        message.includes("unauthorized");

      if (isAuthMissing) {
        setAddedEventsByWeek((prev) => ({
          ...prev,
          [dateFrom]: [],
        }));
      }
    }
  }, []);

  useEffect(() => {
    const weeksToLoad = [viewedWeekStart, selectedDayWeekStart];
    const uniqueWeekStarts = Array.from(
      new Set(weeksToLoad.map((date) => toIsoDate(date)).filter(Boolean)),
    );

    uniqueWeekStarts.forEach((isoDate) => {
      loadAddedEventsForWeek(new Date(`${isoDate}T12:00:00`));
    });
  }, [
    viewedWeekStart,
    selectedDayWeekStart,
    loadAddedEventsForWeek,
    myPlanRefreshNonce,
  ]);

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
      timetableOptions,
      timetableOptionsMessage,
      timetableDataSourceLabel,
      currentSchedule,
      isScheduleLoading,
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
      onMyPlanChanged: refreshMyPlanEvents,
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
          onRemoveAddedEvent={handleRemoveAddedEvent}
          removingAddedEventId={removingAddedEventId}
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
          onRemoveAddedEvent={handleRemoveAddedEvent}
          removingAddedEventId={removingAddedEventId}
          ref={exportRef}
        />
      )}
      <FAQ />
    </div>
  );
}
