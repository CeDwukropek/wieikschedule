import EventCard from "../EventCard";
import React, { forwardRef } from "react";
import EventTooltipWrapper from "../EventTooltipWrapper";
import { createTimeSlots } from "../timeSlotUtils";
import { buildEventLayout } from "../utils/eventLayout";
import "./ViewStyles.css";

const DAYS = [0, 1, 2, 3, 4]; // Pon–Pt

const WeekView = forwardRef(function WeekView(
  { events, subjects = {}, viewedWeekStart },
  ref,
) {
  const startHour = 7;
  const endHour = 22;
  const slotMinutes = 15;

  const slotsPerHour = 60 / slotMinutes;
  const totalSlots = (endHour - startHour) * slotsPerHour;

  const dayNames = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek"];

  // Get Monday of current week or use passed viewedWeekStart
  const monday =
    viewedWeekStart instanceof Date
      ? new Date(viewedWeekStart)
      : (() => {
          const today = new Date();
          const dayOfWeek = today.getDay();
          const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
          const m = new Date(today);
          m.setDate(today.getDate() + mondayOffset);
          return m;
        })();

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
    <div className="week-scroll w-full overflow-auto">
      <style>{`
        .week-grid {
          grid-template-columns: 40px repeat(5, minmax(160px, 1fr));
          grid-template-rows: auto auto repeat(${totalSlots}, 1rem);
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .week-grid {
            grid-template-columns: 40px repeat(5, calc(100vw - 88px));
            min-width: calc(40px + (100vw - 88px) * 5);
          }
        }

        .hour-even {
          background-color: rgba(255, 255, 255, 0.02);
        }
      `}</style>

      {/* Jeden scroll-container */}
      <div ref={ref} className="week-grid">
        {/* Header row - Day names */}
        {dayNames.map((name, dayIndex) => (
          <div
            key={dayIndex}
            className="z-10 py-2 text-center text-sm font-semibold bg-neutral-900 border-b border-neutral-700"
            style={{
              gridColumn: dayIndex + 2,
              gridRow: 1,
            }}
          >
            {name}
          </div>
        ))}

        {/* Date row - under day names */}
        {dayNames.map((name, dayIndex) => (
          <div
            key={`date-${dayIndex}`}
            className="z-10 py-1 text-center text-xs text-gray-400 bg-neutral-900 border-b border-neutral-700"
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
            className="flex justify-end pr-2 text-xs text-gray-400 border-t border-neutral-700 bg-neutral-900"
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
                  const topSlots = startOffset / slotMinutes;
                  const heightSlots = duration / slotMinutes;
                  const width = 100 / columnCount;
                  const left = column * width;
                  const uniqueKey = `${day}-${ev.id}-${ev.start}-${ev.end}-${ev.room}-${idx}`;

                  return (
                    <div
                      key={uniqueKey}
                      className="week-event-item"
                      style={{
                        top: `${topSlots}rem`,
                        height: `${heightSlots}rem`,
                        left: `calc(${left}% + 1px)`,
                        width: `calc(${width}% - 2px)`,
                      }}
                    >
                      <EventTooltipWrapper ev={ev}>
                        <EventCard ev={ev} subjects={subjects} />
                      </EventTooltipWrapper>
                    </div>
                  );
                },
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default WeekView;
