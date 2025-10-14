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
        This week
        <br></br>
        <span className="text-[0.75rem]">{currentRange}</span>
      </button>

      <button
        onClick={() => setWeekParity && setWeekParity(nextParity)}
        className={`flex-1 text-sm px-3 py-2 rounded truncate ${
          activeParity === nextParity
            ? "bg-neutral-800 text-white"
            : "bg-neutral-900 text-gray-300"
        }`}
      >
        Next week
        <br></br>
        <span className="text-[0.75rem]">{nextRange}</span>
      </button>
    </>
  );
}
