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

function normalizeHm(value) {
  const raw = String(value || "").trim();
  const match = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return "";
  const hh = Number(match[1]);
  const mm = Number(match[2]);
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return "";
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function addMinutesToHm(startHm, durationMinutes) {
  const start = normalizeHm(startHm);
  if (!start) return "";
  const [hh, mm] = start.split(":").map(Number);
  const baseMinutes = hh * 60 + mm;
  const duration = Number.isFinite(durationMinutes)
    ? Number(durationMinutes)
    : Number(durationMinutes || 0);
  const effectiveDuration = duration > 0 ? duration : 90;
  const endMinutes = (baseMinutes + effectiveDuration) % (24 * 60);
  const endHour = Math.floor(endMinutes / 60);
  const endMin = endMinutes % 60;
  return `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`;
}

function parseGroups(value) {
  const raw = String(value || "").trim();
  if (!raw) return [];

  return raw
    .split(/\s*[/,;|]\s*/)
    .map((group) => group.trim())
    .filter(Boolean);
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

function expandExcludedDateRanges(docs) {
  const allDates = new Set();

  for (const doc of docs) {
    const data = doc.data() || {};

    // Handle date range (from/to)
    const fromValue = data?.from;
    const toValue = data?.to;

    if (fromValue && toValue) {
      const fromDate = fromValue?.toDate
        ? fromValue.toDate()
        : new Date(fromValue);
      const toDate = toValue?.toDate ? toValue.toDate() : new Date(toValue);

      if (
        !Number.isNaN(fromDate.getTime()) &&
        !Number.isNaN(toDate.getTime())
      ) {
        const current = new Date(fromDate);
        while (current <= toDate) {
          const dateKey = normalizeDateString(current);
          if (dateKey) allDates.add(dateKey);
          current.setDate(current.getDate() + 1);
        }
        continue;
      }
    }

    // Handle single date
    const singleDate = normalizeDateString(data?.date || data?.data || doc.id);
    if (singleDate) allDates.add(singleDate);
  }

  return Array.from(allDates);
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
  const groups = parseGroups(group);

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
          title: subjectName,
          subjectName,
          type: override.type || data?.type || "",
          teacher:
            override.teacher ||
            override.instructor ||
            data?.teacher ||
            data?.instructor ||
            "",
          room: override.room || data?.room || "",
          date: dateKey,
          day: dayIndexFromDate(dateKey) ?? 0,
          start,
          end,
          weeks: "both",
          faculty: data?.faculty || "",
          groups,
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
  const start =
    normalizeHm(data?.start || data?.startTime) || toTimeHm(startValue);
  const duration = data?.durationMin ?? data?.duration;
  const end =
    data?.end ||
    addMinutesToHm(start, duration) ||
    buildEndTime(startValue, duration);
  const groups = parseGroups(data?.group);
  const subjectName = String(data?.subject || data?.subj || "Przedmiot").trim();
  const subjectKey = makeSubjectKey(subjectName);

  return [
    {
      id: data?.id ?? docId,
      subj: subjectKey,
      title: subjectName,
      subjectName,
      type: data?.type || "",
      teacher: data?.teacher || data?.instructor || "",
      room: data?.room || "",
      date,
      day: dayIndexFromDate(date) ?? 0,
      start,
      end,
      weeks: "both",
      faculty: data?.faculty || "",
      groups,
    },
  ];
}

function buildTimetablesFromFacultyEventsCollection(
  collectionId,
  docs,
  selectedScheduleId,
  globalExcludedDates = [],
) {
  const docsByFaculty = new Map();

  for (const doc of docs) {
    const data = doc.data() || {};
    const faculty = String(data?.faculty || "").trim() || "unknown";
    if (!docsByFaculty.has(faculty)) docsByFaculty.set(faculty, []);
    docsByFaculty.get(faculty).push(doc);
  }

  let faculties = Array.from(docsByFaculty.keys()).sort((a, b) =>
    a.localeCompare(b),
  );

  if (selectedScheduleId) {
    faculties = faculties.filter((faculty) => faculty === selectedScheduleId);
  }

  return faculties.map((faculty) =>
    buildTimetableFromCollection(
      faculty,
      docsByFaculty.get(faculty) || [],
      faculty,
      globalExcludedDates,
    ),
  );
}

function extractFacultyScheduleEntries(docs = []) {
  const faculties = new Set();
  for (const doc of docs) {
    const data = doc.data() || {};
    const faculty = String(data?.faculty || "").trim();
    if (faculty) faculties.add(faculty);
  }

  return Array.from(faculties)
    .sort((a, b) => a.localeCompare(b))
    .map((faculty) => ({
      collectionId: faculty,
      name: faculty,
    }));
}

function areScheduleEntriesEqual(a = [], b = []) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i]?.collectionId !== b[i]?.collectionId) return false;
    if (a[i]?.name !== b[i]?.name) return false;
  }
  return true;
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
  const excludedSet = new Set(
    (globalExcludedDates || [])
      .map((value) => normalizeDateString(value))
      .filter(Boolean),
  );

  const schedule = docs
    .flatMap((doc) =>
      normalizeCollectionEvent(doc.id, doc.data(), globalExcludedDates),
    )
    .filter(
      (event) =>
        event.date &&
        event.start &&
        event.end &&
        !excludedSet.has(normalizeDateString(event.date)),
    )
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

