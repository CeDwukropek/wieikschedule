export const HideLectures = ({ val, setVal, icon }) => {
  return (
    <button
      className={`h-9 w-9 flex justify-center items-center rounded-full border border-neutral-800  ${val ? "bg-neutral-700" : "bg-neutral-900"} hover:bg-neutral-600 transition-all`}
      onClick={() => setVal((s) => !s)}
    >
      {icon}
    </button>
  );
};
