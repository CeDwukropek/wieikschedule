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
  weekParity,
  showAll,
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
    parity, // "odd" | "even" | "all" | "YYYY-MM-DD"
    showAll,
  ) {
    const isDateWeekFilter = /^\d{4}-\d{2}-\d{2}$/.test(String(parity || ""));

    // 1) Predykat parzystości skompilowany raz
    const passParity = isDateWeekFilter
      ? (e) => weekStartKeyFromDate(e.date) === parity
      : parity === "odd"
        ? (e) => e.weeks !== "even"
        : parity === "even"
          ? (e) => e.weeks !== "odd"
          : () => true; // "all" → nic nie odrzucamy

    // 2) Zestaw wybranych grup (O(1) membership)
    const groupSet = new Set(Object.values(groups || {}).filter(Boolean));

    // 3) Cache na zamianę "HH:MM" → minuty (unikamy powtórzeń)
    const minutesCache = new Map();
    const getMin = (hhmm) => {
      let v = minutesCache.get(hhmm);
      if (v == null) {
        v = timeToMinutes(hhmm);
        minutesCache.set(hhmm, v);
      }
      return v;
    };

    // 4) Jedno przejście: filtrujemy i zbieramy w tablicę
    const out = [];
    for (const ev of schedule) {
      if (!passParity(ev)) continue;

      // ukryj wykłady, jeśli proszono
      if (hideLectures && isLecture(ev)) continue;

      // wykłady zawsze przepuszczamy (jeśli nie są ukryte)
      if (!isLecture(ev)) {
        // jeśli nie "pokaż wszystko", filtruj po grupach
        if (!showAll) {
          const matchesGroup =
            Array.isArray(ev.groups) && ev.groups.some((g) => groupSet.has(g));
          if (!matchesGroup) continue;
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
      weekParity,
      showAll,
    );
  });

  useEffect(() => {
    const res = computeFiltered(
      schedule,
      studentGroups,
      hideLectures,
      weekParity,
      showAll,
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
    weekParity,
    showAll,
    computeFiltered,
    CACHE_KEY,
  ]);

  return { filtered, computeFiltered };
}
