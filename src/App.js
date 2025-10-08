import { useState, useEffect } from "react";
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

  // --- cached filtered events (persisted to localStorage, 60 days TTL) ---
  const CACHE_KEY = `wieikschedule.${getUserId()}.cachedFiltered`;
  const CACHE_TTL = 1000 * 60 * 60 * 24 * 30 * 6; // 6 months in ms

  function computeFiltered(
    schedule,
    groups,
    hideLecturesFlag,
    parity,
    showAllFlag
  ) {
    return schedule
      .filter((ev) => {
        if (ev.weeks === "odd" && parity !== "odd") return false;
        if (ev.weeks === "even" && parity !== "even") return false;
        if (hideLecturesFlag && isLecture(ev)) return false;
        if (isLecture(ev)) return true;
        if (showAllFlag) return true;
        return ev.groups.some(
          (g) =>
            g === groups.C ||
            g === groups.L ||
            g === groups.Lek ||
            g === groups.Lk
        );
      })
      .sort((a, b) => {
        if (a.day !== b.day) return a.day - b.day;
        return timeToMinutes(a.start) - timeToMinutes(b.start);
      });
  }

  const [filtered, setFiltered] = useState(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          parsed?.ts &&
          Date.now() - parsed.ts < CACHE_TTL &&
          Array.isArray(parsed.data)
        ) {
          return parsed.data;
        }
      }
    } catch (e) {}
    return computeFiltered(
      SCHEDULE,
      studentGroups,
      hideLectures,
      weekParity,
      showAll
    );
  });

  useEffect(() => {
    const res = computeFiltered(
      SCHEDULE,
      studentGroups,
      hideLectures,
      weekParity,
      showAll
    );
    setFiltered(res);
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ ts: Date.now(), data: res })
      );
    } catch (e) {}
  }, [
    studentGroups,
    hideLectures,
    weekParity,
    showAll /* CACHE_KEY intentionally not included */,
  ]);

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

  // --- week / period helpers (auto parity + date ranges) ---
  function getISOWeekNumber(d) {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  }

  function weekStart(date) {
    const d = new Date(date);
    const day = d.getDay(); // 0 (Sun) .. 6
    const diff = (day === 0 ? -6 : 1) - day; // shift to Monday
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function formatDate(d) {
    return d.toLocaleDateString();
  }

  const today = new Date();
  const thisWeekStart = weekStart(today);
  const thisWeekEnd = new Date(thisWeekStart);
  thisWeekEnd.setDate(thisWeekEnd.getDate() + 6);
  const nextWeekStart = new Date(thisWeekStart);
  nextWeekStart.setDate(nextWeekStart.getDate() + 7);
  const nextWeekEnd = new Date(nextWeekStart);
  nextWeekEnd.setDate(nextWeekEnd.getDate() + 6);

  const currentParity = getISOWeekNumber(today) % 2 === 0 ? "even" : "odd";
  const nextParity = currentParity === "even" ? "odd" : "even";
  const currentRange = `${formatDate(thisWeekStart)} — ${formatDate(
    thisWeekEnd
  )}`;
  const nextRange = `${formatDate(nextWeekStart)} — ${formatDate(nextWeekEnd)}`;
  // --- end helpers ---

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

      {/* --- Current period bar: auto parity + next week --- */}
      <div className="flex gap-3 items-center mb-4">
        <button
          onClick={() => setWeekParity(currentParity)}
          className={`px-3 py-1 rounded text-sm ${
            weekParity === currentParity
              ? "bg-neutral-800"
              : "bg-neutral-900 text-gray-300"
          }`}
        >
          {currentParity === "even" ? "Even week" : "Odd week"} • {currentRange}
        </button>

        <button
          onClick={() => setWeekParity(nextParity)}
          className={`px-3 py-1 rounded text-sm ${
            weekParity === nextParity
              ? "bg-neutral-800"
              : "bg-neutral-900 text-gray-300"
          }`}
        >
          {nextParity === "even" ? "Even week" : "Odd week"} • {nextRange}
        </button>
      </div>

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
