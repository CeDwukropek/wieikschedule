import React from "react";
import GroupInput from "./GroupInput";

export default function GroupFiltersPanel({
  groupConfigs,
  studentGroups,
  onGroupChange,
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

    </div>
  );
}
