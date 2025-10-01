import { useState, useMemo, useEffect } from "react";
import { Calendar, List, Eye, EyeOff } from "lucide-react";
import { timetableData } from "./timetable";
import GroupInput from "./GroupInput";
import WeekView from "./WeekView";
import DayView from "./DayView";
import FloatingMenu from "./FloatingMenu";
import { timeToMinutes } from "./utils";

const { SCHEDULE } = timetableData;

export default function Timetable() {
  // per-browser user id (created once) -> used to namespace storage so it's unique user
  const USER_KEY = "wieikschedule.userId";
  function getUserId() {
    try {
      let id = localStorage.getItem(USER_KEY);
      if (!id) {
        id =
          (typeof crypto !== "undefined" &&
            crypto.randomUUID &&
            crypto.randomUUID()) ||
          `u${Date.now().toString(36)}${Math.random()
            .toString(36)
            .slice(2, 8)}`;
        localStorage.setItem(USER_KEY, id);
      }
      return id;
    } catch (e) {
      return "default";
    }
  }

  // single settings key (namespaced per user) to persist all inputs/settings
  const SETTINGS_KEY = `wieikschedule.${getUserId()}.settings`;

  // load saved settings (if any) on first render
  const saved = (() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  })();

  const [viewMode, setViewMode] = useState(saved?.viewMode ?? "week");
  const [weekParity, setWeekParity] = useState(saved?.weekParity ?? "all");
  const [hideLectures, setHideLectures] = useState(
    saved?.hideLectures ?? false
  );
  const [showAll, setShowAll] = useState(saved?.showAll ?? false);

  const [studentGroups, setStudentGroups] = useState(
    saved?.studentGroups ?? {
      C: "Ć1",
      L: "L1",
      Lek: "Lek1",
      Lk: "Lk1",
    }
  );

  // persist all inputs/settings for this user
  useEffect(() => {
    try {
      const payload = {
        viewMode,
        weekParity,
        hideLectures,
        showAll,
        studentGroups,
      };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(payload));
    } catch (e) {}
  }, [
    viewMode,
    weekParity,
    hideLectures,
    showAll,
    studentGroups,
    SETTINGS_KEY,
  ]);

  function handleGroupChange(type, number) {
    // normalize to digits (allow empty)
    const digits = (number ?? "").toString().replace(/\D/g, "");
    const prefixes = { C: "Ć", L: "L", Lek: "Lek", Lk: "Lk" };
    setStudentGroups((prev) => ({
      ...prev,
      [type]: digits ? prefixes[type] + digits : "",
    }));
  }

  function isLecture(ev) {
    return ev.type?.toLowerCase() === "wykład";
  }

  function matchesStudent(ev, groups) {
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
      {/* hidden on mobile, visible on sm and up */}
      <div className="hidden sm:flex flex-wrap items-center gap-3 mb-6">
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

      {/* --- Wybór grup --- hidden on mobile, visible on sm+ */}
      <div className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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

      {/* Floating menu / settings (bottom-right) */}
      <FloatingMenu
        viewMode={viewMode}
        setViewMode={setViewMode}
        weekParity={weekParity}
        setWeekParity={setWeekParity}
        hideLectures={hideLectures}
        setHideLectures={setHideLectures}
        showAll={showAll}
        setShowAll={setShowAll}
        studentGroups={studentGroups}
        setStudentGroups={setStudentGroups}
        handleGroupChange={handleGroupChange}
      />

      {/* --- Widok planu --- */}
      {viewMode === "week" ? (
        // key causes WeekView to unmount/remount when weekParity changes
        <WeekView key={`week-${weekParity}`} events={filtered} />
      ) : (
        <DayView key={`day-${weekParity}`} events={filtered} />
      )}
    </div>
  );
}
