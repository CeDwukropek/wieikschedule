import {
  Menu,
  X,
  Calendar,
  List,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export function FloatingBottomNavigation({
  viewMode,
  setViewMode,
  options = [],
  selection,
  onChange,

  onPrevWeek,
  onResetWeek,
  onNextWeek,
  viewedWeekRange = "",
  isCurrentWeek = false,
  canGoPrevWeek = true,
  canGoNextWeek = true,

  onPrevDay,
  onResetDay,
  onNextDay,
  currentDayLabel = "",
  isCurrentDay = false,
  canGoPrevDay = true,
  canGoNextDay = true,

  open,
  setOpen,
}) {
  const isWeek = viewMode === "week";

  const label = isWeek ? viewedWeekRange : currentDayLabel;

  const handlePrev = isWeek ? onPrevWeek : onPrevDay;
  const handleReset = isWeek ? onResetWeek : onResetDay;
  const handleNext = isWeek ? onNextWeek : onNextDay;

  const canGoPrev = isWeek ? canGoPrevWeek : canGoPrevDay;
  const canGoNext = isWeek ? canGoNextWeek : canGoNextDay;
  const isCurrent = isWeek ? isCurrentWeek : isCurrentDay;

  return (
    <>
      {open && (
        <div className="sm:hidden fixed bottom-28 z-40 rounded-3xl border border-neutral-800 bg-neutral-900/95 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="p-3">
            <div className="mb-3 flex rounded-2xl bg-neutral-800 p-1">
              <button
                onClick={() => setViewMode("day")}
                className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  viewMode === "day"
                    ? "bg-neutral-700 text-white"
                    : "text-neutral-400"
                }`}
              >
                Day
              </button>

              <button
                onClick={() => setViewMode("week")}
                className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  viewMode === "week"
                    ? "bg-neutral-700 text-white"
                    : "text-neutral-400"
                }`}
              >
                Week
              </button>
            </div>

            {viewMode === "day" && options.length > 0 && onChange && (
              <div className="space-y-2">
                {options.map((option) => {
                  const active = option.value === selection;

                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        onChange(option.value);
                        setOpen(false);
                      }}
                      className={`w-full rounded-2xl px-4 py-3 text-left text-sm transition ${
                        active
                          ? "bg-neutral-700 text-white"
                          : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="sm:hidden fixed inset-x-4 bottom-4 z-50">
        <div className="relative rounded-full border border-neutral-800 bg-neutral-950/95 px-3 py-3 shadow-2xl backdrop-blur-xl">
          <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[100%]">
            <div className="rounded-t-[1rem] border border-neutral-800 bg-neutral-950 px-5 pt-2 text-center text-xs tracking-wide text-neutral-300 shadow-lg border-b-neutral-950">
              {label}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setViewMode(isWeek ? "day" : "week")}
              aria-label={
                isWeek ? "Przełącz na widok dnia" : "Przełącz na widok tygodnia"
              }
              className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-white shadow-lg transition hover:bg-neutral-700 active:scale-95"
            >
              {isWeek ? (
                <Calendar className="h-5 w-5" strokeWidth={2.4} />
              ) : (
                <List className="h-5 w-5" strokeWidth={2.4} />
              )}
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={!canGoPrev}
                aria-label="Poprzedni"
                className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-100 transition hover:bg-neutral-800 active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={2.6} />
              </button>

              <button
                onClick={handleReset}
                aria-label={
                  isCurrent ? "Aktualny okres" : "Przejdź do bieżącego okresu"
                }
                className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-neutral-800 active:scale-95"
              >
                <span
                  className={`h-3 w-3 rounded-full ${
                    isCurrent
                      ? "bg-lime-400 shadow-[0_0_18px_rgba(163,230,53,0.6)]"
                      : "bg-neutral-500"
                  }`}
                />
              </button>

              <button
                onClick={handleNext}
                disabled={!canGoNext}
                aria-label="Następny"
                className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-100 transition hover:bg-neutral-800 active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={2.6} />
              </button>
            </div>

            <button
              aria-label={open ? "Zamknij menu" : "Otwórz menu"}
              onClick={() => setOpen((s) => !s)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-white shadow-lg transition hover:bg-neutral-700 active:scale-95"
            >
              {open ? (
                <X className="h-5 w-5" strokeWidth={2.4} />
              ) : (
                <Menu className="h-5 w-5" strokeWidth={2.4} />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
