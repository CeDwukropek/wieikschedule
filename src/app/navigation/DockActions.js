import { CalendarClock, Plus, ShieldCheck } from "lucide-react";

// The second dock row: upcoming entries, the starosta panel and a new entry, each only when available.
export default function DockActions({ actions, hidden }) {
  const { upcoming, starosta, add } = actions || {};
  const shown = [upcoming && "upcoming", starosta && "starosta", add && "add"].filter(Boolean);
  if (!shown.length) return null;
  return (
    <div className={`dock-actions ${hidden ? "is-hidden" : ""}`} style={{ "--dock-actions": shown.length }}
      inert={hidden ? true : undefined} aria-hidden={hidden || undefined} role="group" aria-label="Kolokwia i terminy">
      {upcoming && <button type="button" className="dock-button dock-island dock-action" aria-haspopup="dialog" onClick={upcoming.onOpen}
        aria-label={`Nadchodzące terminy${upcoming.count ? ` (${upcoming.count})` : ""}`} title="Nadchodzące terminy">
        <CalendarClock size={22} aria-hidden="true" />
        {upcoming.count > 0 && <span className="dock-action-count" aria-hidden="true">{upcoming.count}</span>}
      </button>}
      {starosta && <button type="button" className="dock-button dock-island dock-action dock-action-starosta" aria-haspopup="dialog"
        onClick={starosta.onOpen} title="Panel starosty"
        aria-label={`Panel starosty${starosta.count ? ` (${starosta.count} do sprawdzenia)` : ""}`}>
        <ShieldCheck size={22} aria-hidden="true" />
        {starosta.count > 0 && <span className="dock-action-count is-attention" aria-hidden="true">{starosta.count}</span>}
      </button>}
      {add && <button type="button" className="dock-button dock-island dock-action" aria-haspopup="dialog" onClick={add.onOpen}
        aria-label="Dodaj termin" title="Dodaj kolokwium, sprawozdanie lub inny termin">
        <Plus size={24} aria-hidden="true" />
      </button>}
    </div>
  );
}
