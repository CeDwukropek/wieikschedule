import React, { useState, useEffect, useCallback, useRef } from "react";
import { Calendar, List, Eye, EyeOff } from "lucide-react";
import { timetableData } from "./timetable";
import GroupInput from "./GroupInput";
import WeekView from "./View/WeekView";
import DayView from "./View/DayView";
import FloatingMenu from "./Menu/FloatingMenu";
import { timeToMinutes } from "./utils";
import FAQ from "./FAQ";
import { exportICS } from "./exportICS";
import { ExportPngBtn } from "./ExportPngBtn";

const { SCHEDULE } = timetableData;

export default function Timetable() {
  const exportRef = useRef(null);
  const [open, setOpen] = useState(false);
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
  const CACHE_TTL = 1000 * 60 * 60 * 24 * 60; // 60 days in ms

  const computeFiltered = useCallback(function computeFiltered(
    schedule,
    groups,
    hideLectures,
    parity, // "odd" | "even" | "all"
    showAll
  ) {
    // 1) Predykat parzystości skompilowany raz
    const passParity =
      parity === "odd"
        ? (e) => e.weeks !== "even"
        : parity === "even"
        ? (e) => e.weeks !== "odd"
        : () => true; // "all" → nic nie odrzucamy

    // 2) Zestaw wybranych grup (O(1) membership)
    const groupSet = new Set(
      [groups?.C, groups?.L, groups?.Lek, groups?.Lk].filter(Boolean)
    );

    // 3) Cache na zamianę "HH:MM" → minuty (unikamy powtórzeń)
    const minutesCache = new Map();
    const getMin = (hhmm) => {
      let v = minutesCache.get(hhmm);
      if (v == null) {
        v = timeToMinutes(hhmm);
        minutesCache.set(hhmm, v);
      }
      return v;
    };

    // 4) Jedno przejście: filtrujemy i zbieramy w tablicę
    const out = [];
    for (const ev of schedule) {
      if (!passParity(ev)) continue;

      // ukryj wykłady, jeśli proszono
      if (hideLectures && isLecture(ev)) continue;

      // wykłady zawsze przepuszczamy (jeśli nie są ukryte)
      if (!isLecture(ev)) {
        // jeśli nie "pokaż wszystko", filtruj po grupach
        if (!showAll) {
          const matchesGroup =
            Array.isArray(ev.groups) && ev.groups.some((g) => groupSet.has(g));
          if (!matchesGroup) continue;
        }
      }

      out.push(ev);
    }

    // 5) Sort: dzień → start → opcjonalnie id (stabilizacja)
    out.sort(
      (a, b) =>
        a.day - b.day ||
        getMin(a.start) - getMin(b.start) ||
        (a.id ?? 0) - (b.id ?? 0)
    );

    return out;
  }, []);

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
    showAll,
    computeFiltered,
    CACHE_KEY,
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
    // Zwraca "dd.mm", np. "06.10" — zawsze po polsku
    const dt = new Date(d);
    if (Number.isNaN(dt)) return ""; // ochrona na złe dane

    try {
      return dt.toLocaleDateString("pl-PL", {
        day: "2-digit",
        month: "2-digit",
      });
    } catch {
      // Fallback niezależny od locale
      const dd = String(dt.getDate()).padStart(2, "0");
      const mm = String(dt.getMonth() + 1).padStart(2, "0");
      return `${dd}.${mm}`;
    }
  }

  const today = React.useMemo(() => new Date(), []);
  const thisWeekStart = weekStart(today);
  const thisWeekEnd = new Date(thisWeekStart);
  thisWeekEnd.setDate(thisWeekEnd.getDate() + 6);
  const nextWeekStart = new Date(thisWeekStart);
  nextWeekStart.setDate(nextWeekStart.getDate() + 7);
  const nextWeekEnd = new Date(nextWeekStart);
  nextWeekEnd.setDate(nextWeekEnd.getDate() + 6);

  const currentParity = getISOWeekNumber(today) % 2 === 0 ? "even" : "odd";
  const nextParity = currentParity === "even" ? "odd" : "even";
  const currentRange = `${formatDate(thisWeekStart)} - ${formatDate(
    thisWeekEnd
  )}`;
  const nextRange = `${formatDate(nextWeekStart)} - ${formatDate(nextWeekEnd)}`;
  // --- end helpers ---

  // build combined options used by DayView and BottomDayNav
  const combinedOptions = React.useMemo(() => {
    const names = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek"];
    return ["current", "next"].flatMap((parityToken) => {
      const base = (function () {
        const ws = (function (date) {
          const d = new Date(date);
          const day = d.getDay();
          const diff = (day === 0 ? -6 : 1) - day;
          d.setDate(d.getDate() + diff);
          d.setHours(0, 0, 0, 0);
          return d;
        })(today);
        if (parityToken === "next") {
          const n = new Date(ws);
          n.setDate(n.getDate() + 7);
          return n;
        }
        return ws;
      })();

      return names.map((n, i) => {
        const d = new Date(base);
        d.setDate(d.getDate() + i);
        return {
          value: `${parityToken}:${i}`,
          label: `${n}`,
          date: `${formatDate(d)}`,
        };
      });
    });
  }, [today]);

  // controlled selection for DayView / BottomDayNav
  const defaultDayIndex = Math.min(Math.max((today.getDay() + 6) % 7, 0), 4);
  const [selection, setSelection] = useState(`current:${defaultDayIndex}`);

  // events for DayView should depend on the selection's parity token (current|next)
  const dayEvents = React.useMemo(() => {
    try {
      const parts = (selection || "current:0").split(":");
      const selParityToken = parts[0];
      const parityToUse =
        selParityToken === "current" ? currentParity : nextParity;
      return computeFiltered(
        SCHEDULE,
        studentGroups,
        hideLectures,
        parityToUse,
        showAll
      );
    } catch (e) {
      return filtered;
    }
  }, [
    selection,
    computeFiltered,
    studentGroups,
    hideLectures,
    showAll,
    currentParity,
    nextParity,
    filtered,
  ]);

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      {/* --- Kontrolki --- */}
      {/* hidden on mobile, visible on sm and up */}
      <div className="hidden sm:flex flex-wrap items-center gap-3 mb-6">
        <button
          onClick={() => setViewMode("week")}
          className="ds-btn"
          data-active={viewMode === "week"}
        >
          <Calendar className="w-4 h-4" /> Tydzień
        </button>
        <button
          onClick={() => setViewMode("day")}
          className="ds-btn"
          data-active={viewMode === "day"}
        >
          <List className="w-4 h-4" /> Dzień
        </button>

        <button
          onClick={() => setHideLectures(!hideLectures)}
          className="ds-btn"
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
          className="ds-btn"
          data-active={showAll}
        >
          {showAll ? "Twój plan" : "Pokaż cały plan"}
        </button>
        <button
          className="ds-btn"
          // w App.js, przy kliknięciu Export ICS
          onClick={() => {
            const dataForICS = computeFiltered(
              SCHEDULE,
              studentGroups,
              hideLectures,
              "all", // ⬅️ klucz: ignorujemy parzystość
              showAll
            );
            exportICS(dataForICS);
          }}
        >
          Export ICS
        </button>
        <ExportPngBtn
          viewMode={viewMode}
          exportRef={exportRef}
          weekParity={weekParity}
          currentParity={currentParity}
          currentRange={currentRange}
          nextRange={nextRange}
          nextParity={nextParity}
          selection={selection}
          combinedOptions={combinedOptions}
        />
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
      {/* --- Current period bar: auto parity + next week --- */}

      <div className="hidden sm:block gap-3 items-center mb-4 ">
        {viewMode === "week" ? (
          <>
            <button
              onClick={() => setWeekParity(currentParity)}
              className="ds-btn"
              data-active={weekParity === currentParity}
            >
              {currentRange}
            </button>

            <button
              onClick={() => setWeekParity(nextParity)}
              className="ds-btn"
              data-active={weekParity === nextParity}
              style={{ marginLeft: '0.75rem' }}
            >
              {nextRange}
            </button>
          </>
        ) : null}
      </div>

      {/* Floating menu / settings (bottom-right) */}

      <FloatingMenu
        viewMode={viewMode}
        setViewMode={setViewMode}
        setWeekParity={setWeekParity}
        hideLectures={hideLectures}
        setHideLectures={setHideLectures}
        showAll={showAll}
        setShowAll={setShowAll}
        studentGroups={studentGroups}
        setStudentGroups={setStudentGroups}
        handleGroupChange={handleGroupChange}
        activeParity={weekParity}
        currentParity={currentParity}
        currentRange={currentRange}
        nextRange={nextRange}
        nextParity={nextParity}
        filtered={filtered}
        open={open}
        setOpen={setOpen}
        options={combinedOptions}
        selection={selection}
        onChange={setSelection}
        ref={exportRef}
        weekParity={weekParity}
        computeFiltered={computeFiltered}
        SCHEDULE={SCHEDULE}
      />
      {/* --- Widok planu --- */}
      {viewMode === "week" ? (
        <WeekView
          key={`week-${weekParity}`}
          events={filtered}
          ref={exportRef}
        />
      ) : (
        <DayView
          key={`day-${selection}`}
          events={dayEvents}
          // parity/date helpers from App so DayView can show ranges and switch parity
          currentParity={currentParity}
          nextParity={nextParity}
          currentRange={currentRange}
          nextRange={nextRange}
          setWeekParity={setWeekParity}
          // control selection externally so BottomDayNav drives it
          options={combinedOptions}
          selection={selection}
          onSelectionChange={setSelection}
          ref={exportRef}
        />
      )}
      <FAQ />
    </div>
  );
}