function parseCollectionEntry(doc) {
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
  const [fetchedCache, setFetchedCache] = useState(new Map()); // Cache of all fetched schedules
  const fetchedCacheRef = useRef(new Map()); // Ref mirror for synchronous cache reads
  const rawDocsCacheRef = useRef(new Map()); // Cache raw Firestore docs for re-expansion (using Ref to avoid dependency issues)
  const [excludedDatesKey, setExcludedDatesKey] = useState(""); // Track when excluded dates change
  const [loading, setLoading] = useState(firebaseEnabled);
  const [error, setError] = useState(null);
  const globalExcludedDatesRef = useRef([]);
  const facultyMetadataEntriesRef = useRef([]);

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

  const facultyEventsCollectionName = useMemo(
    () => process.env.REACT_APP_FIREBASE_FACULTY_EVENTS_COLLECTION || "faculty",
    [],
  );

  const facultyMetadataCollectionName = useMemo(
    () =>
      process.env.REACT_APP_FIREBASE_FACULTY_METADATA_COLLECTION ||
      "faculty_metadata",
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
    let stopFacultyMetadataSubscription = null;

    const clearScheduleSubscriptions = () => {
      if (typeof stopScheduleSubscriptions === "function") {
        stopScheduleSubscriptions();
      }
      stopScheduleSubscriptions = null;
    };

    const clearFacultyMetadataSubscription = () => {
      if (typeof stopFacultyMetadataSubscription === "function") {
        stopFacultyMetadataSubscription();
      }
      stopFacultyMetadataSubscription = null;
    };

    const updateScheduleList = (entries) => {
      setScheduleList((prev) => {
        const nextEntries = Array.isArray(entries) ? entries : [];
        return areScheduleEntriesEqual(prev, nextEntries) ? prev : nextEntries;
      });
    };

    const subscribeFacultyMetadata = () => {
      if (!facultyMetadataCollectionName || stopFacultyMetadataSubscription) {
        return;
      }

      stopFacultyMetadataSubscription = onSnapshot(
        collection(db, facultyMetadataCollectionName),
        (snapshot) => {
          if (cancelled) return;

          const metadataEntries = snapshot.docs
            .map(parseCollectionEntry)
            .filter(Boolean);

          facultyMetadataEntriesRef.current = metadataEntries;

          if (metadataEntries.length > 0) {
            updateScheduleList(metadataEntries);
          }
        },
        () => {
          if (cancelled) return;
          facultyMetadataEntriesRef.current = [];
        },
      );
    };

    const subscribeToCollections = (entries, options = {}) => {
      clearScheduleSubscriptions();

      if (options.enableFacultySplit) {
        subscribeFacultyMetadata();
      } else {
        clearFacultyMetadataSubscription();
        facultyMetadataEntriesRef.current = [];
      }

      let validEntries = entries.filter((entry) => entry?.collectionId);

      // Keep selector list stable to avoid unnecessary rerenders
      if (!options.enableFacultySplit) {
        updateScheduleList(validEntries);
      }

      // If a specific schedule is selected, only fetch that one
      if (selectedScheduleId && !options.enableFacultySplit) {
        validEntries = validEntries.filter(
          (entry) => entry.collectionId === selectedScheduleId,
        );
      } else if (!options.enableFacultySplit && validEntries.length > 1) {
        // No explicit selection yet: subscribe only to the first schedule to avoid fetching everything
        validEntries = [validEntries[0]];
      }

      if (validEntries.length === 0) {
        setTimetables([]);
        setLoading(false);
        return;
      }

      let hasWarmCache = false;

      // Cache-first: render selected/default schedule immediately if already fetched
      if (!options.enableFacultySplit) {
        const activeId = selectedScheduleId || validEntries[0]?.collectionId;
        const cachedTimetable = activeId
          ? fetchedCacheRef.current.get(activeId)
          : null;
        if (cachedTimetable) {
          setTimetables([cachedTimetable]);
          hasWarmCache = true;
          setLoading(false);
        }
      }

      if (!hasWarmCache) setLoading(true);
      const stateByCollection = new Map();
      const unsubscribers = validEntries.map((entry) =>
        onSnapshot(
          collection(db, entry.collectionId),
          (snapshot) => {
            if (cancelled) return;

            if (options.enableFacultySplit && snapshot.docs.length === 0) {
              if (facultyMetadataEntriesRef.current.length === 0) {
                updateScheduleList([]);
              }
              setTimetables([]);
              setLoading(false);
              loadLegacyTimetables();
              return;
            }

            // Store raw docs for re-expansion when excluded dates change
            rawDocsCacheRef.current.set(entry.collectionId, {
              docs: snapshot.docs,
              name: entry.name,
            });

            const facultyEntries = options.enableFacultySplit
              ? extractFacultyScheduleEntries(snapshot.docs)
              : [];

            const builtTimetables =
              options.enableFacultySplit && facultyEntries.length > 0
                ? buildTimetablesFromFacultyEventsCollection(
                    entry.collectionId,
                    snapshot.docs,
                    selectedScheduleId,
                    globalExcludedDatesRef.current,
                  )
                : [
                    buildTimetableFromCollection(
                      entry.collectionId,
                      snapshot.docs,
                      entry.name,
                      globalExcludedDatesRef.current,
                    ),
                  ];

            stateByCollection.set(entry.collectionId, builtTimetables);

            // Update cache with fetched schedules
            setFetchedCache((prevCache) => {
              const newCache = new Map(prevCache);
              for (const timetable of builtTimetables) {
                newCache.set(timetable.id, timetable);
              }
              fetchedCacheRef.current = newCache;
              return newCache;
            });

            if (options.enableFacultySplit) {
              const preferredEntries =
                facultyMetadataEntriesRef.current.length > 0
                  ? facultyMetadataEntriesRef.current
                  : facultyEntries;

              updateScheduleList(preferredEntries);
            }

            const next = validEntries
              .flatMap((item) => stateByCollection.get(item.collectionId) || [])
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

    const subscribeFacultyEventsCollection = () => {
      clearScheduleSubscriptions();
      subscribeToCollections(
        [
          {
            collectionId: facultyEventsCollectionName,
            name: facultyEventsCollectionName,
          },
        ],
        { enableFacultySplit: true },
      );
    };

    // Subscribe to holidays/free days collection
    if (holidaysCollectionName) {
      stopHolidaysSubscription = onSnapshot(
        collection(db, holidaysCollectionName),
        (snapshot) => {
          if (cancelled) return;
          const dates = expandExcludedDateRanges(snapshot.docs);
          const normalizedDates = dates
            .map((value) => normalizeDateString(value))
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b));

          globalExcludedDatesRef.current = dates;
          setExcludedDatesKey(normalizedDates.join("|")); // Trigger re-expansion of cached schedules
        },
        () => {
          // Silently ignore errors from holidays collection
          if (!cancelled) {
            globalExcludedDatesRef.current = [];
            setExcludedDatesKey("");
          }
        },
      );
    }

    const startLegacyDiscovery = () => {
      if (scheduleIndexCollectionName) {
        stopIndexSubscription = onSnapshot(
          collection(db, scheduleIndexCollectionName),
          (snapshot) => {
            if (cancelled) return;

            const indexEntries = snapshot.docs
              .map(parseCollectionEntry)
              .filter(Boolean);

            if (indexEntries.length > 0) {
              subscribeToCollections(indexEntries);
              return;
            }

            if (configuredEntries.length > 0) {
              subscribeToCollections(configuredEntries);
              return;
            }

            subscribeFacultyEventsCollection();
          },
          () => {
            if (cancelled) return;

            if (configuredEntries.length > 0) {
              subscribeToCollections(configuredEntries);
              return;
            }

            subscribeFacultyEventsCollection();
          },
        );
        return;
      }

      if (configuredEntries.length > 0) {
        subscribeToCollections(configuredEntries);
        return;
      }

      subscribeFacultyEventsCollection();
    };

    const bootstrap = async () => {
      if (facultyMetadataCollectionName) {
        try {
          const metadataSnapshot = await getDocs(
            collection(db, facultyMetadataCollectionName),
          );
          if (cancelled) return;

          const metadataEntries = metadataSnapshot.docs
            .map(parseCollectionEntry)
            .filter(Boolean);

          if (metadataEntries.length > 0) {
            facultyMetadataEntriesRef.current = metadataEntries;
            updateScheduleList(metadataEntries);
            subscribeToCollections(metadataEntries);
            return;
          }
        } catch {
          if (cancelled) return;
        }
      }

      startLegacyDiscovery();
    };

    bootstrap();

    return () => {
      cancelled = true;
      if (typeof stopIndexSubscription === "function") stopIndexSubscription();
      if (typeof stopHolidaysSubscription === "function")
        stopHolidaysSubscription();
      clearFacultyMetadataSubscription();
      clearScheduleSubscriptions();
    };
  }, [
    configuredCollections,
    legacyCollectionName,
    scheduleIndexCollectionName,
    holidaysCollectionName,
    facultyEventsCollectionName,
    facultyMetadataCollectionName,
    selectedScheduleId,
  ]);

  // When excluded dates change (dni_wolne loads), re-expand all cached schedules
  useEffect(() => {
    if (!excludedDatesKey || rawDocsCacheRef.current.size === 0) return; // Nothing to rebuild yet
    if (!selectedScheduleId) return;

    const rawData = rawDocsCacheRef.current.get(selectedScheduleId);
    if (!rawData) return;

    const rebuiltTimetable = buildTimetableFromCollection(
      selectedScheduleId,
      rawData.docs,
      rawData.name,
      globalExcludedDatesRef.current, // Use current excluded dates
    );

    // Update cache with re-expanded schedule
    setFetchedCache((prev) => {
      const next = new Map(prev);
      next.set(selectedScheduleId, rebuiltTimetable);
      fetchedCacheRef.current = next;
      return next;
    });

    // Update displayed timetables with the re-expanded schedule
    setTimetables([rebuiltTimetable]);
  }, [excludedDatesKey, selectedScheduleId]);

  return { timetables, scheduleList, fetchedCache, loading, error };
}
