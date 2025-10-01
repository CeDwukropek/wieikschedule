import { MapPin, Users, Tag } from "lucide-react";
import { timetableData } from "./timetable";
const { SUBJECTS } = timetableData;

export default function EventCard({ ev }) {
  const subj = SUBJECTS[ev.subj] ||
    SUBJECTS[ev.title] || { name: ev.title || ev.subj, color: "bg-gray-600" };

  const colorBg = subj.color || "bg-gray-600";
  const colorText = colorBg.replace(/^bg-/, "text-");

  return (
    <div className="w-full h-full flex overflow-hidden bg-neutral-800 shadow-sm rounded-md">
      <div className={`${colorBg} w-2 shrink-0`} />

      <div className="flex-1 p-2 flex flex-col">
        <div className={`${colorText} text-sm font-semibold`}>{subj.name}</div>

        <div className="text-xs text-gray-200 mt-1 flex flex-wrap gap-2 items-center">
          {ev.room ? (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 opacity-80" />
              <span>{ev.room}</span>
            </div>
          ) : null}

          {ev.groups?.length && ev.type !== "Wykład" ? (
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 opacity-80" />
              <span>{ev.groups.join(", ")}</span>
            </div>
          ) : null}

          {ev.type ? (
            <div className="flex items-center gap-1">
              <Tag className="w-3 h-3 opacity-80" />
              <span>{ev.type}</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
