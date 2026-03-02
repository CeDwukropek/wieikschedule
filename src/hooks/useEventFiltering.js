import { useState, useEffect, useCallback, useMemo } from "react";
import { useUserId } from "./useUserId";
import { timeToMinutes } from "../utils";
import { isLecture } from "../utils/dateUtils";

const CACHE_TTL = 1000 * 60 * 60 * 24 * 60; // 60 days in ms

function weekStartKeyFromDate(dateString) {
  if (!dateString) return "";
  const date = new Date(`${dateString}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "";

  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);

  const y = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${y}-${mm}-${dd}`;
}

export function useEventFiltering(
  schedule,
  studentGroups,
  hideLectures,
  showAll,
  viewedWeekStart,
  selectedLectoratSubject,
) {
  const userId = useUserId();

  const CACHE_KEY = useMemo(
    () => `wieikschedule.${userId}.cachedFiltered`,
    [userId],
  );

  const computeFiltered = useCallback(function computeFiltered(
    schedule,
    groups,
    hideLectures,
    showAll,
    weekStartDate,
    preferredLectorat,
  ) {
    // 1) Zestaw wybranych grup (O(1) membership)
    const groupSet = new Set(Object.values(groups || {}).filter(Boolean));

    // 2) Cache na zamianę "HH:MM" → minuty (unikamy powtórzeń)
    const minutesCache = new Map();
    const getMin = (hhmm) => {
      let v = minutesCache.get(hhmm);
      if (v == null) {
        v = timeToMinutes(hhmm);
        minutesCache.set(hhmm, v);
      }
      return v;
    };

    const normalizeIso = (dateValue) => {
      const date =
        dateValue instanceof Date ? new Date(dateValue) : new Date(dateValue);
      if (Number.isNaN(date.getTime())) return "";
      const y = String(date.getFullYear());
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    };

    const hasExactWeekContext =
      weekStartDate instanceof Date && !Number.isNaN(weekStartDate.getTime());

    const normalizeText = (value) =>
      String(value || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    const selectedLekGroup = String(groups?.Lek || "").trim();
    const selectedLectoratRaw = String(preferredLectorat || "").trim();
    const selectedLectoratNormalized = normalizeText(selectedLectoratRaw);

    const isLectoratEvent = (ev) => {
      const eventType = normalizeText(ev?.type);
      if (eventType.includes("lekt")) return true;
      if (!Array.isArray(ev?.groups)) return false;
      return ev.groups.some((group) => normalizeText(group).startsWith("lek"));
    };

    const matchesSelectedLectorat = (ev) => {
      const eventSubj = String(ev?.subj || "").trim();
      if (
        selectedLectoratRaw &&
        eventSubj &&
        eventSubj === selectedLectoratRaw
      ) {
        return true;
      }

      const eventTitleNormalized = normalizeText(
        ev?.title || ev?.subjectName || "",
      );
      return Boolean(
        selectedLectoratNormalized &&
        eventTitleNormalized &&
        eventTitleNormalized === selectedLectoratNormalized,
      );
    };

    // 3) Jedno przejście: filtrujemy i zbieramy w tablicę
    const out = [];
    for (const ev of schedule) {
      if (
        hasExactWeekContext &&
        Array.isArray(ev.dates) &&
        ev.dates.length > 0
      ) {
        const eventDay = Number(ev.day);
        const dayOffset = Number.isFinite(eventDay) ? eventDay : 0;
        const targetDate = new Date(weekStartDate);
        targetDate.setDate(targetDate.getDate() + dayOffset);
        const targetIso = normalizeIso(targetDate);
        if (!targetIso || !ev.dates.includes(targetIso)) continue;
      }

      // ukryj wykłady, jeśli proszono
      if (hideLectures && isLecture(ev)) continue;

      // wykłady zawsze przepuszczamy (jeśli nie są ukryte)
      if (!isLecture(ev)) {
        const shouldFilterLectoratBySubjectOnly =
          !showAll &&
          !selectedLekGroup &&
          selectedLectoratNormalized &&
          isLectoratEvent(ev);

        // jeśli nie "pokaż wszystko", filtruj po grupach
        if (!showAll) {
          const isDayOff =
            String(ev?.status || "")
              .trim()
              .toLowerCase() === "wolne";
          if (ev.appliesToAllGroups || isDayOff) {
            out.push(ev);
            continue;
          }
          if (!shouldFilterLectoratBySubjectOnly) {
            const matchesGroup =
              Array.isArray(ev.groups) &&
              ev.groups.some((eventGroup) => {
                const normalizedEventGroup = String(eventGroup || "").trim();
                if (!normalizedEventGroup) return false;

                if (groupSet.has(normalizedEventGroup)) return true;

                const eventHasNumber = /\d/.test(normalizedEventGroup);
                if (eventHasNumber) return false;

                return Array.from(groupSet).some((selectedGroup) =>
                  String(selectedGroup || "")
                    .trim()
                    .startsWith(normalizedEventGroup),
                );
              });
            if (!matchesGroup) continue;
          }
        }

        if (shouldFilterLectoratBySubjectOnly) {
          if (!matchesSelectedLectorat(ev)) continue;
        }
      }

      out.push(ev);
    }

    // 5) Sort: dzień → start → opcjonalnie id (stabilizacja)
    out.sort(
      (a, b) =>
        a.day - b.day ||
        getMin(a.start) - getMin(b.start) ||
        (a.id ?? 0) - (b.id ?? 0),
    );

    return out;
  }, []);

  const [filtered, setFiltered] = useState(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          parsed?.ts &&
          Date.now() - parsed.ts < CACHE_TTL &&
          Array.isArray(parsed.data)
        ) {
          return parsed.data;
        }
      }
    } catch (e) {}
    return computeFiltered(
      schedule,
      studentGroups,
      hideLectures,
      showAll,
      viewedWeekStart,
      selectedLectoratSubject,
    );
  });

  useEffect(() => {
    const res = computeFiltered(
      schedule,
      studentGroups,
      hideLectures,
      showAll,
      viewedWeekStart,
      selectedLectoratSubject,
    );
    setFiltered(res);
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ ts: Date.now(), data: res }),
      );
    } catch (e) {}
  }, [
    schedule,
    studentGroups,
    hideLectures,
    showAll,
    viewedWeekStart,
    selectedLectoratSubject,
    computeFiltered,
    CACHE_KEY,
  ]);

  return { filtered, computeFiltered };
}
