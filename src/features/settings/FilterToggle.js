export const FilterToggle = ({ pressed, onToggle, icon, label }) => {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      className={`h-9 w-9 flex justify-center items-center rounded-full border border-neutral-800 ${pressed ? "bg-neutral-700" : "bg-neutral-900"} hover:bg-neutral-600 transition-all`}
      onClick={onToggle}
    >
      {icon}
    </button>
  );
};
