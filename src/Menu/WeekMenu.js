export function WeekMenu({
  activeParity,
  setWeekParity,
  currentParity,
  nextParity,
  currentRange,
  nextRange,
  onPrevWeek,
  onCurrentWeek,
  onNextWeek,
  disablePrevWeek,
  disableNextWeek,
}) {
  return (
    <>
      <button
        onClick={() => {
          if (onPrevWeek) {
            onPrevWeek();
            return;
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
        className={`flex-1 text-sm px-3 py-2 rounded truncate ${
          activeParity === currentParity
            ? "bg-neutral-800 text-white"
            : "bg-neutral-900 text-gray-300"
        }`}
      >
        Current
        <br></br>
        <span className="text-[0.75rem]">{currentRange}</span>
      </button>

      <button
        onClick={() => {
          if (onNextWeek) {
            onNextWeek();
            return;
          }
          if (setWeekParity) setWeekParity(nextParity);
        }}
        disabled={Boolean(disableNextWeek)}
        className={`flex-1 text-sm px-3 py-2 rounded truncate ${
          disableNextWeek
            ? "bg-neutral-900 text-gray-500 cursor-not-allowed"
            : "bg-neutral-900 text-gray-300"
        }`}
      >
        Next
        <br></br>
        <span className="text-[0.75rem]">{nextRange}</span>
      </button>
    </>
  );
}
