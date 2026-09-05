import React from "react";
import GroupInput from "./GroupInput";

export default function GroupFiltersPanel({
  groupConfigs,
  studentGroups,
  onGroupChange,
  shouldShowLectoratSelect,
  selectedLectoratSubject,
  onLectoratChange,
  lektoratOptions,
}) {
  return (
    <div>
      <div className="space-y-3">
        {groupConfigs.map((groupConfig) => (
          <GroupInput
            key={groupConfig.type}
            label={groupConfig.label}
            type={groupConfig.type}
            value={studentGroups[groupConfig.type] || ""}
            onChange={onGroupChange}
          />
        ))}
      </div>

      {shouldShowLectoratSelect ? (
        <div className="flex items-center gap-2 mt-4">
          <span className="text-sm text-gray-400">Język lektoratu:</span>
          <select
            value={selectedLectoratSubject}
            onChange={(e) => onLectoratChange(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 text-gray-300 border border-neutral-700 text-sm"
          >
            {lektoratOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}
    </div>
  );
}
