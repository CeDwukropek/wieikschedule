import { getWeekStart, toIsoDate } from "../../../utils/date";
import EventCard from "./EventCard";
import React, { forwardRef, useEffect, useState } from "react";
import EventDetailsDialog from "./EventDetailsDialog";
import { createTimeSlots } from "../logic/timeSlots";
import { buildEventLayout } from "../logic/eventLayout";
import { tileKey } from "../logic/eventIdentity";
import DayStrip from "../../plan-items/DayStrip";
import { minutesLabel, useSlotSelection } from "../../plan-items/useSlotSelection";
import { slotTerm } from "../../plan-items/planItemEditing";
import { useNow } from "../hooks/useNow";
import { hasEnded, nowFraction } from "../logic/timeMarks";
import "./ScheduleView.css";

const WORKDAYS = [0, 1, 2, 3, 4]; // Pon–Pt; Sob/Nd only when the week has something then

const WeekView = forwardRef(function WeekView(
  {
    events,
    subjects = {},
    viewedWeekStart,
    planActions,
    days: DAYS = WORKDAYS,
    strip = {},
    onOpenItem,
    onItemState,
    itemActions,
    onCreateAt,
    dimPast = false,
  },
  ref,
) {
  const startHour = 7;
  const endHour = 22;
  const slotMinutes = 15;

  const slotsPerHour = 60 / slotMinutes;
  const totalSlots = (endHour - startHour) * slotsPerHour;
  const totalMinutes = (endHour - startHour) * 60;
  // The dialog follows the tile through recomputed events and closes when it is gone or the week changes.
  const [selectedKey, setSelectedKey] = useState(null);
  useEffect(() => setSelectedKey(null), [viewedWeekStart]);
  const selectedEvent = selectedKey ? events.find(ev => tileKey(ev) === selectedKey) || null : null;
  const setSelectedEvent = ev => setSelectedKey(ev ? tileKey(ev) : null);

  const dayNames = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];
  const shortDayNames = ["Pon.", "Wt.", "Śr.", "Czw.", "Pt.", "Sob.", "Nd."];
  // Whole-day entries get their own row under the dates only in weeks that have some.
  const hasStrip = DAYS.some(day => strip[day]?.length);
  const firstSlotRow = hasStrip ? 4 : 3;
  const openDetails = ev => ev.planItem ? onOpenItem?.(ev.planItem) : setSelectedEvent(ev);

  const monday =
    viewedWeekStart instanceof Date
      ? new Date(viewedWeekStart)
      : getWeekStart(new Date());
  // Today's column and the current time are marked; with dimPast, what has ended is faded.
  const now = useNow();
  const todayIso = toIsoDate(now);
  const dayIso = day => toIsoDate(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + day));
  const isToday = day => dayIso(day) === todayIso;
  const isPastDay = day => dimPast && dayIso(day) < todayIso;
  const nowAt = nowFraction(now, startHour, endHour);

  // A free time chosen in a day column becomes a new entry there (signed-in users with entries on).
  const { selection, handlers } = useSlotSelection(onCreateAt && ((day, from, to) => onCreateAt(slotTerm(
    toIsoDate(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + day)), from, to - from > 15 ? to : from))),
  { startHour, endHour });

  const getDayDate = (dayOffset) => {
    const date = new Date(monday);
    date.setDate(date.getDate() + dayOffset);
    return date.toLocaleDateString("pl-PL", {
      month: "numeric",
      day: "numeric",
    });
  };

  const timeSlots = createTimeSlots(startHour, endHour, slotMinutes);
  const layoutByDay = React.useMemo(() => {
    const map = new Map();

    DAYS.forEach((day) => {
      const dayEvents = events.filter((e) => e.day === day);
      map.set(day, buildEventLayout(dayEvents, { startHour, endHour }));
    });

    return map;
  }, [events, startHour, endHour, DAYS]);

  return (
    <div className="week-overview">
      <p className="week-overview-hint">Cały tydzień <span>· Kliknij zajęcia, aby zobaczyć szczegóły{onCreateAt ? "; kliknij lub przeciągnij po wolnym miejscu, aby dodać termin" : ""}</span></p>
      <div ref={ref} className="week-grid" style={{"--week-days": DAYS.length, gridTemplateRows: `auto auto ${hasStrip ? "auto " : ""}repeat(${totalSlots}, var(--week-slot-height))`}}
        aria-label={`Plan od poniedziałku do ${DAYS.length > 5 ? "niedzieli" : "piątku"}, od 7:00 do 22:00`}>
        {/* Header row - Day names */}
        {DAYS.map((dayIndex, column) => (
          <div
            key={dayIndex}
            className={`week-day-name${isToday(dayIndex) ? " is-today" : ""}`}
            data-past={isPastDay(dayIndex) || undefined}
            aria-current={isToday(dayIndex) ? "date" : undefined}
            style={{
              gridColumn: column + 2,
              gridRow: 1,
            }}
          >
            <span className="week-day-long">{dayNames[dayIndex]}</span><abbr className="week-day-short" title={dayNames[dayIndex]}>{shortDayNames[dayIndex]}</abbr>
          </div>
        ))}

        {/* Date row - under day names */}
        {DAYS.map((dayIndex, column) => (
          <div
            key={`date-${dayIndex}`}
            className={`week-day-date${isToday(dayIndex) ? " is-today" : ""}`}
            data-past={isPastDay(dayIndex) || undefined}
            style={{
              gridColumn: column + 2,
              gridRow: 2,
            }}
          >
            {getDayDate(dayIndex)}
          </div>
        ))}

        {/* Whole-day entries and deadlines */}
        {hasStrip && DAYS.map((dayIndex, column) => (
          <div key={`strip-${dayIndex}`} className="week-day-strip" data-past={isPastDay(dayIndex) || undefined} style={{ gridColumn: column + 2, gridRow: 3 }}>
            <DayStrip items={strip[dayIndex]} onOpen={item => onOpenItem?.(item)} />
          </div>
        ))}

        {/* Empty corner above time column */}
        <div
          className="z-10 border-r border-neutral-700 bg-neutral-900"
          style={{ gridColumn: 1, gridRow: `1 / ${firstSlotRow}` }}
        />

        {/* Time column labels - only on hourly rows */}
        {Array.from({ length: endHour - startHour }, (_, i) => (
          <div
            key={i}
            className="week-hour-label border-t border-neutral-700 bg-neutral-900"
            style={{
              gridColumn: 1,
              gridRow: `${i * slotsPerHour + firstSlotRow} / ${(i + 1) * slotsPerHour + firstSlotRow}`,
            }}
          >
            <span className="mt-[0.25em]">{startHour + i}:00</span>
          </div>
        ))}

        {/* Day columns with time slots as background */}
        {DAYS.map((day, column) => {
          return timeSlots.map((slot) => {
            const isHourBoundary = slot.index % slotsPerHour === 0;
            const hourBlock = Math.floor(slot.index / slotsPerHour);

            return (
              <div
                key={`${day}-${slot.index}`}
                className={`time-slot border-l border-neutral-800 border-t ${
                  isHourBoundary ? "border-neutral-700" : "border-neutral-800"
                } ${hourBlock % 2 === 0 ? "hour-even" : ""}${isToday(day) ? " is-today" : ""}`}
                data-past={isPastDay(day) || undefined}
                style={{
                  gridColumn: column + 2,
                  gridRow: slot.index + firstSlotRow,
                }}
              />
            );
          });
        })}

        {/* Absolute overlay for day events */}
        {DAYS.map((day, column) => {
          const positionedEvents = layoutByDay.get(day) || [];

          return (
            <div
              key={`overlay-${day}`}
              className={`week-events-overlay${onCreateAt ? " is-creatable" : ""}`}
              {...handlers(day)}
              style={{
                gridColumn: column + 2,
                // One shorthand: React updates only changed properties, and setting grid-row alone
                // would reset a separately kept grid-row-end (the overlay collapsed to one slot).
                gridRow: `${firstSlotRow} / span ${totalSlots}`,
              }}
            >
              {positionedEvents.map(
                (
                  { ev, startMinutes, endMinutes, column, columnCount },
                  idx,
                ) => {
                  const startOffset = startMinutes - startHour * 60;
                  const duration = endMinutes - startMinutes;
                  const width = 100 / columnCount;
                  const left = column * width;
                  const uniqueKey = `${day}-${ev.id}-${ev.start}-${ev.end}-${ev.room}-${idx}`;

                  return (
                    <div
                      key={uniqueKey}
                      className="week-event-item"
                      data-past={(dimPast && hasEnded(dayIso(day), ev.end, now)) || undefined}
                      style={{
                        top: `${startOffset / totalMinutes * 100}%`,
                        height: `${duration / totalMinutes * 100}%`,
                        left: `calc(${left}% + 1px)`,
                        width: `calc(${width}% - 2px)`,
                      }}
                    >
                        <EventCard
                          ev={ev}
                          subjects={subjects}
                          compact
                          onOpenDetails={openDetails}
                        />
                    </div>
                  );
                },
              )}
              {isToday(day) && nowAt !== null && <div className="grid-now-line" data-now aria-hidden="true" style={{ top: `${nowAt * 100}%` }} />}
              {selection?.day === day && <div className="grid-new-slot" aria-hidden="true" style={{
                top: `${(selection.from - startHour * 60) / totalMinutes * 100}%`,
                height: `${(selection.to - selection.from) / totalMinutes * 100}%`,
              }}>{minutesLabel(selection.from)}–{minutesLabel(selection.to)}</div>}
            </div>
          );
        })}
      </div>
      {selectedEvent && <EventDetailsDialog
        ev={selectedEvent}
        subjects={subjects}
        date={new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + selectedEvent.day)}
        onClose={() => setSelectedEvent(null)}
        planActions={planActions}
        onItemState={onItemState}
        itemActions={itemActions}
      />}
    </div>
  );
});

export default WeekView;
