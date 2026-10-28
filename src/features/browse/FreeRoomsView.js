import { useMemo, useState } from "react";
import { toIsoDate } from "../../utils/date";
import { useNow } from "../schedule/hooks/useNow";
import { minutesOfDay } from "../schedule/logic/timeMarks";
import { timeToMinutes } from "../../utils/time";
import { freeRooms, isRoom, minutesLabel, roomKey, cleanRoom } from "./browseLogic";
import "./browse.css";

const DAY_NAMES = ["Pon.", "Wt.", "Śr.", "Czw.", "Pt.", "Sob.", "Nd."];
const span = ([start, end]) => `${minutesLabel(start)}–${minutesLabel(end)}`;

// Rooms free at a chosen day and time, from the classes of all plans in the app.
export default function FreeRoomsView({ rows, rooms, weekStart, initialDay, loading, error, onRetry, onOpenRoom }) {
  const now = useNow();
  const [day, setDay] = useState(initialDay);
  const date = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + day);
  const iso = toIsoDate(date);
  const isToday = iso === toIsoDate(now);
  const [time, setTime] = useState(null);
  const shownTime = time || (isToday ? minutesLabel(Math.min(Math.max(minutesOfDay(now), 7 * 60), 21 * 60 + 59)) : "08:00");
  const minute = timeToMinutes(shownTime);
  // Rooms of the directory, plus any in this week's classes the directory does not know yet.
  const known = useMemo(() => {
    const map = new Map((rooms || []).map(room => [room.key, room]));
    for (const row of rows) {
      const label = cleanRoom(row.room);
      if (label && !map.has(roomKey(label))) map.set(roomKey(label), { key: roomKey(label), label });
    }
    return [...map.values()].filter(room => isRoom(room.label));
  }, [rooms, rows]);
  const list = useMemo(() => freeRooms(rows, known, iso, minute), [rows, known, iso, minute]);
  const free = list.filter(room => room.now), taken = list.filter(room => !room.now);

  return (
    <section className="free-rooms" aria-label="Wolne sale">
      <div className="free-rooms-controls">
        <div className="free-rooms-days" role="group" aria-label="Dzień">
          {DAY_NAMES.map((name, index) => {
            const value = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + index);
            return <button key={name} type="button" aria-pressed={day === index} onClick={() => setDay(index)}>
              {name} <small>{value.toLocaleDateString("pl-PL", { day: "numeric", month: "numeric" })}</small>
            </button>;
          })}
        </div>
        <label className="free-rooms-time">Godzina
          <input type="time" value={shownTime} step={300} min="07:00" max="21:59" onChange={event => setTime(event.target.value || null)} />
        </label>
        {time && isToday && <button type="button" className="free-rooms-now" onClick={() => setTime(null)}>Teraz</button>}
      </div>
      <p className="free-rooms-note">Sale z zajęć wszystkich planów w aplikacji. Sala może być zajęta przez zajęcia spoza nich, rezerwacje lub egzaminy.</p>
      {error ? <p role="alert">{error} <button type="button" className="underline" onClick={onRetry}>Spróbuj ponownie</button></p>
        : loading ? <p role="status">Wczytywanie zajęć wszystkich planów…</p>
        : <div className="free-rooms-lists">
          <div>
            <h3>Wolne o {shownTime} <span>({free.length})</span></h3>
            <ul>{free.map(room => <li key={room.key}>
              <button type="button" onClick={() => onOpenRoom(room)} aria-label={`${room.label}: wolna do ${minutesLabel(room.now[1])}. Pokaż plan sali`}>
                <strong>{room.label}</strong>
                <span>{room.now[1] >= 22 * 60 ? "wolna do końca dnia" : `wolna do ${minutesLabel(room.now[1])}`}</span>
                {!room.classes && <small>bez zajęć tego dnia</small>}
              </button>
            </li>)}</ul>
          </div>
          <div>
            <h3>Zajęte <span>({taken.length})</span></h3>
            <ul>{taken.map(room => <li key={room.key}>
              <button type="button" onClick={() => onOpenRoom(room)} aria-label={`${room.label}: zajęta. Pokaż plan sali`}>
                <strong>{room.label}</strong>
                <span>{room.busyUntil ? `zajęta do ${minutesLabel(room.busyUntil)}` : "zajęta"}</span>
                <small>{room.next ? `potem wolna ${span(room.next)}` : "do końca dnia zajęta"}</small>
              </button>
            </li>)}</ul>
          </div>
        </div>}
    </section>
  );
}
