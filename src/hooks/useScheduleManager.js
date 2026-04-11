import { useState, useMemo, useCallback, useEffect } from "react";
import {
  allTimetables,
  defaultTimetable,
  getCachedTimetableById,
  loadTimetableById,
} from "../timetables";

// Build default groups from timetable group configurations
function buildDefaultGroupsForTimetable(timetable) {
  const groups = {};
  if (timetable.groups && Array.isArray(timetable.groups)) {
    timetable.groups.forEach((g) => {
      groups[g.type] = `${g.prefix}1`;
    });
  }
  return groups;
}

// Build initial schedule group sets from saved settings, ensuring a valid structure
function buildInitialScheduleGroupSets(savedSettings) {
  const scheduleGroupSets = savedSettings?.scheduleGroupSets;
  return scheduleGroupSets && typeof scheduleGroupSets === "object"
    ? scheduleGroupSets
    : {};
}

// Generate a default name for a new group set based on the number of existing sets
function buildNextDefaultSetName(sets) {
  return `Zestaw ${Number(sets?.length || 0) + 1}`;
}

export function useScheduleManager(savedSettings) {
  // Resolve the fallback timetable id used during initial load.
  const defaultScheduleId = defaultTimetable?.id || allTimetables[0]?.id || "";

  // Persist currently selected timetable id.
  const [currentSchedule, setCurrentSchedule] = useState(
    savedSettings?.currentSchedule ?? defaultScheduleId,
  );

  // Store all group sets keyed by schedule id.
  const [scheduleGroupSets, setScheduleGroupSets] = useState(() =>
    buildInitialScheduleGroupSets(savedSettings),
  );

  // Track which group set is active for each schedule.
  const [activeGroupSetBySchedule, setActiveGroupSetBySchedule] = useState(
    savedSettings?.activeGroupSetBySchedule ?? {},
  );

  // Keep loaded timetable payloads in-memory to avoid repeated imports.
  const [loadedTimetables, setLoadedTimetables] = useState(() => {
    const initial = {};
    const initialId = savedSettings?.currentSchedule ?? defaultScheduleId;
    if (initialId) {
      const cached = getCachedTimetableById(initialId);
      if (cached) initial[initialId] = cached;
    }
    return initial;
  });

  const [isScheduleLoading, setIsScheduleLoading] = useState(false);

  // Load timetable data when currentSchedule changes, if not already loaded
  useEffect(() => {
    let active = true;
    const targetId = currentSchedule || defaultScheduleId;
    if (!targetId) return () => {};

    if (loadedTimetables[targetId]) return () => {};

    setIsScheduleLoading(true);
    loadTimetableById(targetId)
      .then((timetable) => {
        if (!active || !timetable) return;
        setLoadedTimetables((prev) => {
          if (prev[targetId]) return prev;
          return { ...prev, [targetId]: timetable };
        });
      })
      .finally(() => {
        if (active) setIsScheduleLoading(false);
      });

    return () => {
      active = false;
    };
  }, [currentSchedule, defaultScheduleId, loadedTimetables]);

  // Get current schedule's data - memoized to prevent infinite loops
  const currentTimetable = useMemo(
    () =>
      loadedTimetables[currentSchedule] ||
      loadedTimetables[defaultScheduleId] || {
        id: currentSchedule || defaultScheduleId,
        name: currentSchedule || defaultScheduleId,
        schedule: [],
        subjects: {},
        groups: [],
        minDate: null,
        maxDate: null,
      },
    [loadedTimetables, currentSchedule, defaultScheduleId],
  );

  // Build default groups for the current timetable - memoized to prevent infinite loops
  const defaultGroups = useMemo(
    () => buildDefaultGroupsForTimetable(currentTimetable),
    [currentTimetable],
  );

  const currentGroupSets = useMemo(
    () => scheduleGroupSets[currentSchedule]?.sets || [],
    [scheduleGroupSets, currentSchedule],
  );

  // Pick active set id or fall back to the first available/default set id.
  const activeGroupSetId = useMemo(() => {
    return (
      activeGroupSetBySchedule[currentSchedule] ||
      currentGroupSets[0]?.id ||
      "set-1"
    );
  }, [activeGroupSetBySchedule, currentSchedule, currentGroupSets]);

  // Resolve the full active set object from the current schedule.
  const activeGroupSet = useMemo(
    () => currentGroupSets.find((set) => set.id === activeGroupSetId),
    [currentGroupSets, activeGroupSetId],
  );

  const activeExternalSelections = useMemo(
    () => activeGroupSet?.externalSelections || [],
    [activeGroupSet],
  );

  // Expose a stable active set name for UI controls.
  const activeGroupSetName = useMemo(
    () => activeGroupSet?.name || "Zestaw 1",
    [activeGroupSet],
  );

  // Current group selections used to filter schedule events.
  const studentGroups = useMemo(
    () => activeGroupSet?.groups || defaultGroups,
    [activeGroupSet, defaultGroups],
  );

  // Flatten active groups by schedule for persistence/export consumers.
  const scheduleGroups = useMemo(() => {
    const mapped = {};
    Object.entries(scheduleGroupSets).forEach(([scheduleId, config]) => {
      const sets = config?.sets || [];
      const activeId = activeGroupSetBySchedule[scheduleId] || sets[0]?.id;
      const activeSet = sets.find((set) => set.id === activeId) || sets[0];
      mapped[scheduleId] = activeSet?.groups || {};
    });
    return mapped;
  }, [scheduleGroupSets, activeGroupSetBySchedule]);

  // Expose schedule entries for view rendering.
  const schedule = useMemo(() => currentTimetable.schedule, [currentTimetable]);

  // Expose subject dictionary used by cards, tooltips and exports.
  const subjects = useMemo(
    () => currentTimetable.subjects || {},
    [currentTimetable],
  );

  // Get group configs for the current schedule
  const groupConfigs = useMemo(
    () => currentTimetable.groups || [],
    [currentTimetable],
  );

  // Initialize a default group set for schedules that do not have one yet.
  useEffect(() => {
    if (!currentSchedule || !currentTimetable?.groups?.length) return;
    setScheduleGroupSets((prev) => {
      if (prev[currentSchedule]?.sets?.length) return prev;
      return {
        ...prev,
        [currentSchedule]: {
          sets: [
            {
              id: "set-1",
              name: "Zestaw 1",
              groups: buildDefaultGroupsForTimetable(currentTimetable),
              externalSelections: [],
            },
          ],
        },
      };
    });

    setActiveGroupSetBySchedule((prev) => {
      if (prev[currentSchedule]) return prev;
      return {
        ...prev,
        [currentSchedule]: "set-1",
      };
    });
  }, [currentSchedule, currentTimetable]);

  useEffect(() => {
    let active = true;
    const referencedScheduleIds = Array.from(
      new Set(
        (activeExternalSelections || [])
          .map((item) => String(item?.scheduleId || "").trim())
          .filter(Boolean)
          .filter((id) => id !== currentSchedule),
      ),
    );

    if (!referencedScheduleIds.length) return () => {};

    referencedScheduleIds.forEach((scheduleId) => {
      if (loadedTimetables[scheduleId]) return;

      loadTimetableById(scheduleId).then((timetable) => {
        if (!active || !timetable) return;
        setLoadedTimetables((prev) => {
          if (prev[scheduleId]) return prev;
          return { ...prev, [scheduleId]: timetable };
        });
      });
    });

    return () => {
      active = false;
    };
  }, [activeExternalSelections, currentSchedule, loadedTimetables]);

  // Normalize and store a single group input change inside the active set.
  const handleGroupChange = useCallback(
    (type, number) => {
      const rawValue = (number ?? "").toString().trim();
      const rawUpper = rawValue.toUpperCase().replace(/\s+/g, "");
      const lekToken = rawUpper.startsWith("LEK")
        ? rawUpper.slice(3)
        : rawUpper;
      const digits = rawValue.replace(/\D/g, "");
      // Find the prefix for this type
      const groupConfig = groupConfigs.find((g) => g.type === type);
      const prefix = groupConfig ? groupConfig.prefix : type;

      let normalizedGroupValue = "";
      if (type === "Lek") {
        if (lekToken === "N" || lekToken === "F") {
          normalizedGroupValue = `Lek${lekToken}`;
        } else {
          const lekDigits = lekToken.replace(/\D/g, "");
          normalizedGroupValue = lekDigits ? `${prefix}${lekDigits}` : "";
        }
      } else {
        normalizedGroupValue = digits ? `${prefix}${digits}` : "";
      }

      setScheduleGroupSets((prev) => {
        const existingConfig = prev[currentSchedule] || {
          sets: [
            {
              id: "set-1",
              name: "Zestaw 1",
              groups: defaultGroups,
              externalSelections: [],
            },
          ],
        };

        const sets = existingConfig.sets?.length
          ? existingConfig.sets
          : [
              {
                id: "set-1",
                name: "Zestaw 1",
                groups: defaultGroups,
                externalSelections: [],
              },
            ];

        const activeId =
          activeGroupSetBySchedule[currentSchedule] || sets[0]?.id || "set-1";

        const updatedSets = sets.map((set) => {
          if (set.id !== activeId) return set;
          return {
            ...set,
            groups: {
              ...(set.groups || {}),
              [type]: normalizedGroupValue,
            },
          };
        });

        return {
          ...prev,
          [currentSchedule]: {
            ...existingConfig,
            sets: updatedSets,
          },
        };
      });
    },
    [currentSchedule, groupConfigs, defaultGroups, activeGroupSetBySchedule],
  );

  const handleGroupSetChange = useCallback(
    (setId) => {
      // Switch active set for the current schedule.
      setActiveGroupSetBySchedule((prev) => ({
        ...prev,
        [currentSchedule]: setId,
      }));
    },
    [currentSchedule],
  );

  const updateActiveSet = useCallback(
    (updater) => {
      setScheduleGroupSets((prev) => {
        const existingConfig = prev[currentSchedule] || {
          sets: [
            {
              id: "set-1",
              name: "Zestaw 1",
              groups: defaultGroups,
              externalSelections: [],
            },
          ],
        };

        const sets = existingConfig.sets?.length
          ? existingConfig.sets
          : [
              {
                id: "set-1",
                name: "Zestaw 1",
                groups: defaultGroups,
                externalSelections: [],
              },
            ];

        const activeId =
          activeGroupSetBySchedule[currentSchedule] || sets[0]?.id || "set-1";

        const nextSets = sets.map((set) => {
          if (set.id !== activeId) return set;
          return updater(set);
        });

        return {
          ...prev,
          [currentSchedule]: {
            ...existingConfig,
            sets: nextSets,
          },
        };
      });
    },
    [activeGroupSetBySchedule, currentSchedule, defaultGroups],
  );

  const handleAddExternalSelection = useCallback(
    (scheduleId = "") => {
      const normalizedScheduleId = String(scheduleId || "").trim();

      const nextSelection = {
        id: `ext-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        scheduleId: normalizedScheduleId,
        groupType: "",
        groupValue: "",
        subjectKey: "",
      };

      updateActiveSet((set) => ({
        ...set,
        externalSelections: [...(set.externalSelections || []), nextSelection],
      }));
    },
    [updateActiveSet],
  );

  const handleUpdateExternalSelection = useCallback(
    (selectionId, patch) => {
      if (!selectionId) return;

      updateActiveSet((set) => ({
        ...set,
        externalSelections: (set.externalSelections || []).map((item) => {
          if (item.id !== selectionId) return item;
          const next = { ...item, ...(patch || {}) };

          if (Object.prototype.hasOwnProperty.call(patch || {}, "scheduleId")) {
            next.groupType = "";
            next.groupValue = "";
            next.subjectKey = "";
          }

          if (Object.prototype.hasOwnProperty.call(patch || {}, "groupType")) {
            next.groupValue = "";
          }

          if (
            Object.prototype.hasOwnProperty.call(patch || {}, "groupValue") ||
            Object.prototype.hasOwnProperty.call(patch || {}, "subjectKey")
          ) {
            next.subjectKey = String(next.subjectKey || "").trim();
          }

          return next;
        }),
      }));
    },
    [updateActiveSet],
  );

  const handleRemoveExternalSelection = useCallback(
    (selectionId) => {
      if (!selectionId) return;

      updateActiveSet((set) => ({
        ...set,
        externalSelections: (set.externalSelections || []).filter(
          (item) => item.id !== selectionId,
        ),
      }));
    },
    [updateActiveSet],
  );

  // Create a new set by cloning groups from the active (or first) set.
  const handleCreateGroupSet = useCallback(
    (name) => {
      const nextId = `set-${Date.now()}`;

      setScheduleGroupSets((prev) => {
        const existingConfig = prev[currentSchedule] || { sets: [] };
        const sets = existingConfig.sets || [];
        const sourceSet =
          sets.find((set) => set.id === activeGroupSetId) || sets[0] || null;

        const clonedGroups = {
          ...(sourceSet?.groups || defaultGroups),
        };
        const clonedExternalSelections = [
          ...(sourceSet?.externalSelections || []),
        ];

        const fallbackName = buildNextDefaultSetName(sets);
        const newSetName = String(name || "").trim() || fallbackName;

        const newSet = {
          id: nextId,
          name: newSetName,
          groups: clonedGroups,
          externalSelections: clonedExternalSelections,
        };

        return {
          ...prev,
          [currentSchedule]: {
            ...existingConfig,
            sets: [...sets, newSet],
          },
        };
      });

      setActiveGroupSetBySchedule((prev) => ({
        ...prev,
        [currentSchedule]: nextId,
      }));
    },
    [currentSchedule, activeGroupSetId, defaultGroups],
  );

  // Rename active set while preventing empty names.
  const handleRenameActiveGroupSet = useCallback(
    (name) => {
      const targetName = String(name || "").trim() || activeGroupSetName;

      setScheduleGroupSets((prev) => {
        const existingConfig = prev[currentSchedule];
        if (!existingConfig?.sets?.length) return prev;

        const nextSets = existingConfig.sets.map((set) => {
          if (set.id !== activeGroupSetId) return set;
          return {
            ...set,
            name: targetName,
          };
        });

        return {
          ...prev,
          [currentSchedule]: {
            ...existingConfig,
            sets: nextSets,
          },
        };
      });
    },
    [currentSchedule, activeGroupSetId, activeGroupSetName],
  );

  // Delete the active set (if possible) and choose a new active set id.
  const handleDeleteActiveGroupSet = useCallback(() => {
    let nextActiveId = activeGroupSetId;

    setScheduleGroupSets((prev) => {
      const existingConfig = prev[currentSchedule];
      if (!existingConfig?.sets?.length) return prev;
      if (existingConfig.sets.length <= 1) return prev;

      const remainingSets = existingConfig.sets.filter(
        (set) => set.id !== activeGroupSetId,
      );
      nextActiveId = remainingSets[0]?.id || activeGroupSetId;

      return {
        ...prev,
        [currentSchedule]: {
          ...existingConfig,
          sets: remainingSets,
        },
      };
    });

    setActiveGroupSetBySchedule((prev) => {
      return {
        ...prev,
        [currentSchedule]: nextActiveId,
      };
    });
  }, [currentSchedule, activeGroupSetId]);

  // Build select-friendly options for group set switchers.
  const groupSetOptions = useMemo(
    () => currentGroupSets.map((set) => ({ id: set.id, name: set.name })),
    [currentGroupSets],
  );

  // Update selected schedule id from UI controls.
  const handleScheduleChange = useCallback((scheduleId) => {
    setCurrentSchedule(scheduleId);
  }, []);

  // Public API consumed by App and nested UI panels.
  return {
    currentSchedule,
    scheduleGroupSets,
    activeGroupSetBySchedule,
    activeGroupSetId,
    groupSetOptions,
    activeGroupSetName,
    scheduleGroups,
    studentGroups,
    schedule,
    subjects,
    groupConfigs,
    loadedTimetables,
    activeExternalSelections,
    currentTimetable,
    isScheduleLoading,
    handleGroupChange,
    handleGroupSetChange,
    handleCreateGroupSet,
    handleRenameActiveGroupSet,
    handleDeleteActiveGroupSet,
    handleAddExternalSelection,
    handleUpdateExternalSelection,
    handleRemoveExternalSelection,
    handleScheduleChange,
  };
}
