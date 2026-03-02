export function WeekMenu({
  onPrevWeek,
  onResetWeek,
  onNextWeek,
  viewedRange,
  isCurrentWeek,
  canGoPrevWeek,
  canGoNextWeek,
}) {
  return (
    <>
      <button
        onClick={() => {
          if (onPrevWeek) {
            onPrevWeek();
          }
          if (setWeekParity) setWeekParity(currentParity);
        }}
        disabled={Boolean(disablePrevWeek)}
        className={`flex-1 text-sm px-3 py-2 rounded truncate ${
          disablePrevWeek
            ? "bg-neutral-900 text-gray-500 cursor-not-allowed"
            : "bg-neutral-900 text-gray-300"
        }`}
      >
        Prev
        <br></br>
        <span className="text-[0.75rem]">week</span>
      </button>

      <button
        onClick={() => {
          if (onCurrentWeek) {
            onCurrentWeek();
            return;
          }
          if (setWeekParity) setWeekParity(currentParity);
        }}
        disabled={!canGoPrevWeek}
        className={`flex-1 text-sm px-2 py-2 rounded truncate ${
          canGoPrevWeek
            ? "bg-neutral-900 text-gray-300"
            : "bg-neutral-900/50 text-gray-600 cursor-not-allowed"
        }`}
      >
        Prev
      </button>

      <button
        onClick={() => {
          if (onResetWeek) {
            onResetWeek();
          }
          if (setWeekParity) setWeekParity(nextParity);
        }}
        className={`flex-1 text-sm px-2 py-2 rounded truncate ${
          isCurrentWeek
            ? "bg-neutral-800 text-white"
            : "bg-neutral-900 text-gray-300"
        }`}
      >
        <span className="text-[0.75rem]">{viewedRange}</span>
      </button>

      <button
        onClick={() => {
          if (onNextWeek) {
            onNextWeek();
          }
        }}
        disabled={!canGoNextWeek}
        className={`flex-1 text-sm px-2 py-2 rounded truncate ${
          canGoNextWeek
            ? "bg-neutral-900 text-gray-300"
            : "bg-neutral-900/50 text-gray-600 cursor-not-allowed"
        }`}
      >
        Next
      </button>
    </>
  );
}
