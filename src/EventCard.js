import { MapPin, Users, Clock, UserRound, Tag } from "lucide-react";
import { splitTeacherDisplay } from "./utils";

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

export default function EventCard({ ev, subjects = {} }) {
  const subj = subjects[ev.subj] ||
    subjects[ev.title] || {
      name: ev.title || ev.subj,
      color: "bg-gray-600",
    };

  const teacherLines = splitTeacherDisplay(ev?.teacher);
  const colorBg = subj.color || "bg-gray-600";
  const colorText = colorBg.replace(/^bg-/, "text-");
  const eventTint = EVENT_TINT_BY_BG_CLASS[colorBg] || "rgba(75, 85, 99, 0.1)";

  return (
    <div
      className="w-full h-full flex overflow-hidden shadow-sm"
      style={{ backgroundColor: eventTint }}
    >
      <div className={`${colorBg} w-1 shrink-0`} />

      <div className="flex-1 p-2 flex flex-col">
        <div className={`${colorText} text-[0.7rem] font-semibold`}>
          {subj.name}
        </div>

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

          {/*           {ev.type ? (
            <div className="flex items-center gap-1">
              <Tag className="w-3 h-3 opacity-80" />
              <span>{ev.type}</span>
            </div>
          ) : null} */}
        </div>
      </div>
    </div>
  );
}
