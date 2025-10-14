export function WeekMenu({
  activeParity,
  setWeekParity,
  currentParity,
  nextParity,
  currentRange,
  nextRange,
}) {
  console.log("activeParity :>> ", activeParity);
  console.log("currentParity :>> ", currentParity);
  return (
    <>
      <button
        onClick={() => setWeekParity && setWeekParity(currentParity)}
        className={`flex-1 text-sm px-3 py-2 rounded truncate ${
          activeParity === currentParity
            ? "bg-neutral-800 text-white"
            : "bg-neutral-900 text-gray-300"
        }`}
      >
        {currentRange}
      </button>

      <button
        onClick={() => setWeekParity && setWeekParity(nextParity)}
        className={`flex-1 text-sm px-3 py-2 rounded truncate ${
          activeParity === nextParity
            ? "bg-neutral-800 text-white"
            : "bg-neutral-900 text-gray-300"
        }`}
      >
        {nextRange}
      </button>
    </>
  );
}
