export default function FloatingSelectionPanel({
  open,
  isChatMode,
  selectionTab,
  setSelectionTab,
  setViewMode,
  options = [],
  selection,
  onChange,
  currentDayValue,
  dayActiveRef,
  weekOptions = [],
  weekSelectionValue,
  onWeekChange,
  weekActiveRef,
  setSelectionOpen,
}) {
  if (!open || isChatMode) return null;

  return (
    <div className="fixed bottom-28 left-1/2 z-[190] w-[min(92vw,460px)] -translate-x-1/2 rounded-3xl border border-neutral-800 bg-neutral-900/95 shadow-2xl backdrop-blur-xl overflow-hidden">
      <div className="p-3">
        <div className="mb-3 flex rounded-2xl bg-neutral-800 p-1">
          <button
            onClick={() => {
              setSelectionTab("day");
              setViewMode("day");
            }}
            className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition ${
              selectionTab === "day"
                ? "bg-neutral-700 text-white"
                : "text-neutral-400"
            }`}
          >
            Day
          </button>

          <button
            onClick={() => {
              setSelectionTab("week");
              setViewMode("week");
            }}
            className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition ${
              selectionTab === "week"
                ? "bg-neutral-700 text-white"
                : "text-neutral-400"
            }`}
          >
            Week
          </button>
        </div>

        {selectionTab === "day" && options.length > 0 && onChange && (
          <div className="max-h-[50vh] space-y-2 overflow-y-auto pr-1 floating-select-scrollbar">
            {options.map((option) => {
              const active = option.value === selection;
              const isCurrentOption = option.value === currentDayValue;

              return (
                <button
                  key={option.value}
                  ref={active ? dayActiveRef : null}
                  onClick={() => {
                    onChange(option.value);
                    setSelectionOpen(false);
                  }}
                  className={`w-full rounded-2xl px-4 py-3 text-left text-sm transition ${
                    active
                      ? "bg-neutral-700 text-white"
                      : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate">{option.label}</div>
                      <div className="mt-0.5 text-xs text-neutral-400 truncate">
                        {option.date}
                      </div>
                    </div>
                    {isCurrentOption ? (
                      <span className="shrink-0 rounded-full bg-lime-500/20 px-2 py-0.5 text-[11px] font-medium text-lime-300">
                        Teraz
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {selectionTab === "week" && weekOptions.length > 0 && onWeekChange && (
          <div className="max-h-[50vh] space-y-2 overflow-y-auto pr-1 floating-select-scrollbar">
            {weekOptions.map((option) => {
              const active =
                Number(option.value) === Number(weekSelectionValue);
              const isCurrentOption = Number(option.value) === 0;

              return (
                <button
                  key={option.value}
                  ref={active ? weekActiveRef : null}
                  onClick={() => {
                    onWeekChange(Number(option.value));
                    setSelectionOpen(false);
                  }}
                  className={`w-full rounded-2xl px-4 py-3 text-left text-sm transition ${
                    active
                      ? "bg-neutral-700 text-white"
                      : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate">{option.label}</span>
                    {isCurrentOption ? (
                      <span className="shrink-0 rounded-full bg-lime-500/20 px-2 py-0.5 text-[11px] font-medium text-lime-300">
                        Teraz
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
