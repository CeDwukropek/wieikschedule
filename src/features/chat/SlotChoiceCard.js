import { addMinutes, normalizeTime } from "../../utils/time";
import React from "react";

function formatDate(dateValue) {
  const raw = String(dateValue || "").trim();
  const date = new Date(`${raw}T12:00:00`);
  if (Number.isNaN(date.getTime())) return raw;

  return date.toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function SlotChoiceCard({
  slot,
  isAdding,
  isAdded,
  error,
  onAdd,
}) {
  const start = normalizeTime(slot?.start_time);
  const end = addMinutes(slot?.start_time, slot?.duration_min);
  const title = [slot?.subject, slot?.type].filter(Boolean).join(" - ");
  const hasEventId = Boolean(String(slot?.event_id || "").trim());

  let buttonLabel = "Dodaj do mojego planu";
  if (isAdded) buttonLabel = "Dodano";
  if (!hasEventId) buttonLabel = "Brak event_id";

  const isDisabled = isAdding || isAdded || !hasEventId;

  return (
    <div className="rounded-xl border border-neutral-700 bg-neutral-900/80 p-3 space-y-2">
      <div className="text-sm font-medium text-white">
        [{formatDate(slot?.date)}, {start}
        {end ? `-${end}` : ""}]
      </div>

      {title ? <div className="text-sm text-neutral-100">{title}</div> : null}

      <div className="text-xs text-neutral-300 space-y-1">
        {slot?.room ? <div>Sala: {slot.room}</div> : null}
        {slot?.group ? <div>Grupa: {slot.group}</div> : null}
        {slot?.instructor ? <div>Prowadzacy: {slot.instructor}</div> : null}
      </div>

      <button
        type="button"
        disabled={isDisabled}
        onClick={() => onAdd?.(slot)}
        className={`mt-1 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
          isDisabled
            ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
            : "bg-sky-500 hover:bg-sky-400 text-white"
        }`}
      >
        {isAdding ? "Dodawanie..." : buttonLabel}
      </button>

      {error ? <div className="text-xs text-rose-300">{error}</div> : null}
      {!hasEventId ? (
        <div className="text-xs text-amber-300">
          Ten slot nie ma event_id i nie moze zostac dodany.
        </div>
      ) : null}
    </div>
  );
}
