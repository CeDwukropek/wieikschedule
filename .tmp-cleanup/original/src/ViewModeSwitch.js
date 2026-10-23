import React from "react";
import { Calendar, List } from "lucide-react";

export default function ViewModeSwitch({ viewMode, onToggle }) {
  const isDay = viewMode === "day";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDay}
      aria-label="Przełącz widok tydzień/dzień"
      onClick={onToggle}
      className="relative h-9 w-24 rounded-full border border-neutral-800 bg-neutral-900"
      title={isDay ? "Przełącz na tydzień" : "Przełącz na dzień"}
    >
      <span className="absolute inset-1">
        <span
          className={`absolute inset-y-0 left-0 w-1/2 rounded-full bg-neutral-700 transition-transform duration-200 ${
            isDay ? "translate-x-full" : "translate-x-0"
          }`}
        />
      </span>

      <span className="absolute inset-0 z-10 flex h-full pointer-events-none">
        <span className="h-full w-1/2 flex items-center justify-center">
          <Calendar
            className={`w-4 h-4 transition-colors ${
              !isDay ? "text-white" : "text-gray-500"
            }`}
          />
        </span>
        <span className="h-full w-1/2 flex items-center justify-center">
          <List
            className={`w-4 h-4 transition-colors ${
              isDay ? "text-white" : "text-gray-500"
            }`}
          />
        </span>
      </span>
    </button>
  );
}
