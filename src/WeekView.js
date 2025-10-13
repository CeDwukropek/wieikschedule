import React from "react";
import EventCard from "./EventCard";
import { timeToMinutes } from "./utils";

export default function WeekView({
  events,
  activeParity,
  setWeekParity,
  currentParity,
  nextParity,
  currentRange,
  nextRange,
  open,
}) {
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

  function groupOverlapping(events) {
    const sorted = [...events].sort(
      (a, b) => toMinutes(a.start) - toMinutes(b.start)
    );
    const groups = [];

    sorted.forEach((ev) => {
      let placed = false;
      for (const group of groups) {
        if (
          group.some(
            (g) =>
              toMinutes(ev.start) < toMinutes(g.end) &&
              toMinutes(ev.end) > toMinutes(g.start)
          )
        ) {
          group.push(ev);
          placed = true;
          break;
        }
      }
      if (!placed) groups.push([ev]);
    });

    groups.forEach((group) =>
      group.sort((a, b) => toMinutes(a.start) - toMinutes(b.start))
    );

    return groups;
  }

  return (
    <div className="overflow-x-auto w-full">
      {/* responsive CSS: desktop -> normal week fits, mobile -> each day min = viewport-width - time column */}
      <style>{`
        .week-grid {
          display: grid;
          overflow: hidden;
          grid-auto-rows: min-content;
          color: #e5e7eb;      /* matches text-gray-200 */
          border-left: 1px solid rgba(148,163,184,0.08);
          border-right: 1px solid rgba(148,163,184,0.08);
          border-bottom: 1px solid rgba(148,163,184,0.08);
          border-radius: 0.5rem;
          box-shadow: 0 10px 15px -3px rgba(2,6,23,0.6);
          overflow-y: auto;
          /* desktop default: modest min per day so whole week fits */
          grid-template-columns: 60px repeat(5, minmax(160px, 1fr));
        }
        /* on small screens make each day at least viewport width minus time column */
        @media (max-width: 768px) {
          .week-grid {
            grid-template-columns: 60px repeat(5, minmax(calc(100vw - 60px), 1fr));
            min-width: calc(60px + (100vw - 60px) * 5);
          }
        }
      `}</style>

      <div className="week-grid">
        {/* Nagłówki Dni */}
        {dayNames.map((name, dayIndex) => (
          <div
            key={dayIndex}
            className={`top-0 z-10 py-2 border-b border-neutral-700 bg-neutral-800 text-center text-sm font-semibold ${
              dayIndex === 0 ? "col-start-2" : ""
            }`}
            style={{ gridColumn: dayIndex + 2 }} // Od 2. kolumny
          >
            {name}
          </div>
        ))}

        {/* Pusty róg nad kolumną czasu */}
        <div
          className="sticky top-0 z-10 bg-neutral-900 border-r border-b border-neutral-700"
          style={{ gridColumn: 1 }}
        />

        {/* Kolumna Czasu */}
        <div className="flex flex-col" style={{ gridRow: 2, gridColumn: 1 }}>
          {Array.from({ length: endHour - startHour }, (_, i) => (
            <div
              key={i}
              className="h-16 flex justify-end pr-2 text-xs text-gray-400 border-t border-neutral-700"
            >
              <span className="mt-[0.25em]">{startHour + i}:00</span>
            </div>
          ))}
        </div>

        {/* Tło Siatki Czasowej i Wydarzenia */}
        {days.map((day) => {
          const dayEvents = events.filter((e) => e.day === day);
          const groups = groupOverlapping(dayEvents);

          return (
            <div
              key={day}
              className="relative border-l border-neutral-800"
              style={{ gridRow: 2, gridColumn: day + 2 }}
            >
              {Array.from({ length: totalSlots }, (_, i) => (
                <div
                  key={i}
                  className={`h-4 border-t ${
                    i % 4 === 0 ? "border-neutral-700" : "border-neutral-800"
                  }`}
                />
              ))}

              {groups.map((group, gi) => {
                const width = 100 / group.length;

                return group.map((ev, ei) => {
                  const startM = toMinutes(ev.start);
                  const endM = toMinutes(ev.end);

                  const top = ((startM - startHour * 60) / slotMinutes) * 16;
                  const height = ((endM - startM) / slotMinutes) * 16;
                  const left = ei * width;
                  const uniqueKey = `${gi}-${ei}-${ev.id}-${ev.start}-${ev.end}-${ev.room}`;

                  return (
                    <div
                      key={uniqueKey}
                      className="absolute px-0.5"
                      style={{
                        top: `${top}px`,
                        left: `${left}%`,
                        width: `${width}%`,
                        height: `${height}px`,
                        zIndex: 10 + ei,
                      }}
                    >
                      <EventCard ev={ev} />
                    </div>
                  );
                });
              })}
            </div>
          );
        })}
      </div>
      {/* Mobile-only bottom bar: this week / next week */}
      {!open && (
        <div className="sm:hidden fixed left-4 right-4 bottom-4 z-50 flex items-center gap-2 bg-neutral-900/90 backdrop-blur-md border border-neutral-800 rounded-full px-2 py-2 shadow-lg">
          <button
            onClick={() => setWeekParity && setWeekParity(currentParity)}
            className={`flex-1 text-sm px-3 py-2 rounded truncate ${
              activeParity === currentParity
                ? "bg-neutral-800 text-white"
                : "bg-neutral-900 text-gray-300"
            }`}
          >
            {currentRange}
          </button>

          <button
            onClick={() => setWeekParity && setWeekParity(nextParity)}
            className={`flex-1 text-sm px-3 py-2 rounded truncate ${
              activeParity === nextParity
                ? "bg-neutral-800 text-white"
                : "bg-neutral-900 text-gray-300"
            }`}
          >
            {nextRange}
          </button>
        </div>
      )}
    </div>
  );
}
