import { Check } from "lucide-react";

export default function DateSelectionPanel({
  open, isWeek, options = [], selection, onChange, currentDayValue,
  dayActiveRef, weekOptions = [], weekSelectionValue, onWeekChange,
  weekActiveRef, onClose,
}) {
  const items = isWeek ? weekOptions : options;
  const selected = isWeek ? weekSelectionValue : selection;
  const activeRef = isWeek ? weekActiveRef : dayActiveRef;
  const handleKeyDown = (event) => {
    const buttons = [...event.currentTarget.querySelectorAll("button")];
    const index = buttons.indexOf(document.activeElement);
    let next;
    if (event.key === "ArrowDown") next = Math.min(index + 1, buttons.length - 1);
    if (event.key === "ArrowUp") next = Math.max(index - 1, 0);
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = buttons.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      buttons[next]?.focus();
    }
  };
  return (
    <div className={`dock-selection-reveal ${open ? "is-open" : ""}`} inert={!open ? true : undefined} aria-hidden={!open}>
      <div className="dock-selection-clip">
        <div id="dock-date-options" className="dock-selection floating-select-scrollbar" role="group"
          aria-label={isWeek ? "Wybierz tydzień" : "Wybierz dzień"} onKeyDown={handleKeyDown}>
          {items.length === 0 && <p className="dock-selection-empty">Brak dostępnych dat</p>}
          {items.map((option) => {
            const active = String(option.value) === String(selected);
            const current = isWeek ? Number(option.value) === 0 : option.value === currentDayValue;
            return (
              <button key={option.value} type="button" ref={active ? activeRef : null}
                className={`dock-date-option ${active ? "is-selected" : ""}`}
                aria-current={active ? "date" : undefined}
                onClick={() => {
                  if (isWeek) onWeekChange?.(Number(option.value));
                  else onChange?.(option.value);
                  onClose();
                }}>
                <span>
                  <span>{option.label}</span>
                  {!isWeek && <small>{option.date}</small>}
                </span>
                {active ? <Check size={16} aria-hidden="true" /> : current ? <span className="dock-option-dot" aria-label="Bieżący okres" /> : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
