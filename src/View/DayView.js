import React, { useMemo, forwardRef } from "react";
import EventCard from "../EventCard";
import EventTooltipWrapper from "../EventTooltipWrapper";
import {
  createTimeSlots,
  getEventsForSlot,
  getEventSpan,
  toMinutes,
} from "../timeSlotUtils";
import "./ViewStyles.css";

const DayView = forwardRef(function DayView(
  { events, subjects = {}, selection: externalSelection },
  ref,
) {
  const startHour = 7;
  const endHour = 22;
  const slotMinutes = 15;
  const slotsPerHour = 60 / slotMinutes;
  const totalSlots = (endHour - startHour) * slotsPerHour;

  const today = React.useMemo(() => new Date(), []);
  // default selected day index (clamped to 0..4) - used to detect "today"
  const defaultDayIndex = useMemo(
    () => Math.min(Math.max((today.getDay() + 6) % 7, 0), 4),
    [today],
  );

  const selection = externalSelection;
  // support both legacy (current/next) and numeric week offset selection formats
  const [rawOffset, rawDay] = String(selection || "").split(":");
  const selectedDayIndex = Number.isFinite(Number(rawDay))
    ? Number(rawDay)
    : defaultDayIndex;
  const selectedWeekOffset =
    rawOffset === "current"
      ? 0
      : rawOffset === "next"
        ? 1
        : Number(rawOffset) || 0;

  const eventsForDay = useMemo(
    () => events.filter((e) => e.day === selectedDayIndex),
    [events, selectedDayIndex],
  );
  const timeSlots = useMemo(
    () => createTimeSlots(startHour, endHour, slotMinutes),
    [startHour, endHour, slotMinutes],
  );

  // highlight if the displayed day is today in the current week
  const isTodayDisplayed =
    selectedWeekOffset === 0 && selectedDayIndex === defaultDayIndex;

  return (
    <div>
      <style>{`
        .day-grid {
          display: grid;
          grid-template-columns: 40px minmax(0, 1fr);
          grid-template-rows: repeat(${totalSlots}, 1rem);
        }
      `}</style>

      <div
        ref={ref}
        className={`day-grid relative bg-neutral-900 text-gray-200 rounded-lg border border-neutral-700 overflow-hidden ${
          isTodayDisplayed ? "ring-1 ring-yellow-400/30" : ""
        }`}
      >
        {/* time column */}
        {Array.from({ length: endHour - startHour }, (_, i) => (
          <div
            key={i}
            className="flex justify-end pr-2 text-xs text-gray-400 border-t border-neutral-700 bg-neutral-900 border-r"
            style={{
              gridColumn: 1,
              gridRow: i * slotsPerHour + 1,
              gridRowEnd: (i + 1) * slotsPerHour + 1,
            }}
          >
            <span className="mt-[0.25em]">{startHour + i}:00</span>
          </div>
        ))}

        {/* single day column rendered in slots like week view */}
        {(() => {
          const renderedEvents = new Set();
          const occupiedSlots = new Set();

          return timeSlots.map((slot) => {
            const slotEvents = getEventsForSlot(
              eventsForDay,
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
                for (let i = 1; i < span; i += 1) {
                  occupiedSlots.add(slot.index + i);
                }
                return true;
              }
              return false;
            });

            if (occupiedSlots.has(slot.index) && newEvents.length === 0) {
              return null;
            }

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
                key={`day-${selectedDayIndex}-${slot.index}`}
                className={`day-time-slot border-l border-neutral-800 border-t ${
                  isHourBoundary ? "border-neutral-700" : "border-neutral-800"
                } ${hourBlock % 2 === 0 ? "day-hour-even" : ""}`}
                style={{
                  gridColumn: 2,
                  gridRow: slot.index + 1,
                  gridRowEnd: `span ${maxSpan}`,
                }}
              >
                {newEvents.length > 0 && (
                  <div className="day-event-container">
                    {newEvents.map((ev, idx) => {
                      const uniqueKey = `day-${selectedDayIndex}-${ev.id}-${ev.start}-${ev.end}-${ev.room}-${idx}`;
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
        })()}

        {isTodayDisplayed ? (
          <div className="pointer-events-none absolute right-3 top-3 z-30 text-xs bg-yellow-400 text-black px-2 py-0.5 rounded">
            Dzisiaj
          </div>
        ) : null}
      </div>
    </div>
  );
});

export default DayView;
