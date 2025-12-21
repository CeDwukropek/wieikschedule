import { MapPin, Users, Tag, Clock } from "lucide-react";
import { timetableData } from "./timetable";
const { SUBJECTS } = timetableData;

export default function EventCard({ ev }) {
  const subj = SUBJECTS[ev.subj] || SUBJECTS[ev.title] || { name: ev.title || ev.subj, color: "bg-gray-600" };
  const colorBg = subj.color || "bg-gray-600";
  const colorText = colorBg.replace(/^bg-/, "text-");

  return (
    <div className="ds-card w-full h-full overflow-hidden">
      <div className={`${colorBg} w-1 shrink-0`} />

      <div className="flex-1 p-2 flex flex-col gap-1" style={{ minWidth: 0 }}>
        <div className={`ds-title ${colorText}`} title={subj.name}>
          {subj.name}
        </div>

        <div className="ds-row">
          {ev.start && ev.end ? (
            <span className="ds-chip" title={`${ev.start} - ${ev.end}`}>
              <Clock className="icon" />
              <span className="text">{ev.start} - {ev.end}</span>
            </span>
          ) : null}

          {ev.room ? (
            <span className="ds-chip" title={ev.room}>
              <MapPin className="icon" />
              <span className="text">{ev.room}</span>
            </span>
          ) : null}

          {ev.groups?.length && ev.type !== "Wykład" ? (
            <span className="ds-chip" title={ev.groups.join(", ")}>
              <Users className="icon" />
              <span className="text">{ev.groups.join(", ")}</span>
            </span>
          ) : null}

          {ev.type ? (
            <span className="ds-chip" title={ev.type}>
              <Tag className="icon" />
              <span className="text">{ev.type}</span>
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
