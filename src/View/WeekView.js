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

const WeekView = forwardRef(function WeekView({ events }, ref) {
  const startHour = 7;
  const endHour = 20;
  const slotMinutes = 15;
  const slotsPerHour = 60 / slotMinutes;
  const totalSlots = (endHour - startHour) * slotsPerHour;
  const days = [0, 1, 2, 3, 4]; // Pon–Pt
  const dayNames = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek"];

  // Current time tracking
  const [currentTime, setCurrentTime] = React.useState(new Date());
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const now = currentTime;
  const currentDay = (now.getDay() + 6) % 7;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const isCurrentTimeVisible =
    currentDay < 5 &&
    currentMinutes >= startHour * 60 &&
    currentMinutes <= endHour * 60;
  const currentTimeRow = isCurrentTimeVisible
    ? (currentMinutes - startHour * 60) / slotMinutes + 2
    : null;

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

      <div className="week-grid overflow-auto" ref={ref}>
        {/* Header row - Day names */}
        {dayNames.map((name, dayIndex) => (
          <div
            key={dayIndex}
            className="sticky top-0 z-10 py-2 border-b border-neutral-700 week-header text-center text-sm font-semibold"
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
          className="sticky top-0 z-10 week-header border-r border-b"
          style={{ gridColumn: 1, gridRow: 1, borderColor: "var(--ds-border)" }}
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
            // Skip this slot if it's occupied by a previously rendered event
            if (occupiedSlots.has(slot.index)) {
              return null;
            }

            const slotEvents = getEventsForSlot(
              dayEvents,
              slot.slotStart,
              slot.slotEnd,
            );

            // Filter out events that were already rendered in a previous slot
            const newEvents = slotEvents.filter((ev) => {
              const evStart = toMinutes(ev.start);
              const eventStartsInThisSlot =
                evStart >= slot.slotStart && evStart < slot.slotEnd;
              const notYetRendered = !renderedEvents.has(ev);

              if (eventStartsInThisSlot && notYetRendered) {
                renderedEvents.add(ev);
                const span = getEventSpan(ev, slotMinutes);
                for (let i = 1; i < span; i++) {
                  occupiedSlots.add(slot.index + i);
                }
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
                          <EventCard ev={ev} />
                        </EventTooltipWrapper>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          });
        })}

        {/* Current time indicator */}
        {isCurrentTimeVisible && (
          <div
            className="current-time-line"
            style={{
              gridColumn: `${currentDay + 2} / span 1`,
              gridRow: currentTimeRow,
              top: `${(((currentMinutes - startHour * 60) % slotMinutes) / slotMinutes) * 100}%`,
            }}
          />
        )}
      </div>
    </div>
  );
});

export default WeekView;
