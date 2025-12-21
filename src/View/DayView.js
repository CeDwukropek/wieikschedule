import React, { useMemo, forwardRef } from "react";
import EventCard from "../EventCard";
import { timeToMinutes } from "../utils";

const DayView = forwardRef(function DayView(
  { events, selection: externalSelection },
  ref
) {
  const startHour = 7;
  const endHour = 20;
  const slotMinutes = 15;
  const slotsPerHour = 60 / slotMinutes;
  const totalSlots = (endHour - startHour) * slotsPerHour;

  const today = React.useMemo(() => new Date(), []);
  const defaultDayIndex = useMemo(
    () => Math.min(Math.max((today.getDay() + 6) % 7, 0), 4),
    [today]
  );

  const selection = externalSelection;
  const [selParity, selDay] = selection.split(":");
  const selectedDayIndex = Number(selDay);

  function toMinutes(t) {
    return timeToMinutes(t);
  }

  // Create time slots
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

  // Get events that overlap with a slot
  function getEventsForSlot(dayEvents, slotStart, slotEnd) {
    return dayEvents.filter((ev) => {
      const evStart = toMinutes(ev.start);
      const evEnd = toMinutes(ev.end);
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

  const eventsForDay = useMemo(
    () => events.filter((e) => e.day === selectedDayIndex),
    [events, selectedDayIndex]
  );

  const isTodayDisplayed =
    selParity === "current" && selectedDayIndex === defaultDayIndex;

  // EventTooltipWrapper component
  function EventTooltipWrapper({ ev, children }) {
    const wrapperRef = React.useRef(null);
    const tooltipRef = React.useRef(null);
    const [visible, setVisible] = React.useState(false);
    const [pos, setPos] = React.useState("top");
    const [offsetX, setOffsetX] = React.useState(0);
    const longPressTimer = React.useRef(null);

    const positionTooltip = () => {
      const wr = wrapperRef.current?.getBoundingClientRect();
      const tt = tooltipRef.current?.getBoundingClientRect();
      if (!wr || !tt) return;

      const spaceAbove = wr.top;
      const spaceBelow = window.innerHeight - wr.bottom;
      const shouldPlaceTop = spaceAbove >= tt.height + 12 || spaceAbove >= spaceBelow;
      setPos(shouldPlaceTop ? "top" : "bottom");

      const overflowRight = wr.left + tt.width - window.innerWidth;
      let shift = overflowRight > 0 ? -(overflowRight + 8) : 0;
      const minLeftMargin = 8;
      if (wr.left + shift < minLeftMargin) {
        shift = shift + (minLeftMargin - (wr.left + shift));
      }
      setOffsetX(shift);
    };

    const show = () => {
      setVisible(true);
      requestAnimationFrame(positionTooltip);
    };
    const hide = () => {
      setVisible(false);
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    };

    const onMouseEnter = () => show();
    const onMouseLeave = () => hide();
    const onFocus = () => show();
    const onBlur = () => hide();
    const onMouseMove = () => {
      if (visible) positionTooltip();
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") hide();
    };
    const onTouchStart = () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
      longPressTimer.current = setTimeout(() => {
        show();
      }, 400);
    };
    const onTouchEnd = () => hide();
    const onTouchMove = () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    };

    const title = ev.title || ev.subj;
    const groups = Array.isArray(ev.groups) ? ev.groups.join(", ") : ev.groups;
    const transform = `translate(${offsetX}px, ${pos === "top" ? (visible ? "calc(-100% - 6px)" : "-100%") : (visible ? "6px" : "0")})`;

    return (
      <div
        ref={wrapperRef}
        className="event-wrapper"
        tabIndex={0}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onMouseMove={onMouseMove}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onTouchMove={onTouchMove}
      >
        {children}
        <div
          ref={tooltipRef}
          className="event-tooltip"
          data-pos={pos}
          data-visible={visible ? "true" : "false"}
          style={{ transform }}
        >
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
  }

  return (
    <div className="overflow-x-auto w-full">
      <style>{`
        .day-grid {
          display: grid;
          overflow: hidden;
          color: #e5e7eb;
          border-left: 1px solid rgba(148,163,184,0.08);
          border-right: 1px solid rgba(148,163,184,0.08);
          border-bottom: 1px solid rgba(148,163,184,0.08);
          border-radius: 0.5rem;
          box-shadow: 0 10px 15px -3px rgba(2,6,23,0.6);
          overflow-y: auto;
          grid-template-columns: 60px 1fr;
          grid-template-rows: repeat(${totalSlots}, 1rem);
        }
        
        .day-time-slot {
          display: flex;
          gap: 2px;
          padding: 2px;
          min-height: 1rem;
          align-items: flex-start;
        }

        .day-hour-even { background-color: rgba(255,255,255,0.02); }
        
        .day-event-container {
          display: flex;
          flex-direction: row;
          flex: 1;
          min-width: 0;
          gap: 2px;
          width: 100%;
          height: 100%;
        }

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
          opacity: 0;
          pointer-events: none;
          z-index: 50;
          background: #111827;
          border: 1px solid rgba(148,163,184,0.25);
          box-shadow: 0 10px 15px -3px rgba(2,6,23,0.6);
          border-radius: 0.375rem;
          padding: 0.5rem 0.6rem;
          min-width: 220px;
          max-width: 280px;
          color: #e5e7eb;
          font-size: 0.75rem;
          line-height: 1.1rem;
          will-change: transform, opacity;
          transition: opacity 120ms ease, transform 160ms ease;
        }

        .event-tooltip[data-pos="bottom"] { top: calc(100% + 8px); }
        .event-tooltip[data-visible="true"] { opacity: 1; }
        .event-wrapper:hover .event-tooltip,
        .event-wrapper:focus .event-tooltip { opacity: 1; }

        .event-tooltip::after {
          content: "";
          position: absolute;
          left: 14px;
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
        }
        .event-tooltip[data-pos="top"]::after {
          bottom: -6px;
          border-top: 6px solid rgba(148,163,184,0.25);
        }
        .event-tooltip[data-pos="bottom"]::after {
          top: -6px;
          border-bottom: 6px solid rgba(148,163,184,0.25);
        }

        .event-tooltip .row { display: flex; align-items: center; gap: 0.4rem; }
        .event-tooltip .label { opacity: 0.7; }
      `}</style>

      <div className="day-grid" ref={ref}>
        {/* Time column labels - only on hourly rows */}
        {Array.from({ length: endHour - startHour }, (_, i) => (
          <div
            key={i}
            className="sticky left-0 z-10 flex justify-end pr-2 text-xs ds-muted border-t border-neutral-700 bg-neutral-900"
            style={{
              gridColumn: 1,
              gridRow: i * slotsPerHour + 1,
              gridRowEnd: (i + 1) * slotsPerHour + 1
            }}
          >
            <span className="mt-[0.25em]">{startHour + i}:00</span>
          </div>
        ))}

        {/* Day column with time slots */}
        {(() => {
          const renderedEvents = new Set();
          const occupiedSlots = new Set();

          return timeSlots.map((slot) => {
            if (occupiedSlots.has(slot.index)) {
              return null;
            }

            const slotEvents = getEventsForSlot(eventsForDay, slot.slotStart, slot.slotEnd);
            
            const newEvents = slotEvents.filter((ev) => {
              const evStart = toMinutes(ev.start);
              const eventStartsInThisSlot = evStart >= slot.slotStart && evStart < slot.slotEnd;
              const notYetRendered = !renderedEvents.has(ev);
              
              if (eventStartsInThisSlot && notYetRendered) {
                renderedEvents.add(ev);
                const span = getEventSpan(ev);
                for (let i = 1; i < span; i++) {
                  occupiedSlots.add(slot.index + i);
                }
                return true;
              }
              return false;
            });

            const maxSpan = newEvents.length > 0 
              ? Math.max(...newEvents.map((ev) => getEventSpan(ev)))
              : 1;

            const isHourBoundary = slot.index % slotsPerHour === 0;
            const hourBlock = Math.floor(slot.index / slotsPerHour);

            return (
              <div
                key={`slot-${slot.index}`}
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
                      const uniqueKey = `${ev.id}-${ev.start}-${ev.end}-${ev.room}-${idx}`;
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
        })()}

        {/* Today indicator */}
        {isTodayDisplayed && (
          <div
            className="absolute right-3 top-3 z-30 text-xs bg-yellow-400 text-black px-2 py-0.5 rounded"
            style={{ gridColumn: 2, gridRow: 1 }}
          >
            Dzisiaj
          </div>
        )}
      </div>
    </div>
  );
});

export default DayView;
