import { useEffect, useMemo, useState, useRef } from "react";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { db, firebaseEnabled } from "../firebase/client";

const SUBJECT_COLORS = [
  "bg-indigo-900",
  "bg-sky-500",
  "bg-purple-800",
  "bg-emerald-700",
  "bg-purple-600",
  "bg-pink-600",
  "bg-green-600",
  "bg-red-800",
  "bg-orange-600",
  "bg-cyan-600",
  "bg-amber-600",
  "bg-teal-600",
  "bg-fuchsia-700",
];

function normalizeDateString(value) {
  if (!value) return "";
  if (typeof value === "string") {
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  }

  if (value?.toDate && typeof value.toDate === "function") {
    const date = value.toDate();
    return normalizeDateString(date);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const y = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${y}-${mm}-${dd}`;
}

function dayIndexFromDate(dateStr) {
  const date = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return Math.min(Math.max((date.getDay() + 6) % 7, 0), 6);
}

function toTimeHm(value) {
  const date = value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function buildEndTime(isoStart, durationMinutes) {
  const startDate = isoStart?.toDate ? isoStart.toDate() : new Date(isoStart);
  if (Number.isNaN(startDate.getTime())) return "";
  const duration = Number.isFinite(durationMinutes)
    ? Number(durationMinutes)
    : Number(durationMinutes || 0);
  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + (duration > 0 ? duration : 90));
  return toTimeHm(endDate);
}

function hashString(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function makeSubjectKey(name) {
  const normalized = String(name || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return normalized || "subject";
}

function extractGroupPrefix(groupName) {
  const raw = String(groupName || "").trim();
  if (!raw) return "G";
  const prefix = raw.match(/^[^\d\s]+/)?.[0] || "G";
  return prefix;
}

function deriveGroupConfigs(events) {
  const prefixDefaults = new Map();
  const excludedPrefixes = new Set(["W", "w"]); // Filter out lecture groups

  for (const event of events) {
    for (const group of event.groups || []) {
      const prefix = extractGroupPrefix(group);
      if (excludedPrefixes.has(prefix)) continue;
      if (!prefixDefaults.has(prefix)) {
        prefixDefaults.set(prefix, group);
      }
    }
  }

  return Array.from(prefixDefaults.keys())
    .sort((a, b) => a.localeCompare(b))
    .map((prefix) => ({
      type: prefix,
      prefix,
      label: `Grupa ${prefix}`,
      defaultValue: prefixDefaults.get(prefix) || `${prefix}1`,
    }));
}

function parseJsonField(value) {
  if (!value) return null;
  try {
    return JSON.parse(String(value));
  } catch {
    return null;
  }
}

function expandRecurringEvent(docId, data, globalExcludedDates = []) {
  const startDateValue = data?.startDate;
  const endDateValue = data?.endDate;
  const startTime = String(data?.startTime || "08:00").trim();
  const durationMin = Number(data?.durationMin || data?.duration || 90);
  const intervalWeeks = Number(data?.intervalWeeks || 1);
  const excludedDates = parseJsonField(data?.excludedDates) || [];
  const overrides = parseJsonField(data?.overrides) || {};
  const group = String(data?.group || "").trim();
  const subjectName = String(data?.subject || data?.subj || "Przedmiot").trim();
  const subjectKey = makeSubjectKey(subjectName);

  if (!startDateValue || !endDateValue) return [];

  const firstDate = startDateValue?.toDate
    ? startDateValue.toDate()
    : new Date(startDateValue);
  const lastDate = endDateValue?.toDate
    ? endDateValue.toDate()
    : new Date(endDateValue);

  if (Number.isNaN(firstDate.getTime()) || Number.isNaN(lastDate.getTime())) {
    return [];
  }

  const excludedSet = new Set(
    [...excludedDates, ...globalExcludedDates]
      .map((d) => normalizeDateString(d))
      .filter(Boolean),
  );

  const occurrences = [];
  const current = new Date(firstDate);
  let index = 0;

  while (current <= lastDate) {
    const dateKey = normalizeDateString(current);
    if (!excludedSet.has(dateKey)) {
      const override = overrides[dateKey] || {};
      const shouldAdd = override._add !== false;

      if (shouldAdd) {
        const [startHour, startMin] = (override.startTime || startTime)
          .split(":")
          .map(Number);
        const effectiveDuration = override.durationMin || durationMin;

        const endHour = Math.floor(
          (startHour * 60 + startMin + effectiveDuration) / 60,
        );
        const endMin = (startHour * 60 + startMin + effectiveDuration) % 60;

        const start = `${String(startHour).padStart(2, "0")}:${String(startMin).padStart(2, "0")}`;
        const end = `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`;

        occurrences.push({
          id: `${docId}-${index}`,
          subj: subjectKey,
          subjectName,
          type: override.type || data?.type || "",
          teacher: override.teacher || data?.teacher || "",
          room: override.room || data?.room || "",
          date: dateKey,
          day: dayIndexFromDate(dateKey) ?? 0,
          start,
          end,
          weeks: "both",
          faculty: data?.faculty || "",
          groups: group ? [group] : [],
        });
      }
    }

    current.setDate(current.getDate() + intervalWeeks * 7);
    index++;
  }

  return occurrences;
}

function normalizeCollectionEvent(docId, data, globalExcludedDates = []) {
  // New schema: recurring events with startDate/endDate
  if (data?.startDate && data?.endDate) {
    return expandRecurringEvent(docId, data, globalExcludedDates);
  }

  // Legacy schema: single event with isoStart
  const startValue = data?.isoStart || data?.startDate || data?.date;
  const date = normalizeDateString(startValue);
  const start = data?.start || toTimeHm(startValue);
  const end = data?.end || buildEndTime(startValue, data?.duration);
  const group = String(data?.group || "").trim();
  const subjectName = String(data?.subject || data?.subj || "Przedmiot").trim();
  const subjectKey = makeSubjectKey(subjectName);

  return [
    {
      id: data?.id ?? docId,
      subj: subjectKey,
      subjectName,
      type: data?.type || "",
      teacher: data?.teacher || "",
      room: data?.room || "",
      date,
      day: dayIndexFromDate(date) ?? 0,
      start,
      end,
      weeks: "both",
      faculty: data?.faculty || "",
      groups: group ? [group] : [],
    },
  ];
}

function buildSubjectsFromEvents(events) {
  const subjects = {};

  for (const event of events) {
    const subjectKey = event.subj;
    const existing = subjects[subjectKey];
    const color =
      SUBJECT_COLORS[hashString(subjectKey) % SUBJECT_COLORS.length] ||
      "bg-gray-600";

    if (!existing) {
      subjects[subjectKey] = {
        name: event.subjectName || subjectKey,
        teacher: event.teacher || "",
        color,
      };
    } else if (!existing.teacher && event.teacher) {
      existing.teacher = event.teacher;
    }
  }

  return subjects;
}

function buildTimetableFromCollection(
  collectionId,
  docs,
  displayName,
  globalExcludedDates = [],
) {
  const schedule = docs
    .flatMap((doc) =>
      normalizeCollectionEvent(doc.id, doc.data(), globalExcludedDates),
    )
    .filter((event) => event.date && event.start && event.end)
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return String(a.start).localeCompare(String(b.start));
    });

  const facultyName = schedule.find((event) => event.faculty)?.faculty || "";

  const subjects = buildSubjectsFromEvents(schedule);
  const groups = deriveGroupConfigs(schedule);

  return {
    id: collectionId,
    name: displayName || facultyName || collectionId,
    subjects,
    groups,
    schedule,
  };
}

function parseScheduleIndexEntry(doc) {
  const data = doc.data() || {};
  const collectionId = String(
    data.collectionId || data.scheduleId || data.id || doc.id || "",
  ).trim();

  if (!collectionId) return null;

  const name = String(data.name || data.label || data.faculty || collectionId)
    .trim()
    .replace(/\s+/g, " ");

  return {
    collectionId,
    name: name || collectionId,
  };
}

function normalizeLegacyTimetable(docId, data) {
  const scheduleSource = data?.events || data?.schedule || [];

  const schedule = scheduleSource
    .map((event, index) => {
      const date = normalizeDateString(event?.date || event?.startDate);
      const hasDate = Boolean(date);
      const fallbackDay =
        typeof event?.day === "number" ? event.day : dayIndexFromDate(date);

      return {
        ...event,
        id: event?.id ?? `${docId}-${index}`,
        date,
        day: fallbackDay ?? 0,
        weeks: hasDate ? "both" : event?.weeks || "both",
        groups: Array.isArray(event?.groups) ? event.groups : [],
      };
    })
    .sort((a, b) => {
      if (a.date && b.date && a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      if (a.day !== b.day) return a.day - b.day;
      return String(a.start || "").localeCompare(String(b.start || ""));
    });

  return {
    id: data?.id || docId,
    name: data?.name || data?.title || docId,
    subjects: data?.subjects || {},
    groups: Array.isArray(data?.groups) ? data.groups : [],
    schedule,
  };
}

export function useFirebaseTimetables(selectedScheduleId = null) {
  const [scheduleList, setScheduleList] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(firebaseEnabled);
  const [error, setError] = useState(null);
  const globalExcludedDatesRef = useRef([]);

  const configuredCollections = useMemo(
    () =>
      String(process.env.REACT_APP_FIREBASE_SCHEDULE_COLLECTIONS || "")
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean),
    [],
  );

  const scheduleIndexCollectionName = useMemo(
    () =>
      process.env.REACT_APP_FIREBASE_SCHEDULE_INDEX_COLLECTION || "schedules",
    [],
  );

  const legacyCollectionName = useMemo(
    () => process.env.REACT_APP_FIREBASE_TIMETABLES_COLLECTION || "timetables",
    [],
  );

  const holidaysCollectionName = useMemo(
    () => process.env.REACT_APP_FIREBASE_HOLIDAYS_COLLECTION || "dni_wolne",
    [],
  );

  useEffect(() => {
    if (!firebaseEnabled || !db) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    let stopIndexSubscription = null;
    let stopScheduleSubscriptions = null;
    let stopHolidaysSubscription = null;

    const clearScheduleSubscriptions = () => {
      if (typeof stopScheduleSubscriptions === "function") {
        stopScheduleSubscriptions();
      }
      stopScheduleSubscriptions = null;
    };

    const subscribeToCollections = (entries) => {
      clearScheduleSubscriptions();

      let validEntries = entries.filter((entry) => entry?.collectionId);
      
      // Store the full list for schedule selection
      setScheduleList(validEntries);
      
      // If a specific schedule is selected, only fetch that one
      if (selectedScheduleId) {
        validEntries = validEntries.filter(
          (entry) => entry.collectionId === selectedScheduleId,
        );
      }
      
      if (validEntries.length === 0) {
        setTimetables([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const stateByCollection = new Map();
      const unsubscribers = validEntries.map((entry) =>
        onSnapshot(
          collection(db, entry.collectionId),
          (snapshot) => {
            if (cancelled) return;

            stateByCollection.set(
              entry.collectionId,
              buildTimetableFromCollection(
                entry.collectionId,
                snapshot.docs,
                entry.name,
                globalExcludedDatesRef.current,
              ),
            );

            const next = validEntries
              .map((item) => stateByCollection.get(item.collectionId))
              .filter(Boolean);

            setTimetables(next);
            setError(null);
            setLoading(false);
          },
          (snapshotError) => {
            if (cancelled) return;
            setError(snapshotError);
            setLoading(false);
          },
        ),
      );

      stopScheduleSubscriptions = () => {
        unsubscribers.forEach((unsub) => unsub());
      };
    };

    const loadLegacyTimetables = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, legacyCollectionName));
        if (cancelled) return;

        const remote = snapshot.docs.map((doc) =>
          normalizeLegacyTimetable(doc.id, doc.data()),
        );

        setTimetables(remote.filter((item) => item.schedule?.length));
        setError(null);
      } catch (legacyError) {
        if (cancelled) return;
        setError(legacyError);
        setTimetables([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const configuredEntries = configuredCollections.map((collectionId) => ({
      collectionId,
      name: collectionId,
    }));

    // Subscribe to holidays/free days collection
    if (holidaysCollectionName) {
      stopHolidaysSubscription = onSnapshot(
        collection(db, holidaysCollectionName),
        (snapshot) => {
          if (cancelled) return;
          const dates = snapshot.docs
            .map((doc) => {
              const data = doc.data();
              return normalizeDateString(data?.date || data?.data || doc.id);
            })
            .filter(Boolean);
          globalExcludedDatesRef.current = dates;
        },
        () => {
          // Silently ignore errors from holidays collection
          if (!cancelled) globalExcludedDatesRef.current = [];
        },
      );
    }

    if (scheduleIndexCollectionName) {
      stopIndexSubscription = onSnapshot(
        collection(db, scheduleIndexCollectionName),
        (snapshot) => {
          if (cancelled) return;

          const indexEntries = snapshot.docs
            .map(parseScheduleIndexEntry)
            .filter(Boolean);

          if (indexEntries.length > 0) {
            subscribeToCollections(indexEntries);
            return;
          }

          if (configuredEntries.length > 0) {
            subscribeToCollections(configuredEntries);
            return;
          }

          clearScheduleSubscriptions();
          loadLegacyTimetables();
        },
        () => {
          if (cancelled) return;

          if (configuredEntries.length > 0) {
            subscribeToCollections(configuredEntries);
            return;
          }

          clearScheduleSubscriptions();
          loadLegacyTimetables();
        },
      );
    } else if (configuredEntries.length > 0) {
      subscribeToCollections(configuredEntries);
    } else {
      loadLegacyTimetables();
    }

    return () => {
      cancelled = true;
      if (typeof stopIndexSubscription === "function") stopIndexSubscription();
      if (typeof stopHolidaysSubscription === "function")
        stopHolidaysSubscription();
      clearScheduleSubscriptions();
    };
  }, [
    configuredCollections,
    legacyCollectionName,
    scheduleIndexCollectionName,
    holidaysCollectionName,
    selectedScheduleId,
  ]);

  return { timetables, scheduleList, loading, error };
}
