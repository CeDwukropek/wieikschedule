import { useState } from "react";

const ITEMS = [
  {
    q: "How do I save my group inputs?",
    a: "Group inputs are saved per browser profile automatically. They persist across refreshes for 60 days.",
  },
  {
    q: "How is week parity determined?",
    a: "Parity is detected automatically using the ISO week number. You can override it with the buttons in the period bar or from the mobile menu.",
  },
  {
    q: "Why some subject colours are not visible?",
    a: "Colors provided as Tailwind classes require those classes to be present in the build. Use hex color values in timetable data if you want reliable colours without changing Tailwind config.",
  },
  {
    q: "How do I report broken or duplicate events?",
    a: "Edit your source timetable data (src/timetable.js). Make sure each event has a unique id to avoid rendering duplicates.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <section className="mt-8 pt-6 border-t border-neutral-800 text-gray-200">
      <h2 className="text-lg font-semibold mb-3">FAL</h2>

      <div className="space-y-2">
        {ITEMS.map((it, i) => {
          const isOpen = open === i;
          return (
            <div key={i} className="bg-neutral-900 rounded-md overflow-hidden">
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
                aria-expanded={isOpen}
              >
                <span className="font-medium">{it.q}</span>
                <span className="text-sm text-gray-400">
                  {isOpen ? "−" : "+"}
                </span>
              </button>

              {isOpen ? (
                <div className="px-4 pb-3 text-sm text-gray-300">{it.a}</div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
