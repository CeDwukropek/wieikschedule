import React from "react";

export default function GroupInput({ label, type, value, onChange }) {
  const displayLabel = String(label || type || "Grupa");
  const isLek = type === "Lek";
  const inputValue = isLek
    ? String(value || "").replace(/^Lek/i, "")
    : String(value ?? "").replace(/\D/g, "");

  return (
    <div className="flex flex-col">
      <label className="block text-xs text-gray-400 mb-1">{displayLabel}</label>
      <div className="text-sm text-gray-300 mb-1 flex flex-row items-center bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1">
        {type}{" "}
        <input
          type={isLek ? "text" : "number"}
          min={isLek ? undefined : "1"}
          value={inputValue}
          onChange={(e) => onChange(type, e.target.value)}
          className="w-full bg-transparent outline-none"
          placeholder={isLek ? "1 / N / F" : undefined}
          maxLength={isLek ? 4 : undefined}
        />
      </div>
    </div>
  );
}
