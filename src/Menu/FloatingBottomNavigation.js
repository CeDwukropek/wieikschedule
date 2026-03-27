import { Menu, X, Calendar, List } from "lucide-react";
import { DayMenu } from "./DayMenu";
import { WeekMenu } from "./WeekMenu";

export function FloatingBottomNavigation({
  viewMode,
  setViewMode,
  options = [],
  selection,
  onChange,
  filtered,
  onPrevWeek,
  onResetWeek,
  onNextWeek,
  viewedWeekRange,
  isCurrentWeek,
  canGoPrevWeek,
  canGoNextWeek,
  open,
  setOpen,
}) {
  return (
    <div className="sm:hidden fixed left-4 right-4 bottom-4 z-50 flex items-center justify-between gap-3 bg-neutral-900/90 backdrop-blur-md border border-neutral-800 rounded-full px-3 py-2 shadow-lg">
      <button
        onClick={() => setViewMode(viewMode === "week" ? "day" : "week")}
        className="w-12 h-12"
      >
        {viewMode === "week" ? (
          <Calendar className="w-6 h-6 inline-block mr-2" />
        ) : (
          <List className="w-6 h-6 inline-block mr-2" />
        )}
      </button>

      {viewMode === "day" && (
        <DayMenu options={options} selection={selection} onChange={onChange} />
      )}

      {viewMode === "week" && (
        <WeekMenu
          events={filtered}
          onPrevWeek={onPrevWeek}
          onResetWeek={onResetWeek}
          onNextWeek={onNextWeek}
          viewedRange={viewedWeekRange}
          isCurrentWeek={isCurrentWeek}
          canGoPrevWeek={canGoPrevWeek}
          canGoNextWeek={canGoNextWeek}
          open={open}
        />
      )}

      <button
        aria-label={open ? "Zamknij menu" : "Otwórz menu"}
        onClick={() => setOpen((s) => !s)}
        className="z-50 flex items-center justify-center w-12 h-12 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white shadow-lg"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>
    </div>
  );
}
