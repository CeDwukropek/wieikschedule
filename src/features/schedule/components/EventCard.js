import { MapPin, Users, Clock, UserRound, Tag } from "lucide-react";
import { useState } from "react";
import { splitTeacherDisplay } from "../logic/teacherDisplay";
import { shortDate } from "../../my-plan/planEditing";
import { kindOf } from "../../plan-items/planItemLogic";

// "→ czw 23.10 12:00" for the slot a class was moved from.
function movedToLabel(ev) {
  return ev?.movedTo ? `→ ${shortDate(ev.movedTo.date)} ${String(ev.movedTo.start_time).slice(0, 5)}` : "";
}
const GHOST_LABELS = { cancelled: "Odwołane u mnie", "moved-from": "Przeniesione" };

const EVENT_TINT_BY_BG_CLASS = {
  "bg-indigo-900": "rgba(49, 46, 129, 0.1)",
  "bg-sky-500": "rgba(14, 165, 233, 0.1)",
  "bg-purple-800": "rgba(107, 33, 168, 0.1)",
  "bg-emerald-700": "rgba(4, 120, 87, 0.1)",
  "bg-purple-600": "rgba(147, 51, 234, 0.1)",
  "bg-pink-600": "rgba(219, 39, 119, 0.1)",
  "bg-green-600": "rgba(22, 163, 74, 0.1)",
  "bg-red-800": "rgba(153, 27, 27, 0.2)",
  "bg-orange-600": "rgba(234, 88, 12, 0.1)",
  "bg-cyan-600": "rgba(8, 145, 178, 0.1)",
  "bg-amber-600": "rgba(217, 119, 6, 0.1)",
  "bg-teal-600": "rgba(13, 148, 136, 0.1)",
  "bg-fuchsia-700": "rgba(162, 28, 175, 0.1)",
  "bg-gray-600": "rgba(75, 85, 99, 0.1)",
};

export function eventSubject(ev, subjects = {}) {
  return subjects[ev.subj] || subjects[ev.title] || {
    name: ev.title || ev.subj,
    color: 'bg-gray-600',
  };
}

function shortType(type = '') {
  const value = type.toLowerCase();
  if (value.includes('wyk')) return 'Wyk.';
  if (value.includes('lab')) return 'Lab.';
  if (value.includes('ćw') || value.includes('cw')) return 'Ćw.';
  if (value.includes('lekt')) return 'Lek.';
  if (value.includes('projekt')) return 'Proj.';
  return type;
}

// Marks of the plan entries (kolokwium, deadline, …) that belong to this class.
function EntryMarks({ entries, compact }) {
  if (!entries?.length) return null;
  return <span className="week-event-entries">
    {entries.map(item => <span key={item.id} className="week-event-entry" style={{ "--kind": kindOf(item).color }}
      data-draft={item.draft || undefined} title={`${item.draft ? "Szkic — " : ""}${kindOf(item).label}: ${item.title}`}>{item.state === "review" ? "⚠ " : ""}{compact ? kindOf(item).short : `${kindOf(item).label}: ${item.title}`}</span>)}
  </span>;
}
const entriesLabel = ev => ev.entries?.length ? `, ${ev.entries.map(item => `${kindOf(item).label}: ${item.title}`).join(", ")}` : "";

