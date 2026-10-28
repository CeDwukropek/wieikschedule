import { useMemo, useState } from "react";
import { toIsoDate } from "../../utils/date";
import { useNow } from "../schedule/hooks/useNow";
import { minutesOfDay } from "../schedule/logic/timeMarks";
import { timeToMinutes } from "../../utils/time";
import { freeRooms, isRoom, minutesLabel, roomDay, roomKey, cleanRoom } from "./browseLogic";
import { catalogKey, groupRooms } from "../rooms/roomCatalog";
import { useRoomCatalog } from "../rooms/useRoomCatalog";
import FreeRoomsGrid from "./FreeRoomsGrid";
import "./browse.css";

const DAY_NAMES = ["Pon.", "Wt.", "Śr.", "Czw.", "Pt.", "Sob.", "Nd."];
const span = ([start, end]) => `${minutesLabel(start)}–${minutesLabel(end)}`;
const LAYOUT_KEY = "wieikschedule.freeRoomsLayout";
const readLayout = () => { try { return localStorage.getItem(LAYOUT_KEY) === "grid" ? "grid" : "list"; } catch { return "list"; } };

function RoomCard({ room, minute, onOpenRoom }) {
  if (room.now) return <li><button type="button" onClick={() => onOpenRoom(room)}
    aria-label={`${room.label}: wolna do ${minutesLabel(room.now[1])}. Pokaż plan sali`}>
    <strong>{room.label} <em>{room.building.short}</em></strong>
    <span>{room.now[1] >= 22 * 60 ? "wolna do końca dnia" : `wolna do ${minutesLabel(room.now[1])}`}</span>
    {!room.classes && <small>bez zajęć tego dnia</small>}
  </button></li>;
  return <li><button type="button" onClick={() => onOpenRoom(room)} aria-label={`${room.label}: zajęta. Pokaż plan sali`}>
    <strong>{room.label} <em>{room.building.short}</em></strong>
    <span>{room.busyUntil ? `zajęta do ${minutesLabel(room.busyUntil)}` : "zajęta"}</span>
    <small>{room.next ? `potem wolna ${span(room.next)}` : "do końca dnia zajęta"}</small>
  </button></li>;
}

// Rooms free at a chosen day and time, from the classes of all plans in the app: as a list or a grid,
// for all buildings or one.
export default function FreeRoomsView({ rows, rooms, weekStart, initialDay, loading, error, onRetry, onOpenRoom }) {
  const now = useNow();
  const catalog = useRoomCatalog();
  const [day, setDay] = useState(initialDay);
  const [layout, setLayoutState] = useState(readLayout);
  const setLayout = value => { setLayoutState(value); try { localStorage.setItem(LAYOUT_KEY, value); } catch { /* this visit only */ } };
  const [building, setBuilding] = useState("all");
  const date = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + day);
  const iso = toIsoDate(date);
  const isToday = iso === toIsoDate(now);
  const [time, setTime] = useState(null);
  const shownTime = time || (isToday ? minutesLabel(Math.min(Math.max(minutesOfDay(now), 7 * 60), 21 * 60 + 59)) : "08:00");
  const minute = timeToMinutes(shownTime);
  const keyOf = useMemo(() => key => catalogKey(catalog, key), [catalog]);
  // Rooms of the directory, plus any in this week's classes the directory does not know yet, in their buildings.
  const known = useMemo(() => {
    const map = new Map((rooms || []).map(room => [room.key, room]));
    for (const row of rows) {
      const label = cleanRoom(row.room);
      if (label && !map.has(roomKey(label))) map.set(roomKey(label), { key: roomKey(label), label });
    }
    return groupRooms(catalog, [...map.values()].filter(room => isRoom(room.label)));
  }, [rooms, rows, catalog]);
  const buildings = useMemo(() => [...new Map(known.map(room => [room.building.id, room.building])).values()], [known]);
  const shown = useMemo(() => building === "all" ? known : known.filter(room => room.building.id === building), [known, building]);
  const list = useMemo(() => freeRooms(rows, shown, iso, minute, { keyOf }), [rows, shown, iso, minute, keyOf]);
  const classesByRoom = useMemo(() => roomDay(rows, iso, keyOf), [rows, iso, keyOf]);
  const free = list.filter(room => room.now), taken = list.filter(room => !room.now);
  const freeNow = useMemo(() => new Set(free.map(room => room.key)), [free]);

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
        <div className="free-rooms-layout" role="group" aria-label="Układ">
          {[["list", "Lista"], ["grid", "Siatka"]].map(([value, label]) =>
            <button key={value} type="button" aria-pressed={layout === value} onClick={() => setLayout(value)}>{label}</button>)}
        </div>
      </div>
      {buildings.length > 1 && <div className="free-rooms-buildings" role="group" aria-label="Budynek">
        {[{ id: "all", short: "Wszystkie", name: "Wszystkie budynki" }, ...buildings].map(item =>
          <button key={item.id} type="button" aria-pressed={building === item.id} title={item.name} onClick={() => setBuilding(item.id)}>{item.short}</button>)}
      </div>}
      <p className="free-rooms-note">Sale z zajęć wszystkich planów w aplikacji. Sala może być zajęta przez zajęcia spoza nich, rezerwacje lub egzaminy.
        {buildings.some(item => !item.confirmed) && " Podział na budynki jest wstępny."}</p>
      {error ? <p role="alert">{error} <button type="button" className="underline" onClick={onRetry}>Spróbuj ponownie</button></p>
        : loading ? <p role="status">Wczytywanie zajęć wszystkich planów…</p>
        : layout === "grid" ? <FreeRoomsGrid rooms={shown} classesByRoom={classesByRoom} minute={minute} freeNow={freeNow} onOpenRoom={onOpenRoom} />
        : <div className="free-rooms-lists">
          <div>
            <h3>Wolne o {shownTime} <span>({free.length})</span></h3>
            <ul>{free.map(room => <RoomCard key={room.key} room={room} minute={minute} onOpenRoom={onOpenRoom} />)}</ul>
          </div>
          <div>
            <h3>Zajęte <span>({taken.length})</span></h3>
            <ul>{taken.map(room => <RoomCard key={room.key} room={room} minute={minute} onOpenRoom={onOpenRoom} />)}</ul>
          </div>
        </div>}
    </section>
  );
}
