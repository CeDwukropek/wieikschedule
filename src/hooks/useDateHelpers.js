import { useMemo } from "react";
import { getWeekStart, formatDate, getCurrentParity } from "../utils/dateUtils";

export function useDateHelpers() {
  const today = useMemo(() => new Date(), []);

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

  const currentParity = useMemo(() => getCurrentParity(today), [today]);
  const nextParity = useMemo(
    () => (currentParity === "even" ? "odd" : "even"),
    [currentParity],
  );

  const currentRange = useMemo(
    () => `${formatDate(thisWeekStart)} - ${formatDate(thisWeekEnd)}`,
    [thisWeekStart, thisWeekEnd],
  );

  const nextRange = useMemo(
    () => `${formatDate(nextWeekStart)} - ${formatDate(nextWeekEnd)}`,
    [nextWeekStart, nextWeekEnd],
  );

  // Build combined options used by DayView and BottomDayNav
  const combinedOptions = useMemo(() => {
    const names = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek"];
    return ["current", "next"].flatMap((parityToken) => {
      const baseDate = parityToken === "next" ? nextWeekStart : thisWeekStart;

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
  }, [thisWeekStart, nextWeekStart]);

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
  };
}
