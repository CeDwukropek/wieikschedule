import React, { useState, useMemo } from "react";
import EventCard from "./EventCard";
import { timeToMinutes } from "./utils";

export default function DayView({
  events,
  currentParity,
  nextParity,
  currentRange,
  nextRange,
  setWeekParity,
}) {
  const startHour = 7;
  const endHour = 20;
  const slotMinutes = 15;
  const totalSlots = (endHour - startHour) * (60 / slotMinutes);

  const dayNamesFull = [
    "Poniedziałek",
    "Wtorek",
    "Środa",
    "Czwartek",
    "Piątek",
  ];
  const today = new Date();

  function weekStart(date) {
    const d = new Date(date);
    const day = d.getDay(); // 0 (Sun)..6
    const diff = (day === 0 ? -6 : 1) - day; // move to Monday
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function formatDate(d) {
    return d.toLocaleDateString();
  }

  // default selected day index (clamped to 0..4) - used to detect "today"
  const defaultDayIndex = useMemo(
    () => Math.min(Math.max((today.getDay() + 6) % 7, 0), 4),
    [today]
  );

  // single select value: "<parity>:<dayIndex>" e.g. "current:1" or "next:3"
  const defaultSelection = `current:${defaultDayIndex}`;
  const [selection, setSelection] = useState(defaultSelection);

  // helper to compute week start for parity token ('current'|'next')
  function baseWeekStartFor(parityToken) {
    const ws = weekStart(today);
    if (parityToken === "next") {
      const n = new Date(ws);
      n.setDate(n.getDate() + 7);
      return n;
    }
    return ws;
  }

  // build combined options: current/next parity × five weekdays with dates
  const combinedOptions = useMemo(() => {
    return ["current", "next"].flatMap((parityToken) => {
      const base = baseWeekStartFor(parityToken);
      return dayNamesFull.map((name, i) => {
        const d = new Date(base);
        d.setDate(d.getDate() + i);
        return {
          value: `${parityToken}:${i}`,
          label: `${name} • ${formatDate(d)}`,
        };
      });
    });
  }, [currentParity, nextParity, dayNamesFull]);

  // parse selection into parityToken and selectedDay
  const [selParity, selDay] = selection.split(":");
  const selectedDayIndex = Number(selDay);

  // notify parent about parity change whenever user picks an option
  function handleSelectionChange(val) {
    setSelection(val);
    const [parityToken] = val.split(":");
    const parityToSet = parityToken === "current" ? currentParity : nextParity;
    if (setWeekParity) setWeekParity(parityToSet);
  }

  function groupOverlapping(eventsForDay) {
    const sorted = [...eventsForDay].sort(
      (a, b) => timeToMinutes(a.start) - timeToMinutes(b.start)
    );
    const groups = [];
    sorted.forEach((ev) => {
      let placed = false;
      for (const group of groups) {
        if (
          group.some(
            (g) =>
              timeToMinutes(ev.start) < timeToMinutes(g.end) &&
              timeToMinutes(ev.end) > timeToMinutes(g.start)
          )
        ) {
          group.push(ev);
          placed = true;
          break;
        }
      }
      if (!placed) groups.push([ev]);
    });
    groups.forEach((g) =>
      g.sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start))
    );
    return groups;
  }

  const eventsForDay = useMemo(
    () => events.filter((e) => e.day === selectedDayIndex),
    [events, selectedDayIndex]
  );
  const groups = useMemo(() => groupOverlapping(eventsForDay), [eventsForDay]);

  // highlight if the displayed day is today and parity is current
  const isTodayDisplayed =
    selParity === "current" && selectedDayIndex === defaultDayIndex;

  return (
    <div>
      <div className="flex gap-3 items-center mb-4">
        <select
          value={selection}
          onChange={(e) => handleSelectionChange(e.target.value)}
          className={`bg-neutral-900 text-gray-300 rounded-lg px-2 py-1 transition-shadow focus:outline-none `}
        >
          {combinedOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div
        className={`grid grid-cols-[60px_1fr] bg-neutral-900 text-gray-200 rounded-lg border border-neutral-700 overflow-hidden ${
          isTodayDisplayed ? "ring-1 ring-yellow-400/30" : ""
        }`}
      >
        {/* time column */}
        <div className="flex flex-col bg-neutral-900 border-r border-neutral-700">
          {Array.from({ length: endHour - startHour }, (_, i) => (
            <div
              key={i}
              className="h-16 flex justify-end pr-2 text-xs text-gray-400 border-t border-neutral-700"
            >
              <span className="">{startHour + i}:00</span>
            </div>
          ))}
        </div>

        {/* day column with grid lines and absolutely-positioned events */}
        <div className="relative min-h-0 min-w-0">
          {isTodayDisplayed ? (
            <div className="absolute right-3 top-3 z-30 text-xs bg-yellow-400 text-black px-2 py-0.5 rounded">
              Dzisiaj
            </div>
          ) : null}

          {Array.from({ length: totalSlots }, (_, i) => (
            <div
              key={i}
              className={`h-4 border-t ${
                i % 4 === 0 ? "border-neutral-700" : "border-neutral-800"
              }`}
            />
          ))}

          {groups.map((group, gi) =>
            group.map((ev, ei) => {
              const startM = timeToMinutes(ev.start);
              const endM = timeToMinutes(ev.end);
              const top = ((startM - startHour * 60) / slotMinutes) * 16;
              const height = ((endM - startM) / slotMinutes) * 16;
              const width = 100 / group.length;
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
            })
          )}
        </div>
      </div>
    </div>
  );
}
