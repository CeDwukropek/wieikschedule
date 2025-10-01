import React from "react";

export default function GroupInput({ label, type, value, onChange }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <input
        type="number"
        min="1"
        value={value.replace(/\D/g, "")}
        onChange={(e) => onChange(type, e.target.value)}
        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1 text-white"
      />
    </div>
  );
}
