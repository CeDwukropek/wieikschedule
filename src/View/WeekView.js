import EventCard from "../EventCard";
import React, { forwardRef } from "react";
import { timeToMinutes } from "../utils";

const WeekView = forwardRef(function WeekView({ events }, ref) {
  const startHour = 7;
  const endHour = 20;
  const slotMinutes = 15;
  const slotsPerHour = 60 / slotMinutes;
  const totalSlots = (endHour - startHour) * slotsPerHour;
  const days = [0, 1, 2, 3, 4]; // Pon–Pt
  const dayNames = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek"];

  function toMinutes(t) {
    return timeToMinutes(t);
  }

  // Create time slots for each day
  function createTimeSlots() {
    const slots = [];
    for (let i = 0; i < totalSlots; i++) {
      const hour = startHour + Math.floor((i * slotMinutes) / 60);
      const minute = (i * slotMinutes) % 60;
      const slotStart = hour * 60 + minute;
      const slotEnd = slotStart + slotMinutes;
      slots.push({ slotStart, slotEnd, index: i });
    }
    return slots;
  }

  const timeSlots = createTimeSlots();

  // Group events that overlap in the same time slot
  function getEventsForSlot(dayEvents, slotStart, slotEnd) {
    return dayEvents.filter((ev) => {
      const evStart = toMinutes(ev.start);
      const evEnd = toMinutes(ev.end);
      // Check if event overlaps with this slot
      return evStart < slotEnd && evEnd > slotStart;
    });
  }

  // Calculate how many slots an event spans
  function getEventSpan(ev) {
    const evStart = toMinutes(ev.start);
    const evEnd = toMinutes(ev.end);
    const durationMinutes = evEnd - evStart;
    return Math.ceil(durationMinutes / slotMinutes);
  }

  return (
    <div className="overflow-x-auto w-full">
      <style>{`
        .week-grid {
          display: grid;
          overflow: hidden;
          color: #e5e7eb;
          border-left: 1px solid rgba(148,163,184,0.08);
          border-right: 1px solid rgba(148,163,184,0.08);
          border-bottom: 1px solid rgba(148,163,184,0.08);
          border-radius: 0.5rem;
          box-shadow: 0 10px 15px -3px rgba(2,6,23,0.6);
          overflow-y: auto;
          grid-template-columns: 60px repeat(5, minmax(160px, 1fr));
          grid-template-rows: auto repeat(${totalSlots}, 1rem);
        }
        
        @media (max-width: 768px) {
          .week-grid {
            grid-template-columns: 60px repeat(5, minmax(calc(100vw - 60px), 1fr));
            min-width: calc(60px + (100vw - 60px) * 5);
          }
        }
        
        .time-slot {
          display: flex;
          gap: 2px;
          padding: 2px;
          min-height: 1rem;
          align-items: flex-start;
        }
        
        .event-container {
          display: flex;
          flex-direction: row;
          flex: 1;
          min-width: 0;
          gap: 2px;
          width: 100%;
          height: 100%;
        }

        /* Hover/focus tooltip for event details */
        .event-wrapper {
          position: relative;
          flex: 1;
          min-width: 0;
          display: flex;
          outline: none;
        }

        .event-tooltip {
          position: absolute;
          left: 0;
          top: -8px;
          transform: translateY(-100%);
          opacity: 0;
          pointer-events: none;
          z-index: 50;
          background: #111827; /* neutral-900 */
          border: 1px solid rgba(148,163,184,0.25);
          box-shadow: 0 10px 15px -3px rgba(2,6,23,0.6);
          border-radius: 0.375rem;
          padding: 0.5rem 0.6rem;
          min-width: 220px;
          max-width: 280px;
          color: #e5e7eb;
          font-size: 0.75rem;
          line-height: 1.1rem;
        }

        .event-wrapper:hover .event-tooltip,
        .event-wrapper:focus .event-tooltip {
          opacity: 1;
          transform: translateY(calc(-100% - 4px));
        }

        .event-tooltip .row { display: flex; align-items: center; gap: 0.4rem; }
        .event-tooltip .label { opacity: 0.7; }
      `}</style>

      <div className="week-grid" ref={ref}>
        {/* Header row - Day names */}
        {dayNames.map((name, dayIndex) => (
          <div
            key={dayIndex}
            className="sticky top-0 z-10 py-2 border-b border-neutral-700 bg-neutral-800 text-center text-sm font-semibold"
            style={{ 
              gridColumn: dayIndex + 2,
              gridRow: 1
            }}
          >
            {name}
          </div>
        ))}

        {/* Empty corner above time column */}
        <div
          className="sticky top-0 z-10 bg-neutral-900 border-r border-b border-neutral-700"
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
              gridRowEnd: (i + 1) * slotsPerHour + 2
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

            const slotEvents = getEventsForSlot(dayEvents, slot.slotStart, slot.slotEnd);
            
            // Filter out events that were already rendered in a previous slot
            const newEvents = slotEvents.filter((ev) => {
              const evStart = toMinutes(ev.start);
              const eventStartsInThisSlot = evStart >= slot.slotStart && evStart < slot.slotEnd;
              const notYetRendered = !renderedEvents.has(ev);
              
              if (eventStartsInThisSlot && notYetRendered) {
                renderedEvents.add(ev);
                // Mark all slots this event occupies as occupied
                const span = getEventSpan(ev);
                for (let i = 1; i < span; i++) {
                  occupiedSlots.add(slot.index + i);
                }
                return true;
              }
              return false;
            });

            // Calculate the maximum span of events in this slot
            const maxSpan = newEvents.length > 0 
              ? Math.max(...newEvents.map((ev) => getEventSpan(ev)))
              : 1;

            const isHourBoundary = slot.index % slotsPerHour === 0;

            return (
              <div
                key={`${day}-${slot.index}`}
                className={`time-slot border-l border-neutral-800 border-t ${
                  isHourBoundary ? "border-neutral-700" : "border-neutral-800"
                }`}
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
                      const title = ev.title || ev.subj;
                      const groups = Array.isArray(ev.groups) ? ev.groups.join(", ") : ev.groups;

                      return (
                        <div
                          key={uniqueKey}
                          className="event-wrapper"
                          tabIndex={0}
                        >
                          <EventCard ev={ev} />
                          <div className="event-tooltip">
                            {title ? (
                              <div className="row"><span className="label">Przedmiot:</span> <span>{title}</span></div>
                            ) : null}
                            {ev.type ? (
                              <div className="row"><span className="label">Typ:</span> <span>{ev.type}</span></div>
                            ) : null}
                            {(ev.start && ev.end) ? (
                              <div className="row"><span className="label">Czas:</span> <span>{ev.start} - {ev.end}</span></div>
                            ) : null}
                            {ev.room ? (
                              <div className="row"><span className="label">Sala:</span> <span>{ev.room}</span></div>
                            ) : null}
                            {groups ? (
                              <div className="row"><span className="label">Grupy:</span> <span>{groups}</span></div>
                            ) : null}
                          </div>
                        </div>
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
