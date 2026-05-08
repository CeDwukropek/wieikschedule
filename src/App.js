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
import { useFirebaseAuth } from "./hooks/useFirebaseAuth";
import { useUserId } from "./hooks/useUserId";
import {
  getAddedEventsFromMyPlan,
  removeAddedEventFromMyPlan,
} from "./myPlanApi";

const ADDED_EVENTS_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function getLocalStorage() {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage || null;
  } catch {
    return null;
  }
}

function getAddedEventsCacheKey(scopeId, scheduleName, weekStartIso) {
  return `wieikschedule.${scopeId}.added-events.${scheduleName}.${weekStartIso}`;
}

function readAddedEventsCache(cacheKey) {
  const storage = getLocalStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(cacheKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const savedAt = Number(parsed?.savedAt || 0);
    if (!savedAt) return null;
    if (Date.now() - savedAt > ADDED_EVENTS_CACHE_TTL_MS) return null;
    return Array.isArray(parsed?.events) ? parsed.events : null;
  } catch {
    return null;
  }
}

function writeAddedEventsCache(cacheKey, events) {
  const storage = getLocalStorage();
  if (!storage) return;

  try {
    storage.setItem(
      cacheKey,
      JSON.stringify({ savedAt: Date.now(), events: events || [] }),
    );
  } catch {}
}

