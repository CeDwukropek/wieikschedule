import { useEffect, useId, useRef, useState } from "react";
import { Calendar, Check, DoorOpen, List, MapPin, UserRound } from "lucide-react";
import { BROWSE_MODES, searchDirectory } from "./browseLogic";
import "./browse.css";

const ICONS = { mine: Calendar, teacher: UserRound, room: MapPin, free: DoorOpen };
export function browseIcon(browse, isWeek) {
  if (browse.mode === "mine") return isWeek ? Calendar : List;
  return ICONS[browse.mode];
}

// What the plan shows (own plan, an instructor, a room, free rooms) and the week/day layout, in one place.
export default function BrowsePanel({ open, isWeek, onLayout, browse, onBrowse, directory, directoryError, onClose }) {
  const [picking, setPicking] = useState(null);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const listId = useId();
  useEffect(() => { if (!open) { setPicking(null); setQuery(""); } }, [open]);
  useEffect(() => { if (picking) inputRef.current?.focus(); }, [picking]);

  const choose = mode => {
    if (mode === "teacher" || mode === "room") { setPicking(mode); setQuery(""); return; }
    onBrowse({ mode });
    onClose();
  };
  const list = picking === "teacher" ? directory?.teachers : directory?.rooms;
  const matches = picking && list ? searchDirectory(list, query) : [];
  const pick = entry => { onBrowse({ mode: picking, key: entry.key, label: entry.label }); onClose(); };

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
                aria-expanded={mode === "teacher" || mode === "room" ? picking === mode : undefined} onClick={() => choose(mode)}>
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
              aria-label={picking === "teacher" ? "Szukaj prowadzącego" : "Szukaj sali"} aria-controls={listId}
              placeholder={picking === "teacher" ? "Nazwisko, np. Pawlik" : "Sala, np. A3"}
              onKeyDown={event => { if (event.key === "Enter" && matches[0]) { event.preventDefault(); pick(matches[0]); } }} />
            <ul id={listId} aria-label="Wyniki">
              {!directory && !directoryError && <li className="browse-hint">Wczytywanie listy…</li>}
              {directoryError && <li className="browse-hint" role="alert">{directoryError}</li>}
              {directory && query.trim() && !matches.length && <li className="browse-hint">Brak wyników.</li>}
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
