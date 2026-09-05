import { useCallback, useEffect, useMemo, useState } from "react";

function fromSettings(settings) {
  return {
    scheduleGroupSets: settings?.scheduleGroupSets && typeof settings.scheduleGroupSets === "object"
      ? settings.scheduleGroupSets : {},
    activeGroupSetBySchedule: settings?.activeGroupSetBySchedule || {},
  };
}

function defaultSet(groups) {
  return { id: "set-1", name: "Zestaw 1", groups, externalSelections: [] };
}

function normalizeGroupValue(type, value, groupConfigs) {
  const raw = String(value ?? "").trim();
  const prefix = groupConfigs.find(group => group.type === type)?.prefix || type;
  const token = raw.toUpperCase().replace(/\s+/g, "").replace(/^LEK/, "");
  if (type === "Lek" && (token === "N" || token === "F")) return `Lek${token}`;
  const digits = raw.replace(/\D/g, "");
  return digits ? `${prefix}${digits}` : "";
}

export function useGroupSets({ savedSettings, currentSchedule, groupConfigs }) {
  const [state, setState] = useState(() => fromSettings(savedSettings));
  useEffect(() => {
    if (savedSettings) setState(fromSettings(savedSettings));
  }, [savedSettings]);

  const defaultGroups = useMemo(() => Object.fromEntries(groupConfigs.map(group =>
    [group.type, `${group.prefix}1`])), [groupConfigs]);
  const sets = state.scheduleGroupSets[currentSchedule]?.sets || [];
  const activeId = state.activeGroupSetBySchedule[currentSchedule] || sets[0]?.id || "set-1";
  const activeSet = sets.find(set => set.id === activeId) || sets[0];
  const studentGroups = activeSet?.groups || defaultGroups;
  const activeExternalSelections = useMemo(() => activeSet?.externalSelections || [], [activeSet]);

  useEffect(() => {
    if (!currentSchedule || !groupConfigs.length) return;
    setState(previous => {
      if (previous.scheduleGroupSets[currentSchedule]?.sets?.length) return previous;
      return {
        scheduleGroupSets: { ...previous.scheduleGroupSets, [currentSchedule]: { sets: [defaultSet(defaultGroups)] } },
        activeGroupSetBySchedule: { ...previous.activeGroupSetBySchedule, [currentSchedule]: "set-1" },
      };
    });
  }, [currentSchedule, groupConfigs, defaultGroups]);

  const updateSets = useCallback(updater => {
    setState(previous => {
      const config = previous.scheduleGroupSets[currentSchedule] || {};
      const currentSets = config.sets || [];
      const id = previous.activeGroupSetBySchedule[currentSchedule] || currentSets[0]?.id || "set-1";
      const next = updater(currentSets, id);
      return {
        scheduleGroupSets: { ...previous.scheduleGroupSets, [currentSchedule]: { ...config, sets: next.sets } },
        activeGroupSetBySchedule: { ...previous.activeGroupSetBySchedule, [currentSchedule]: next.activeId },
      };
    });
  }, [currentSchedule]);

  const updateActiveSet = useCallback(updater => updateSets((currentSets, id) => {
    const available = currentSets.length ? currentSets : [defaultSet(defaultGroups)];
    const targetId = available.some(set => set.id === id) ? id : available[0].id;
    return { sets: available.map(set => set.id === targetId ? updater(set) : set), activeId: targetId };
  }), [updateSets, defaultGroups]);

  const handleGroupChange = useCallback((type, value) => {
    const normalized = normalizeGroupValue(type, value, groupConfigs);
    updateActiveSet(set => ({ ...set, groups: { ...set.groups, [type]: normalized } }));
  }, [groupConfigs, updateActiveSet]);

  const handleGroupSetChange = useCallback(id => updateSets(currentSets => ({
    sets: currentSets, activeId: id,
  })), [updateSets]);

  const handleCreateGroupSet = useCallback(name => {
    const id = `set-${Date.now()}`;
    updateSets((currentSets, currentId) => {
      const source = currentSets.find(set => set.id === currentId) || currentSets[0];
      return {
        activeId: id,
        sets: [...currentSets, {
          id, name: String(name || "").trim() || `Zestaw ${currentSets.length + 1}`,
          groups: { ...(source?.groups || defaultGroups) },
          externalSelections: [...(source?.externalSelections || [])],
        }],
      };
    });
  }, [updateSets, defaultGroups]);

  const handleRenameActiveGroupSet = useCallback(name => updateActiveSet(set => ({
    ...set, name: String(name || "").trim() || set.name,
  })), [updateActiveSet]);

  const handleDeleteActiveGroupSet = useCallback(() => updateSets((currentSets, id) => {
    if (currentSets.length <= 1) return { sets: currentSets, activeId: id };
    const remaining = currentSets.filter(set => set.id !== id);
    return { sets: remaining, activeId: remaining[0].id };
  }), [updateSets]);

  const handleAddExternalSelection = useCallback((scheduleId = "") => {
    const next = {
      id: `ext-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      scheduleId: String(scheduleId || "").trim(), groupType: "", groupValue: "", subjectKey: "",
    };
    updateActiveSet(set => ({ ...set, externalSelections: [...(set.externalSelections || []), next] }));
  }, [updateActiveSet]);

  const handleUpdateExternalSelection = useCallback((selectionId, patch) => {
    if (!selectionId) return;
    updateActiveSet(set => ({ ...set, externalSelections: (set.externalSelections || []).map(item => {
      if (item.id !== selectionId) return item;
      const next = { ...item, ...patch };
      if (Object.prototype.hasOwnProperty.call(patch || {}, "scheduleId")) {
        next.groupType = ""; next.groupValue = ""; next.subjectKey = "";
      }
      if (Object.prototype.hasOwnProperty.call(patch || {}, "groupType")) next.groupValue = "";
      if (Object.prototype.hasOwnProperty.call(patch || {}, "groupValue") ||
          Object.prototype.hasOwnProperty.call(patch || {}, "subjectKey")) {
        next.subjectKey = String(next.subjectKey || "").trim();
      }
      return next;
    }) }));
  }, [updateActiveSet]);

  const handleRemoveExternalSelection = useCallback(id => {
    if (!id) return;
    updateActiveSet(set => ({ ...set, externalSelections: (set.externalSelections || []).filter(item => item.id !== id) }));
  }, [updateActiveSet]);

  return {
    ...state,
    activeGroupSetId: activeSet?.id || activeId,
    activeGroupSetName: activeSet?.name || "Zestaw 1",
    groupSetOptions: sets.map(set => ({ id: set.id, name: set.name })),
    studentGroups, activeExternalSelections,
    handleGroupChange, handleGroupSetChange, handleCreateGroupSet,
    handleRenameActiveGroupSet, handleDeleteActiveGroupSet,
    handleAddExternalSelection, handleUpdateExternalSelection, handleRemoveExternalSelection,
  };
}
