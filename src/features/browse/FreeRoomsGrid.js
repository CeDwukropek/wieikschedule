import { minutesLabel } from "./browseLogic";

const FROM = 7 * 60, TO = 22 * 60, SPAN = TO - FROM;
const at = minute => `${((minute - FROM) / SPAN) * 100}%`;

// Rooms side by side (grouped by building) with their classes on a day; empty space is free time.
// The line marks the chosen time; rooms free then have a green name.
export default function FreeRoomsGrid({ rooms, classesByRoom, minute, freeNow, onOpenRoom }) {
  const groups = [];
  rooms.forEach((room, index) => {
    const last = groups[groups.length - 1];
    if (last?.building.id === room.building.id) last.count += 1;
    else groups.push({ building: room.building, start: index, count: 1 });
  });
  const firstOfGroup = new Set(groups.map(group => group.start));
  const line = minute >= FROM && minute <= TO ? at(minute) : null;
  return (
    <div className="rooms-grid-scroll" role="region" aria-label="Siatka sal" tabIndex={0}>
      <div className="rooms-grid" style={{ "--rooms": rooms.length }}>
        <div className="rooms-grid-corner" style={{ gridColumn: 1, gridRow: "1 / 3" }} />
        {groups.map(group => <div key={group.building.id} className="rooms-grid-building"
          style={{ gridColumn: `${group.start + 2} / span ${group.count}`, gridRow: 1 }} title={group.building.name}>{group.building.short}</div>)}
        {rooms.map((room, index) => <button key={room.key} type="button" className="rooms-grid-room" data-free={freeNow.has(room.key) || undefined}
          data-first={firstOfGroup.has(index) || undefined} style={{ gridColumn: index + 2, gridRow: 2 }} onClick={() => onOpenRoom(room)}
          aria-label={`${room.label}${freeNow.has(room.key) ? ", wolna" : ", zajęta"} o ${minutesLabel(minute)}. Pokaż plan sali`}>{room.label}</button>)}
        <div className="rooms-grid-hours" style={{ gridColumn: 1, gridRow: 3 }} aria-hidden="true">
          {Array.from({ length: SPAN / 60 }, (_, hour) => <span key={hour} style={{ top: at(FROM + hour * 60) }}>{7 + hour}:00</span>)}
          {line && <i className="rooms-grid-line" style={{ top: line }} />}
        </div>
        {rooms.map((room, index) => <div key={room.key} className="rooms-grid-column" data-first={firstOfGroup.has(index) || undefined}
          style={{ gridColumn: index + 2, gridRow: 3 }}>
          {(classesByRoom.get(room.key) || []).map(item => <div key={`${item.start}-${item.subject}`} className="rooms-grid-class"
            style={{ top: at(Math.max(item.start, FROM)), height: `calc(${((Math.min(item.end, TO) - Math.max(item.start, FROM)) / SPAN) * 100}% - 2px)` }}
            title={`${minutesLabel(item.start)}–${minutesLabel(item.end)} ${item.subject}${item.type ? `, ${item.type}` : ""}${item.audience ? `, ${item.audience}` : ""}${item.teacher ? `, ${item.teacher}` : ""}`}>
            <span>{minutesLabel(item.start)}–{minutesLabel(item.end)}</span>
            <strong>{item.subject}</strong>
          </div>)}
          {line && <i className="rooms-grid-line" style={{ top: line }} />}
        </div>)}
      </div>
    </div>
  );
}
