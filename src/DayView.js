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
  // optional external control
  options: externalOptions,
  selection: externalSelection,
  onSelectionChange: externalOnSelectionChange,
}) {
  const startHour = 7;
  const endHour = 20;
  const slotMinutes = 15;
  const totalSlots = (endHour - startHour) * (60 / slotMinutes);

  const dayNamesFull = React.useMemo(
    () => ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek"],
    []
  );
  const today = React.useMemo(() => new Date(), []);

  // weekStart logic is handled inside combinedOptions useMemo

  function formatDate(d) {
    return d.toLocaleDateString();
  }

  // default selected day index (clamped to 0..4) - used to detect "today"
  const defaultDayIndex = useMemo(
    () => Math.min(Math.max((today.getDay() + 6) % 7, 0), 4),
    [today]
  );

  // selection can be controlled externally via props.selection (value: "parity:dayIndex")
  const defaultSelection = `current:${defaultDayIndex}`;
  const [internalSelection, setInternalSelection] = useState(defaultSelection);
  const selection = externalSelection ?? internalSelection;

  // helper logic for week start lives inside combinedOptions useMemo

  // build combined options: use externalOptions when provided otherwise compute locally
  // build combined options: use externalOptions when provided otherwise compute locally
  const combinedOptions = useMemo(() => {
    if (externalOptions) return externalOptions;
    return ["current", "next"].flatMap((parityToken) => {
      const base = (function baseWeekStartFor(parityToken) {
        const ws = (function weekStartLocal(date) {
          const d = new Date(date);
          const day = d.getDay();
          const diff = (day === 0 ? -6 : 1) - day;
          d.setDate(d.getDate() + diff);
          d.setHours(0, 0, 0, 0);
          return d;
        })(today);
        if (parityToken === "next") {
          const n = new Date(ws);
          n.setDate(n.getDate() + 7);
          return n;
        }
        return ws;
      })(parityToken);

      return dayNamesFull.map((name, i) => {
        const d = new Date(base);
        d.setDate(d.getDate() + i);
        const parityLabel =
          parityToken === "current"
            ? currentParity === "even"
              ? "Even"
              : "Odd"
            : nextParity === "even"
            ? "Even"
            : "Odd";
        return {
          value: `${parityToken}:${i}`,
          label: `${parityLabel} • ${name} • ${formatDate(d)}`,
        };
      });
    });
  }, [externalOptions, currentParity, nextParity, dayNamesFull, today]);

  // parse selection into parityToken and selectedDay
  const [selParity, selDay] = selection.split(":");
  const selectedDayIndex = Number(selDay);

  // notify parent about selection change
  function handleSelectionChange(val) {
    if (externalOnSelectionChange) {
      externalOnSelectionChange(val);
    } else {
      setInternalSelection(val);
    }
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
