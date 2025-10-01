import { MapPin, Users, Tag, Clock } from "lucide-react";
import { timetableData } from "./timetable";

const { SUBJECTS } = timetableData;

export default function Tooltip({ ev }) {
  const subj = SUBJECTS[ev.subj] ||
    SUBJECTS[ev.title] || { name: ev.title || ev.subj, color: "bg-gray-600" };

  const colorBg = subj.color || "bg-gray-600";
  const colorText = colorBg.replace(/^bg-/, "text-");
  return (
    <div className="absolute top-[-20px] w-[300px] bg-gray-800 text-[0.7rem] p-1 shadow-lg rounded z-[999999]">
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
  );
}
