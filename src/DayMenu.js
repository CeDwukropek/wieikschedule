import { ChevronLeft, ChevronRight } from "lucide-react";

export function DayMenu({ options = [], selection, onChange }) {
  if (!options || options.length === 0) return null;

  const idx = options.findIndex((o) => o.value === selection);
  const currentIndex = idx === -1 ? 0 : idx;

  function prev() {
    const nextIndex = (currentIndex - 1 + options.length) % options.length;
    onChange(options[nextIndex].value);
  }

  function next() {
    const nextIndex = (currentIndex + 1) % options.length;
    onChange(options[nextIndex].value);
  }

  const label = options[currentIndex]?.label || "";
  return (
    <>
      <button
        aria-label="Previous day"
        onClick={prev}
        className="p-2 rounded-full bg-neutral-800 text-gray-200 hover:bg-neutral-700"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex-1 text-center text-sm text-gray-200 truncate px-2">
        {label}
      </div>

      <button
        aria-label="Next day"
        onClick={next}
        className="p-2 rounded-full bg-neutral-800 text-gray-200 hover:bg-neutral-700"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </>
  );
}
