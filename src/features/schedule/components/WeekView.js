import { getWeekStart } from "../../../utils/date";
import EventCard from "./EventCard";
import React, { forwardRef, useEffect, useState } from "react";
import EventDetailsDialog from "./EventDetailsDialog";
import { createTimeSlots } from "../logic/timeSlots";
import { buildEventLayout } from "../logic/eventLayout";
import "./ScheduleView.css";

const DAYS = [0, 1, 2, 3, 4]; // Pon–Pt

const WeekView = forwardRef(function WeekView(
  {
    events,
    subjects = {},
    viewedWeekStart,
    planActions,
  },
  ref,
) {
  const startHour = 7;
  const endHour = 22;
  const slotMinutes = 15;

  const slotsPerHour = 60 / slotMinutes;
  const totalSlots = (endHour - startHour) * slotsPerHour;
  const totalMinutes = (endHour - startHour) * 60;
  const [selectedEvent, setSelectedEvent] = useState(null);
  useEffect(() => setSelectedEvent(null), [events, viewedWeekStart]);

  const dayNames = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek"];
  const shortDayNames = ["Pon.", "Wt.", "Śr.", "Czw.", "Pt."];

  const monday =
    viewedWeekStart instanceof Date
      ? new Date(viewedWeekStart)
      : getWeekStart(new Date());

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
  }, [events, startHour, endHour]);

  return (
    <div className="week-overview">
      <p className="week-overview-hint">Cały tydzień <span>· Kliknij zajęcia, aby zobaczyć szczegóły</span></p>
      <div ref={ref} className="week-grid" style={{gridTemplateRows: `auto auto repeat(${totalSlots}, var(--week-slot-height))`}} aria-label="Plan od poniedziałku do piątku, od 7:00 do 22:00">
        {/* Header row - Day names */}
        {dayNames.map((name, dayIndex) => (
          <div
            key={dayIndex}
            className="week-day-name"
            style={{
              gridColumn: dayIndex + 2,
              gridRow: 1,
            }}
          >
            <span className="week-day-long">{name}</span><abbr className="week-day-short" title={name}>{shortDayNames[dayIndex]}</abbr>
          </div>
        ))}

        {/* Date row - under day names */}
        {dayNames.map((name, dayIndex) => (
          <div
            key={`date-${dayIndex}`}
            className="week-day-date"
            style={{
              gridColumn: dayIndex + 2,
              gridRow: 2,
            }}
          >
            {getDayDate(dayIndex)}
          </div>
        ))}

        {/* Empty corner above time column */}
        <div
          className="z-10 border-r border-neutral-700 bg-neutral-900"
          style={{ gridColumn: 1, gridRow: 1, gridRowEnd: 3 }}
        />

        {/* Time column labels - only on hourly rows */}
        {Array.from({ length: endHour - startHour }, (_, i) => (
          <div
            key={i}
            className="week-hour-label border-t border-neutral-700 bg-neutral-900"
            style={{
              gridColumn: 1,
              gridRow: i * slotsPerHour + 3,
              gridRowEnd: (i + 1) * slotsPerHour + 3,
            }}
          >
            <span className="mt-[0.25em]">{startHour + i}:00</span>
          </div>
        ))}

        {/* Day columns with time slots as background */}
        {DAYS.map((day) => {
          return timeSlots.map((slot) => {
            const isHourBoundary = slot.index % slotsPerHour === 0;
            const hourBlock = Math.floor(slot.index / slotsPerHour);

            return (
              <div
                key={`${day}-${slot.index}`}
                className={`time-slot border-l border-neutral-800 border-t ${
                  isHourBoundary ? "border-neutral-700" : "border-neutral-800"
                } ${hourBlock % 2 === 0 ? "hour-even" : ""}`}
                style={{
                  gridColumn: day + 2,
                  gridRow: slot.index + 3,
                }}
              />
            );
          });
        })}

        {/* Absolute overlay for day events */}
        {DAYS.map((day) => {
          const positionedEvents = layoutByDay.get(day) || [];

          return (
            <div
              key={`overlay-${day}`}
              className="week-events-overlay"
              style={{
                gridColumn: day + 2,
                gridRow: 3,
                gridRowEnd: `span ${totalSlots}`,
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
                          onOpenDetails={setSelectedEvent}
                        />
                    </div>
                  );
                },
              )}
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
      />}
    </div>
  );
});

export default WeekView;
