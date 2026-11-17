import { useEffect, useId, useRef, useState } from "react";
import { BookOpen, Calendar, Check, DoorOpen, List, MapPin, UserRound } from "lucide-react";
import { BROWSE_MODES, searchDirectory } from "./browseLogic";
import "./browse.css";

const ICONS = { mine: Calendar, teacher: UserRound, room: MapPin, subject: BookOpen, free: DoorOpen };
// Modes that pick one entry from the directory first: its list, the search's name and an example.
const PICKERS = {
  teacher: { list: "teachers", label: "Szukaj prowadzącego", placeholder: "Nazwisko, np. Pawlik" },
  room: { list: "rooms", label: "Szukaj sali", placeholder: "Sala, np. A3" },
  subject: { list: "subjects", label: "Szukaj przedmiotu", placeholder: "Nazwa, np. Analiza" },
};
export function browseIcon(browse, isWeek) {
  if (browse.mode === "mine") return isWeek ? Calendar : List;
  return ICONS[browse.mode];
}

// What the plan shows (own plan, an instructor, a room, a subject, free rooms) and the week/day layout, in one place.
// A subject is searched in the person's plan (currentPlan) unless they tick all plans.
export default function BrowsePanel({ open, isWeek, onLayout, browse, onBrowse, directory, directoryError, currentPlan, onClose }) {
  const [picking, setPicking] = useState(null);
  const [query, setQuery] = useState("");
  const [allPlans, setAllPlans] = useState(false);
  const inputRef = useRef(null);
  const listId = useId();
  useEffect(() => { if (!open) { setPicking(null); setQuery(""); setAllPlans(false); } }, [open]);
  useEffect(() => { if (picking) inputRef.current?.focus(); }, [picking]);

  const choose = mode => {
    if (PICKERS[mode]) { setPicking(mode); setQuery(""); return; }
    onBrowse({ mode });
    onClose();
  };
  const onePlan = picking === "subject" && currentPlan && !allPlans ? currentPlan : null;
  const all = picking ? directory?.[PICKERS[picking].list] : null;
  const list = all && onePlan ? all.filter(entry => entry.plans?.includes(onePlan)) : all;
  const matches = picking && list ? searchDirectory(list, query) : [];
  const pick = entry => {
    onBrowse({ mode: picking, key: entry.key, label: entry.label, ...(picking === "subject" ? { plan: onePlan } : {}) });
    onClose();
  };

  return (
    <div className={`dock-selection-reveal ${open ? "is-open" : ""}`} inert={!open ? true : undefined} aria-hidden={!open}>
      <div className="dock-selection-clip">
        <div id="dock-browse-options" className="dock-selection browse-panel floating-select-scrollbar" role="group" aria-label="Co oglądasz">
          <div className="browse-layout" role="group" aria-label="Układ">
            {[["week", "Tydzień"], ["day", "Dzień"]].map(([value, label]) => (
              <button key={value} type="button" aria-pressed={isWeek === (value === "week")} onClick={() => onLayout(value)}>{label}</button>
            ))}
          </div>
          {Object.entries(BROWSE_MODES).map(([mode, label]) => {
            const Icon = ICONS[mode];
            const active = browse.mode === mode;
            return (
              <button key={mode} type="button" className={`dock-date-option ${active ? "is-selected" : ""}`} aria-pressed={active}
                aria-expanded={PICKERS[mode] ? picking === mode : undefined} onClick={() => choose(mode)}>
                <span className="browse-option">
                  <Icon size={16} aria-hidden="true" />
                  <span>
                    <span>{label}</span>
                    {active && browse.label && <small>{browse.label}</small>}
                  </span>
                </span>
                {active && <Check size={16} aria-hidden="true" />}
              </button>
            );
          })}
          {picking && <div className="browse-search">
            <input ref={inputRef} value={query} onChange={event => setQuery(event.target.value)} type="search" autoComplete="off"
              aria-label={PICKERS[picking].label} aria-controls={listId} placeholder={PICKERS[picking].placeholder}
              onKeyDown={event => { if (event.key === "Enter" && matches[0]) { event.preventDefault(); pick(matches[0]); } }} />
            {picking === "subject" && currentPlan && <label className="browse-all-plans">
              <input type="checkbox" checked={allPlans} onChange={event => setAllPlans(event.target.checked)} />
              Szukaj we wszystkich planach
            </label>}
            <ul id={listId} aria-label="Wyniki">
              {!directory && !directoryError && <li className="browse-hint">Wczytywanie listy…</li>}
              {directoryError && <li className="browse-hint" role="alert">{directoryError}</li>}
              {list && query.trim() && !matches.length && <li className="browse-hint">Brak wyników.</li>}
              {matches.map(entry => <li key={entry.key}>
                <button type="button" className="dock-date-option" onClick={() => pick(entry)}>{entry.label}</button>
              </li>)}
            </ul>
          </div>}
        </div>
      </div>
    </div>
  );
}