export default function EventCard({
  ev,
  subjects = {},
  onRemoveAddedEvent,
  removingAddedEventId,
  compact = false,
  onOpenDetails,
}) {
  const [removeError, setRemoveError] = useState("");

  const subj = eventSubject(ev, subjects);

  const teacherLines = splitTeacherDisplay(ev?.teacher);
  const colorBg = subj.color || "bg-gray-600";
  const colorText = colorBg.replace(/^bg-/, "text-");
  const eventTint = EVENT_TINT_BY_BG_CLASS[colorBg] || "rgba(75, 85, 99, 0.1)";
  const isExternal = Boolean(ev?._isExternal && ev?._sourceScheduleId);
  const isAdded = ev?.origin === "added";

  // Eventy pochodzące z "Mój plan" mają origin='added' i posiadają added_event_id,
  // który jest używany do soft-remove w API (/api/my-plan/remove-event).
  const canRemoveAdded =
    isAdded &&
    typeof onRemoveAddedEvent === "function" &&
    Boolean(String(ev?.added_event_id || "").trim());
  const isRemoving =
    canRemoveAdded && removingAddedEventId === ev?.added_event_id;

  // An entry with its own time (or away from its class) is drawn like a class, in the colour of its kind.
  if (ev.planItem) return (
    <button
      type="button"
      className={compact ? "week-event-card" : "w-full h-full flex overflow-hidden text-left week-event-card"}
      style={{ "--kind": kindOf(ev.planItem).color }}
      data-entry
      data-review={ev.planItem.state === "review" || undefined}
      data-draft={ev.planItem.draft || undefined}
      onClick={() => onOpenDetails?.(ev)}
      aria-haspopup="dialog"
      aria-label={`${ev.planItem.draft ? "Szkic z podglądu agenta — " : ""}${kindOf(ev.planItem).label}: ${ev.title}, ${ev.start}–${ev.end}${ev.planItem.subject ? `, ${ev.planItem.subject}` : ""}${ev.planItem.state === "review" ? ", do sprawdzenia" : ""}. Pokaż szczegóły`}
    >
      <span className="week-event-content">
        <span className="week-event-time">
          <span>{ev.start}<span className="week-event-end">–{ev.end}</span></span>
          <span className="week-event-kind">{kindOf(ev.planItem).short}</span>
        </span>
        <span className="week-event-title">{ev.title}</span>
      </span>
    </button>
  );

  if (compact) return (
    <button
      type="button"
      className={`week-event-card ${ev.__optimistic === 'adding' ? 'event-card-optimistic' : ''}`}
      style={{ backgroundColor: eventTint }}
      onClick={() => onOpenDetails?.(ev)}
      aria-label={`${ev.ghost ? GHOST_LABELS[ev.ghost] + ': ' : ''}${subj.name}, ${ev.type || 'zajęcia'}, ${ev.start}–${ev.end}${ev.ghost === 'moved-from' ? ' ' + movedToLabel(ev) : ''}${ev.groups?.length ? ', ' + ev.groups.join(', ') : ''}${entriesLabel(ev)}. Pokaż szczegóły`}
      aria-haspopup="dialog"
      data-added={isAdded || undefined}
      data-modified={(!ev.ghost && ev.personal_override) || undefined}
      data-ghost={ev.ghost || undefined}
    >
      <span className={`week-event-color ${colorBg}`} aria-hidden="true" />
      <span className="week-event-content">
        <span className="week-event-time">
          <span>{ev.start}<span className="week-event-end">–{ev.end}</span></span>
          <span className="week-event-kind">{shortType(ev.type)}</span>
          <span className="week-event-room">{ev.ghost === 'moved-from' ? movedToLabel(ev) : ev.room}</span>
        </span>
        <span className="week-event-title">{subj.name}</span>
        <EntryMarks entries={ev.entries} compact />
      </span>
    </button>
  );

  const handleRemoveClick = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!canRemoveAdded) return;

    setRemoveError("");

    try {
      await onRemoveAddedEvent(ev.added_event_id);
    } catch (error) {
      setRemoveError(
        error?.message ||
          "Nie udalo sie usunac tego wydarzenia. Sprobuj ponownie.",
      );
    }
  };

  return (
    <div
      className={`w-full h-full flex overflow-hidden shadow-sm ${
        isExternal ? "border border-amber-400/70" : ""
      } ${ev?.__optimistic === "adding" ? "event-card-optimistic" : ""} ${ev?.ghost ? "day-event-ghost" : ""}`}
      data-ghost={ev?.ghost || undefined}
      style={{ backgroundColor: eventTint }}
    >
      <div className={`${colorBg} w-1 shrink-0`} />

      <div className="flex-1 p-2 flex flex-col">
        <div className={`${colorText} text-[0.7rem] font-semibold ${ev?.ghost === "cancelled" ? "line-through" : ""}`}>
          {subj.name}
        </div>

        <EntryMarks entries={ev.entries} />

        {ev?.ghost ? (
          <div className="mt-1 inline-flex w-fit items-center rounded bg-neutral-700/60 px-1.5 py-0.5 text-[10px] font-medium text-neutral-200">
            {GHOST_LABELS[ev.ghost]}{ev.ghost === "moved-from" ? ` ${movedToLabel(ev)}` : ""}
          </div>
        ) : null}

        {isExternal ? (
          <div className="mt-1 inline-flex w-fit items-center rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-medium text-amber-200">
            {ev._sourceScheduleId}
          </div>
        ) : null}

        {isAdded ? (
          <div className="mt-1 flex flex-wrap items-center gap-1">
            <div className="inline-flex w-fit items-center rounded bg-sky-500/20 px-1.5 py-0.5 text-[10px] font-medium text-sky-200">
              Odrobienie
            </div>

            {canRemoveAdded ? (
              <button
                type="button"
                onClick={handleRemoveClick}
                disabled={isRemoving}
                className={`inline-flex w-fit items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${
                  isRemoving
                    ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                    : "bg-rose-500/20 text-rose-200 hover:bg-rose-500/30"
                }`}
              >
                {isRemoving ? "Usuwanie..." : "Usun z mojego planu"}
              </button>
            ) : null}
          </div>
        ) : null}

        {removeError ? (
          <div className="mt-1 text-[10px] text-rose-300">{removeError}</div>
        ) : null}

        {onOpenDetails && <button type="button" className="mt-1 text-left text-[10px] text-sky-300" aria-haspopup="dialog" onClick={event=>{event.stopPropagation();onOpenDetails(ev);}}>
          Szczegóły i zmiany
        </button>}

        <div className="text-[0.7rem] text-gray-200 mt-1 flex flex-wrap gap-2 items-center">
          {ev.start && ev.end ? (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 opacity-80" />
              <span>
                {ev.start} - {ev.end}
              </span>
            </div>
          ) : null}
          {ev.type ? (
            <div className="flex items-center gap-1">
              <Tag className="w-3 h-3 opacity-80" />
              <span>{ev.type}</span>
            </div>
          ) : null}
          {ev.room ? (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 opacity-80" />
              <span>{ev.room}</span>
            </div>
          ) : null}

          {teacherLines.length ? (
            <div className="flex items-start gap-1">
              <UserRound className="w-3 h-3 opacity-80" />
              <span className="flex flex-col leading-tight">
                {teacherLines.map((teacherLine) => (
                  <span key={teacherLine}>{teacherLine}</span>
                ))}
              </span>
            </div>
          ) : null}

          {ev.groups?.length && ev.type !== "Wykład" ? (
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 opacity-80" />
              <span>{ev.groups.join(", ")}</span>
            </div>
          ) : null}

          
        </div>
      </div>
    </div>
  );
}
