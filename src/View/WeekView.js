import EventCard from "../EventCard";
import React, { forwardRef } from "react";
import EventTooltipWrapper from "../EventTooltipWrapper";
import {
  createTimeSlots,
  getEventsForSlot,
  getEventSpan,
  toMinutes,
} from "../timeSlotUtils";
import "./ViewStyles.css";

const WeekView = forwardRef(function WeekView({ events, subjects = {} }, ref) {
  const startHour = 7;
  const endHour = 22;
  const slotMinutes = 15;

  const slotsPerHour = 60 / slotMinutes;
  const totalSlots = (endHour - startHour) * slotsPerHour;

  const days = [0, 1, 2, 3, 4]; // Pon–Pt
  const dayNames = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek"];

  const timeSlots = createTimeSlots(startHour, endHour, slotMinutes);

  return (
    <div className="overflow-x-auto w-full">
      <style>{`
        .week-grid {
          grid-template-columns: 60px repeat(5, minmax(160px, 1fr));
          grid-template-rows: auto repeat(${totalSlots}, 1rem);
        }

        @media (max-width: 768px) {
          .week-grid {
            grid-template-columns: 60px repeat(5, minmax(calc(100vw - 60px), 1fr));
            min-width: calc(60px + (100vw - 60px) * 5);
          }
        }

        .hour-even {
          background-color: rgba(255, 255, 255, 0.02);
        }
      `}</style>

      {/* Jeden scroll-container */}
      <div className="week-grid overflow-auto" ref={ref}>
        {/* Header row - Day names */}
        {dayNames.map((name, dayIndex) => (
          <div
            key={dayIndex}
            className="sticky top-0 z-10 py-2 text-center text-sm font-semibold bg-neutral-900"
            style={{
              gridColumn: dayIndex + 2,
              gridRow: 1,
            }}
          >
            {name}
          </div>
        ))}

        {/* Empty corner above time column */}
        <div
          className="sticky top-0 z-10 border-r border-neutral-700 bg-neutral-900"
          style={{ gridColumn: 1, gridRow: 1 }}
        />

        {/* Time column labels - only on hourly rows */}
        {Array.from({ length: endHour - startHour }, (_, i) => (
          <div
            key={i}
            className="sticky left-0 z-10 flex justify-end pr-2 text-xs text-gray-400 border-t border-neutral-700 bg-neutral-900"
            style={{
              gridColumn: 1,
              gridRow: i * slotsPerHour + 2,
              gridRowEnd: (i + 1) * slotsPerHour + 2,
            }}
          >
            <span className="mt-[0.25em]">{startHour + i}:00</span>
          </div>
        ))}

        {/* Day columns with time slots */}
        {days.map((day) => {
          const dayEvents = events.filter((e) => e.day === day);
          const renderedEvents = new Set();
          const occupiedSlots = new Set();

          return timeSlots.map((slot) => {
            if (occupiedSlots.has(slot.index)) return null;

            const slotEvents = getEventsForSlot(
              dayEvents,
              slot.slotStart,
              slot.slotEnd,
            );

            const newEvents = slotEvents.filter((ev) => {
              const evStart = toMinutes(ev.start);
              const eventStartsInThisSlot =
                evStart >= slot.slotStart && evStart < slot.slotEnd;
              const notYetRendered = !renderedEvents.has(ev);

              if (eventStartsInThisSlot && notYetRendered) {
                renderedEvents.add(ev);
                const span = getEventSpan(ev, slotMinutes);
                for (let i = 1; i < span; i++)
                  occupiedSlots.add(slot.index + i);
                return true;
              }
              return false;
            });

            const maxSpan =
              newEvents.length > 0
                ? Math.max(
                    ...newEvents.map((ev) => getEventSpan(ev, slotMinutes)),
                  )
                : 1;

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
                  gridRow: slot.index + 2,
                  gridRowEnd: `span ${maxSpan}`,
                }}
              >
                {newEvents.length > 0 && (
                  <div className="event-container">
                    {newEvents.map((ev, idx) => {
                      const uniqueKey = `${day}-${ev.id}-${ev.start}-${ev.end}-${ev.room}-${idx}`;
                      return (
                        <EventTooltipWrapper ev={ev} key={uniqueKey}>
                          <EventCard ev={ev} subjects={subjects} />
                        </EventTooltipWrapper>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          });
        })}
      </div>
    </div>
  );
});

export default WeekView;