function removeAddedEventsCache(cacheKey) {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    storage.removeItem(cacheKey);
  } catch {}
}

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
  const { user: firebaseUser } = useFirebaseAuth();
  const guestUserId = useUserId();
  const addedEventsCacheScope = useMemo(
    () => firebaseUser?.uid || guestUserId || "guest",
    [firebaseUser?.uid, guestUserId],
  );

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

  // addedEventsByWeek: cache dopisanych eventów z "Mój plan".
  // Klucz: ISO data poniedziałku (YYYY-MM-DD) dla danego tygodnia.
  // Wartość: lista eventów w kształcie kompatybilnym z WeekView/DayView.

  const refreshMyPlanEvents = useCallback(() => {
    setMyPlanRefreshNonce((prev) => prev + 1);
  }, []);

  // Convert a chatbot slot (or added-event row) into the timetable view shape
  function mapSlotToViewShape(slot) {
    const date = String(slot?.date || "").slice(0, 10);
    const match = String(slot?.start_time || "").match(/^(\d{1,2}:\d{2})/);
    const start = match ? match[1] : "";
    if (!date || !start) return null;

    const duration = Number(slot?.duration_min);
    const safeDuration =
      Number.isFinite(duration) && duration > 0 ? duration : 90;

    const toDayIndex = (dateValue) => {
      const d = new Date(`${String(dateValue).slice(0, 10)}T12:00:00`);
      if (Number.isNaN(d.getTime())) return null;
      return (d.getDay() + 6) % 7;
    };

    const addMinutes = (timeValue, durationMin) => {
      const m = String(timeValue || "").match(/^(\d{1,2}):(\d{2})/);
      if (!m) return "";
      const hh = Number(m[1]);
      const mm = Number(m[2]);
      const base = hh * 60 + mm;
      const dur =
        Number.isFinite(Number(durationMin)) && Number(durationMin) > 0
          ? Number(durationMin)
          : 90;
      const total = (base + dur) % (24 * 60);
      const rh = String(Math.floor(total / 60)).padStart(2, "0");
      const rm = String(total % 60).padStart(2, "0");
      return `${rh}:${rm}`;
    };

    const day = toDayIndex(date);
    if (day == null || day < 0 || day > 4) return null;

    return {
      id: `added-${slot?.event_id || date + "-" + start}`,
      event_id: String(slot?.event_id || "").trim() || undefined,
      added_event_id: String(
        slot?.added_event_id ||
          `pending-${slot?.event_id || Math.random().toString(36).slice(2, 8)}-${Date.now()}`,
      ),
      origin: "added",
      reason: String(slot?.reason || "makeup").trim() || "makeup",
      subj:
        String(slot?.subject || slot?.title || "ADDED_EVENT").trim() ||
        "ADDED_EVENT",
      title:
        String(slot?.subject || slot?.title || "Dopisane zajecia").trim() ||
        "Dopisane zajecia",
      type: String(slot?.type || "Zajecia").trim() || "Zajecia",
      status: String(slot?.status || "aktywne").trim() || "aktywne",
      teacher: String(slot?.instructor || "").trim(),
      groups: slot?.group ? [String(slot.group).trim()] : [],
      appliesToAllGroups: false,
      day,
      start,
      end: addMinutes(start, safeDuration),
      room: String(slot?.room || "").trim(),
      dates: [String(date)],
      __optimistic: "adding",
    };
  }

  const handleRemoveAddedEvent = useCallback(
    async (addedEventId) => {
      const cleanId = String(addedEventId || "").trim();
      if (!cleanId) {
        throw new Error("Brak identyfikatora dopisanego wydarzenia.");
      }

      const scheduleName = String(currentSchedule || "").trim();
      if (!scheduleName) {
        throw new Error("Brak nazwy aktualnego planu.");
      }

      // Optimistycznie usuń z lokalnego cache, żeby UI zareagowało natychmiast.
      // W przypadku błędu robimy refresh z backendu, by przywrócić spójność.
      setAddedEventsByWeek((prev) => {
        const next = {};
        Object.keys(prev || {}).forEach((weekKey) => {
          const list = Array.isArray(prev[weekKey]) ? prev[weekKey] : [];
          const filtered = list.filter((ev) => ev.added_event_id !== cleanId);
          next[weekKey] = filtered;
          if (scheduleName && weekKey) {
            const cacheKey = getAddedEventsCacheKey(
              addedEventsCacheScope,
              scheduleName,
              weekKey,
            );
            writeAddedEventsCache(cacheKey, filtered);
          }
        });
        return next;
      });

      setRemovingAddedEventId(cleanId);
      try {
        await removeAddedEventFromMyPlan({
          addedEventId: cleanId,
          scheduleName,
        });
        refreshMyPlanEvents();
      } catch (err) {
        // On failure, trigger full refresh to restore state and surface error elsewhere
        refreshMyPlanEvents();
        throw err;
      } finally {
        setRemovingAddedEventId((current) =>
          current === cleanId ? null : current,
        );
      }
    },
    [currentSchedule, refreshMyPlanEvents, addedEventsCacheScope],
  );

  // Dodaje optimistic event do cache tygodnia, zanim backend potwierdzi zapis.
  // Uwaga: backend generuje realne `added_event_id`; tu tworzymy tymczasowy.
  const handleOptimisticAdd = useCallback(
    (slot) => {
      try {
        const viewEvent = mapSlotToViewShape(slot);
        if (!viewEvent) return null;

        // Wyznacz poniedziałek tygodnia, aby klucze cache pokrywały się z loaderem.
        const rawDate = String(slot?.date || "").slice(0, 10);
        const d = new Date(`${rawDate}T12:00:00`);
        if (Number.isNaN(d.getTime())) return null;
        const jsDay = d.getDay();
        const mondayIndex = (jsDay + 6) % 7; // 0..6 where 0=Mon
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - mondayIndex);
        const isoDate = toIsoDate(weekStart);

        const scheduleName = String(currentSchedule || "").trim();

        setAddedEventsByWeek((prev) => {
          const prevList = Array.isArray(prev[isoDate]) ? prev[isoDate] : [];
          const exists = prevList.some(
            (ev) => ev.added_event_id === viewEvent.added_event_id,
          );
          if (exists) return prev;

          const nextList = [viewEvent, ...prevList];
          if (scheduleName) {
            const cacheKey = getAddedEventsCacheKey(
              addedEventsCacheScope,
              scheduleName,
              isoDate,
            );
            writeAddedEventsCache(cacheKey, nextList);
          }

          return {
            ...prev,
            [isoDate]: nextList,
          };
        });

        return viewEvent;
      } catch (e) {
        return null;
      }
    },
    [currentSchedule, addedEventsCacheScope],
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

  const loadAddedEventsForWeek = useCallback(
    async (weekStartDate) => {
      if (
        !(weekStartDate instanceof Date) ||
        Number.isNaN(weekStartDate.getTime())
      ) {
        return;
      }

      const scheduleName = String(currentSchedule || "").trim();
      if (!scheduleName) {
        return;
      }

      const dateFrom = toIsoDate(weekStartDate);
      if (!dateFrom) return;

      const endDate = new Date(weekStartDate);
      endDate.setDate(endDate.getDate() + 6);
      const dateTo = toIsoDate(endDate);

      const cacheKey = getAddedEventsCacheKey(
        addedEventsCacheScope,
        scheduleName,
        dateFrom,
      );
      const cached = readAddedEventsCache(cacheKey);
      if (cached) {
        setAddedEventsByWeek((prev) => ({
          ...prev,
          [dateFrom]: cached,
        }));
      }

      // Wczytanie dopisanych eventów na dany tydzień z backendu (Supabase przez API).
      try {
        const response = await getAddedEventsFromMyPlan({
          scheduleName,
          dateFrom,
          dateTo,
        });
        const mapped = (response?.events || [])
          .map(mapAddedEventToViewShape)
          .filter(Boolean);

        setAddedEventsByWeek((prev) => ({
          ...prev,
          [dateFrom]: mapped,
        }));
        writeAddedEventsCache(cacheKey, mapped);
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
          removeAddedEventsCache(cacheKey);
        }
      }
    },
    [currentSchedule, addedEventsCacheScope],
  );

  useEffect(() => {
    if (!currentSchedule) return;
    setAddedEventsByWeek({});
    refreshMyPlanEvents();
  }, [currentSchedule, refreshMyPlanEvents]);

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
      onOptimisticAdd: handleOptimisticAdd,
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
