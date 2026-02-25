import { useMemo } from "react";
import { getWeekStart, formatDate, getCurrentParity } from "../utils/dateUtils";

function toLocalDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDateKey(key) {
  return new Date(`${key}T12:00:00`);
}

export function useDateHelpers(schedule = []) {
  const today = useMemo(() => new Date(), []);
  const hasDateBasedEvents = useMemo(
    () =>
      Array.isArray(schedule) && schedule.some((event) => Boolean(event?.date)),
    [schedule],
  );

  const availableWeekKeys = useMemo(() => {
    if (!hasDateBasedEvents) return [];
    const weekKeySet = new Set();

    for (const event of schedule) {
      if (!event?.date) continue;
      const eventDate = new Date(`${event.date}T12:00:00`);
      if (Number.isNaN(eventDate.getTime())) continue;
      weekKeySet.add(toLocalDateKey(getWeekStart(eventDate)));
    }

    return Array.from(weekKeySet).sort((a, b) => a.localeCompare(b));
  }, [schedule, hasDateBasedEvents]);

  const thisWeekStart = useMemo(() => getWeekStart(today), [today]);
  const thisWeekEnd = useMemo(() => {
    const date = new Date(thisWeekStart);
    date.setDate(date.getDate() + 6);
    return date;
  }, [thisWeekStart]);

  const nextWeekStart = useMemo(() => {
    const date = new Date(thisWeekStart);
    date.setDate(date.getDate() + 7);
    return date;
  }, [thisWeekStart]);

  const nextWeekEnd = useMemo(() => {
    const date = new Date(nextWeekStart);
    date.setDate(date.getDate() + 6);
    return date;
  }, [nextWeekStart]);

  const currentParity = useMemo(() => {
    if (!hasDateBasedEvents || availableWeekKeys.length === 0) {
      return getCurrentParity(today);
    }

    const thisWeekKey = toLocalDateKey(thisWeekStart);
    const exactIndex = availableWeekKeys.indexOf(thisWeekKey);
    if (exactIndex >= 0) return availableWeekKeys[exactIndex];

    const firstFuture = availableWeekKeys.find((key) => key >= thisWeekKey);
    return firstFuture || availableWeekKeys[availableWeekKeys.length - 1];
  }, [availableWeekKeys, hasDateBasedEvents, thisWeekStart, today]);

  const nextParity = useMemo(() => {
    if (!hasDateBasedEvents || availableWeekKeys.length === 0) {
      return currentParity === "even" ? "odd" : "even";
    }

    const idx = availableWeekKeys.indexOf(currentParity);
    if (idx === -1) return currentParity;
    return availableWeekKeys[Math.min(idx + 1, availableWeekKeys.length - 1)];
  }, [availableWeekKeys, currentParity, hasDateBasedEvents]);

  const currentRange = useMemo(() => {
    if (!hasDateBasedEvents || !/^\d{4}-\d{2}-\d{2}$/.test(currentParity)) {
      return `${formatDate(thisWeekStart)} - ${formatDate(thisWeekEnd)}`;
    }

    const start = parseDateKey(currentParity);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${formatDate(start)} - ${formatDate(end)}`;
  }, [currentParity, hasDateBasedEvents, thisWeekStart, thisWeekEnd]);

  const nextRange = useMemo(() => {
    if (!hasDateBasedEvents || !/^\d{4}-\d{2}-\d{2}$/.test(nextParity)) {
      return `${formatDate(nextWeekStart)} - ${formatDate(nextWeekEnd)}`;
    }

    const start = parseDateKey(nextParity);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${formatDate(start)} - ${formatDate(end)}`;
  }, [hasDateBasedEvents, nextParity, nextWeekStart, nextWeekEnd]);

  // Build combined options used by DayView and BottomDayNav
  const combinedOptions = useMemo(() => {
    const names = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek"];
    return ["current", "next"].flatMap((parityToken) => {
      const baseDate = (() => {
        if (!hasDateBasedEvents) {
          return parityToken === "next" ? nextWeekStart : thisWeekStart;
        }
        const key = parityToken === "next" ? nextParity : currentParity;
        return /^\d{4}-\d{2}-\d{2}$/.test(key)
          ? parseDateKey(key)
          : parityToken === "next"
            ? nextWeekStart
            : thisWeekStart;
      })();

      return names.map((name, i) => {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + i);
        return {
          value: `${parityToken}:${i}`,
          label: name,
          date: formatDate(d),
        };
      });
    });
  }, [
    hasDateBasedEvents,
    nextParity,
    currentParity,
    thisWeekStart,
    nextWeekStart,
  ]);

  const defaultDayIndex = useMemo(
    () => Math.min(Math.max((today.getDay() + 6) % 7, 0), 4),
    [today],
  );

  return {
    today,
    currentParity,
    nextParity,
    currentRange,
    nextRange,
    combinedOptions,
    defaultDayIndex,
    hasDateBasedEvents,
    availableWeekKeys,
  };
}
