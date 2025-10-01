import { useState, useMemo } from "react";
import { Calendar, List, Eye, EyeOff } from "lucide-react";
import { timetableData } from "./timetable"; // <- Twój JSON
import EventCard from "./EventCard";

const { SCHEDULE } = timetableData;

const dayNames = ["Pon", "Wt", "Śr", "Czw", "Pt"];

export default function Timetable() {
  const [viewMode, setViewMode] = useState("week");
  const [weekParity, setWeekParity] = useState("all");
  const [hideLectures, setHideLectures] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const [studentGroups, setStudentGroups] = useState({
    C: "Ć1",
    L: "L1",
    Lek: "Lek1",
    Lk: "Lk1",
  });

  function handleGroupChange(type, number) {
    if (!number) return;
    const prefixes = { C: "Ć", L: "L", Lek: "Lek", Lk: "Lk" };
    setStudentGroups((prev) => ({
      ...prev,
      [type]: prefixes[type] + number,
    }));
  }

  function isLecture(ev) {
    return ev.type?.toLowerCase() === "wykład";
  }

  function matchesStudent(ev, groups) {
    // wykłady widoczne zawsze
    if (isLecture(ev)) return true;

    return (
      showAll ||
      ev.groups.some(
        (g) =>
          g === groups.C ||
          g === groups.L ||
          g === groups.Lek ||
          g === groups.Lk
      )
    );
  }

  const filtered = useMemo(() => {
    return SCHEDULE.filter((ev) => {
      if (ev.weeks === "odd" && weekParity !== "odd") return false;
      if (ev.weeks === "even" && weekParity !== "even") return false;
      if (hideLectures && isLecture(ev)) return false;
      return matchesStudent(ev, studentGroups);
    }).sort((a, b) => {
      if (a.day !== b.day) return a.day - b.day;
      return timeToMinutes(a.start) - timeToMinutes(b.start);
    });
  }, [studentGroups, hideLectures, weekParity, showAll]);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* --- Kontrolki --- */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          onClick={() => setViewMode("week")}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${
            viewMode === "week"
              ? "bg-neutral-800 text-white"
              : "bg-neutral-900 text-gray-400"
          }`}
        >
          <Calendar className="w-4 h-4" /> Tydzień
        </button>
        <button
          onClick={() => setViewMode("day")}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${
            viewMode === "day"
              ? "bg-neutral-800 text-white"
              : "bg-neutral-900 text-gray-400"
          }`}
        >
          <List className="w-4 h-4" /> Dzień
        </button>

        <select
          value={weekParity}
          onChange={(e) => setWeekParity(e.target.value)}
          className="bg-neutral-900 text-gray-300 border border-neutral-700 rounded-lg px-2 py-1"
        >
          <option value="all">Wszystkie tygodnie</option>
          <option value="odd">Tygodnie nieparzyste</option>
          <option value="even">Tygodnie parzyste</option>
        </select>

        <button
          onClick={() => setHideLectures(!hideLectures)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-900 text-gray-300"
        >
          {hideLectures ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
          {hideLectures ? "Pokaż wykłady" : "Ukryj wykłady"}
        </button>

        <button
          onClick={() => setShowAll(!showAll)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-900 text-gray-300"
        >
          {showAll ? "Twój plan" : "Pokaż cały plan"}
        </button>
      </div>

      {/* --- Wybór grup --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <GroupInput
          label="Ćwiczenia"
          type="C"
          value={studentGroups.C}
          onChange={handleGroupChange}
        />
        <GroupInput
          label="Laboratoria"
          type="L"
          value={studentGroups.L}
          onChange={handleGroupChange}
        />
        <GroupInput
          label="Lektorat"
          type="Lek"
          value={studentGroups.Lek}
          onChange={handleGroupChange}
        />
        <GroupInput
          label="Lab. komp."
          type="Lk"
          value={studentGroups.Lk}
          onChange={handleGroupChange}
        />
      </div>

      {/* --- Widok planu --- */}
      {viewMode === "week" ? (
        <WeekView events={filtered} />
      ) : (
        <DayView events={filtered} />
      )}
    </div>
  );
}

/* --- Komponenty pomocnicze --- */

function GroupInput({ label, type, value, onChange }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <input
        type="number"
        min="1"
        value={value.replace(/\D/g, "")}
        onChange={(e) => onChange(type, e.target.value)}
        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1 text-white"
      />
    </div>
  );
}

function WeekView({ events }) {
  const startHour = 7;
  const endHour = 20;
  const slots = [];

  for (let h = startHour; h <= endHour; h++) {
    for (let m of [0, 15, 30, 45]) {
      if (h === endHour && m > 0) break;
      const hh = h.toString().padStart(2, "0");
      const mm = m.toString().padStart(2, "0");
      slots.push(`${hh}:${mm}`);
    }
  }

  function timeToIndex(t) {
    const [h, m] = t.split(":").map(Number);
    return (h - startHour) * 4 + m / 15 + 2;
    // +2 bo 1. wiersz = nagłówki dni
  }

  return (
    <div className="overflow-auto border border-neutral-800 rounded-lg">
      <div
        className="grid"
        style={{
          gridTemplateColumns: `80px repeat(${dayNames.length}, 1fr)`,
          gridTemplateRows: `40px repeat(${slots.length}, 30px)`,
          position: "relative",
        }}
      >
        {/* nagłówki dni */}
        <div className="bg-black" style={{ gridColumn: "1", gridRow: "1" }} />
        {dayNames.map((dn, d) => (
          <div
            key={d}
            className="text-center font-semibold py-1 border-l border-neutral-800 bg-neutral-900"
            style={{ gridColumn: d + 2, gridRow: "1" }}
          >
            {dn}
          </div>
        ))}

        {/* godziny w kolumnie */}
        {slots.map((time, i) => (
          <div
            key={i}
            className="text-xs text-gray-500 flex items-start justify-end pr-2 border-b border-neutral-800"
            style={{ gridColumn: "1", gridRow: i + 2 }}
          >
            {time}
          </div>
        ))}

        {/* highlight przerwy obiadowej */}
        <div
          className="bg-red-900/20 col-span-full"
          style={{
            gridColumn: "1 / -1",
            gridRow: `${timeToIndex("12:30")} / ${timeToIndex("13:00")}`,
          }}
        />

        {/* zajęcia */}
        {events.map((ev) => {
          const rowStart = timeToIndex(ev.start);
          const rowEnd = timeToIndex(ev.end);

          return (
            <div
              key={ev.id}
              className="p-0.5"
              style={{
                gridColumn: ev.day + 2,
                gridRow: `${rowStart} / ${rowEnd}`,
              }}
            >
              <EventCard ev={ev} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DayView({ events }) {
  return (
    <div className="space-y-4">
      {events.map((ev) => (
        <EventCard key={ev.id} ev={ev} />
      ))}
    </div>
  );
}

/* --- utils --- */
function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
