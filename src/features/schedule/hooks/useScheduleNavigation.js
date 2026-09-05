import { useCallback, useEffect, useMemo, useState } from "react";
import { formatDate, getWeekStart, parseDaySelection, WEEKDAYS } from "../../../utils/date";

function savedWeekOffset(settings) {
  if (Number.isFinite(Number(settings?.weekOffset))) return Number(settings.weekOffset);
  return settings?.activeWeekKey === "prev" ? -1 : settings?.activeWeekKey === "next" ? 1 : 0;
}

export function useScheduleNavigation({ minDate, maxDate, savedSettings }) {
  const [today] = useState(() => new Date());
  const thisWeekStart = useMemo(() => getWeekStart(today), [today]);
  const defaultDay = Math.min((today.getDay() + 6) % 7, 4);
  const [weekOffset, setWeekOffset] = useState(() => savedWeekOffset(savedSettings));
  const [selection, setSelection] = useState(`0:${defaultDay}`);

  useEffect(() => {
    if (savedSettings) setWeekOffset(savedWeekOffset(savedSettings));
  }, [savedSettings]);

  const getWeekStartByOffset = useCallback(offset => {
    const start = new Date(thisWeekStart);
    start.setDate(start.getDate() + Number(offset || 0) * 7);
    return start;
  }, [thisWeekStart]);

  const getRangeByOffset = useCallback(offset => {
    const start = getWeekStartByOffset(offset);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${formatDate(start)} - ${formatDate(end)}`;
  }, [getWeekStartByOffset]);

  const getOffset = useCallback(value => {
    if (!value) return null;
    const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);
    if (Number.isNaN(date.getTime())) return null;
    return Math.round((getWeekStart(date) - thisWeekStart) / (7 * 24 * 60 * 60 * 1000));
  }, [thisWeekStart]);

  const minOffset = getOffset(minDate) ?? Number.NEGATIVE_INFINITY;
  const maxOffset = getOffset(maxDate) ?? Number.POSITIVE_INFINITY;
  useEffect(() => {
    setWeekOffset(offset => Math.min(Math.max(offset, minOffset), maxOffset));
  }, [minOffset, maxOffset, weekOffset]);

  const offsets = useMemo(() => {
    if (!Number.isFinite(minOffset) || !Number.isFinite(maxOffset)) return null;
    return Array.from({ length: Math.max(0, maxOffset - minOffset + 1) }, (_, i) => minOffset + i);
  }, [minOffset, maxOffset]);
  const weekOptions = useMemo(() => (offsets || [-1, 0, 1])
    .map(value => ({ value, label: getRangeByOffset(value) })), [offsets, getRangeByOffset]);
  const dayOptions = useMemo(() => (offsets || [0, 1]).flatMap(offset =>
    WEEKDAYS.map((label, day) => {
      const date = getWeekStartByOffset(offset);
      date.setDate(date.getDate() + day);
      return { value: `${offset}:${day}`, label, date: formatDate(date) };
    })), [offsets, getWeekStartByOffset]);

  useEffect(() => {
    if (!dayOptions.length || dayOptions.some(option => option.value === selection)) return;
    const todayValue = `0:${defaultDay}`;
    setSelection(dayOptions.some(option => option.value === todayValue) ? todayValue : dayOptions[0].value);
  }, [dayOptions, defaultDay, selection]);

  const selected = parseDaySelection(selection, defaultDay);
  const viewedWeekStart = useMemo(() => getWeekStartByOffset(weekOffset), [getWeekStartByOffset, weekOffset]);
  const selectedDayWeekStart = useMemo(() => getWeekStartByOffset(selected.weekOffset), [getWeekStartByOffset, selected.weekOffset]);
  const dayIndex = Math.max(0, dayOptions.findIndex(option => option.value === selection));
  const selectedOption = dayOptions[dayIndex];

  return {
    weekOffset,
    viewedWeekStart,
    selectedDayWeekStart,
    weekNavigation: {
      viewedWeekRange: getRangeByOffset(weekOffset),
      isCurrentWeek: weekOffset === 0,
      canGoPrevWeek: weekOffset > minOffset,
      canGoNextWeek: weekOffset < maxOffset,
      onPrevWeek: () => setWeekOffset(offset => Math.max(offset - 1, minOffset)),
      onNextWeek: () => setWeekOffset(offset => Math.min(offset + 1, maxOffset)),
      onResetWeek: () => setWeekOffset(0),
    },
    weekSelection: { options: weekOptions, selection: weekOffset, onChange: setWeekOffset },
    dayNavigation: {
      currentDayLabel: selectedOption ? `${selectedOption.label} ${selectedOption.date}` : "",
      isCurrentDay: selected.weekOffset === 0 && selected.dayIndex === defaultDay,
      canGoPrevDay: dayIndex > 0,
      canGoNextDay: dayIndex < dayOptions.length - 1,
      onPrevDay: () => { if (dayIndex > 0) setSelection(dayOptions[dayIndex - 1].value); },
      onNextDay: () => { if (dayIndex < dayOptions.length - 1) setSelection(dayOptions[dayIndex + 1].value); },
      onResetDay: () => setSelection(`0:${defaultDay}`),
    },
    daySelection: { options: dayOptions, selection, onChange: setSelection },
  };
}
