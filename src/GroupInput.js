import React from "react";

export default function GroupInput({ label, type, value, onChange }) {
  return (
    <div>
      <label className="block text-xs ds-muted mb-1">{label}</label>
      <input
        type="number"
        min={type === "Lek" ? "0" : "1"}
        value={String(value ?? "").replace(/\D/g, "")}
        onChange={(e) => onChange(type, e.target.value)}
        className="ds-input"
      />
    </div>
  );
}
