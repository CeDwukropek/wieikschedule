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

function buildInitialScheduleGroupSets(savedSettings) {
  const modern = savedSettings?.scheduleGroupSets;
  if (modern && typeof modern === "object") {
    return modern;
  }

  const legacy = savedSettings?.scheduleGroups;
  if (!legacy || typeof legacy !== "object") {
    return {};
  }

  const migrated = {};
  Object.entries(legacy).forEach(([scheduleId, groups]) => {
    migrated[scheduleId] = {
      sets: [
        {
          id: "set-1",
          name: "Zestaw 1",
          groups: groups || {},
        },
      ],
    };
  });

  return migrated;
}

export function useScheduleManager(savedSettings) {
  const defaultScheduleId = defaultTimetable?.id || allTimetables[0]?.id || "";

  const [currentSchedule, setCurrentSchedule] = useState(
    savedSettings?.currentSchedule ?? defaultScheduleId,
  );

  const [scheduleGroupSets, setScheduleGroupSets] = useState(
    () => buildInitialScheduleGroupSets(savedSettings),
  );

  const [activeGroupSetBySchedule, setActiveGroupSetBySchedule] = useState(
    savedSettings?.activeGroupSetBySchedule ?? {},
  );

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

  const defaultGroups = useMemo(
    () => buildDefaultGroupsForTimetable(currentTimetable),
    [currentTimetable],
  );

  const currentGroupSets = useMemo(
    () => scheduleGroupSets[currentSchedule]?.sets || [],
    [scheduleGroupSets, currentSchedule],
  );

  const activeGroupSetId = useMemo(() => {
    return (
      activeGroupSetBySchedule[currentSchedule] ||
      currentGroupSets[0]?.id ||
      "set-1"
    );
  }, [activeGroupSetBySchedule, currentSchedule, currentGroupSets]);

  const activeGroupSet = useMemo(
    () => currentGroupSets.find((set) => set.id === activeGroupSetId),
    [currentGroupSets, activeGroupSetId],
  );

  const studentGroups = useMemo(
    () => activeGroupSet?.groups || defaultGroups,
    [activeGroupSet, defaultGroups],
  );

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

  const schedule = useMemo(() => currentTimetable.schedule, [currentTimetable]);

  const subjects = useMemo(
    () => currentTimetable.subjects || {},
    [currentTimetable],
  );

  // Get group configs for the current schedule
  const groupConfigs = useMemo(
    () => currentTimetable.groups || [],
    [currentTimetable],
  );

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

  const handleGroupChange = useCallback(
    (type, number) => {
      const digits = (number ?? "").toString().replace(/\D/g, "");
      // Find the prefix for this type
      const groupConfig = groupConfigs.find((g) => g.type === type);
      const prefix = groupConfig ? groupConfig.prefix : type;

      setScheduleGroupSets((prev) => {
        const existingConfig = prev[currentSchedule] || {
          sets: [
            {
              id: "set-1",
              name: "Zestaw 1",
              groups: defaultGroups,
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
              [type]: digits ? prefix + digits : "",
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
    [
      currentSchedule,
      groupConfigs,
      defaultGroups,
      activeGroupSetBySchedule,
    ],
  );

  const handleGroupSetChange = useCallback((setId) => {
    setActiveGroupSetBySchedule((prev) => ({
      ...prev,
      [currentSchedule]: setId,
    }));
  }, [currentSchedule]);

  const handleSaveCurrentAsNewSet = useCallback(() => {
    const nextId = `set-${Date.now()}`;

    setScheduleGroupSets((prev) => {
      const existingConfig = prev[currentSchedule] || { sets: [] };
      const sets = existingConfig.sets || [];
      const sourceSet =
        sets.find((set) => set.id === activeGroupSetId) || sets[0] || null;

      const clonedGroups = {
        ...(sourceSet?.groups || defaultGroups),
      };

      const newSet = {
        id: nextId,
        name: `Zestaw ${sets.length + 1}`,
        groups: clonedGroups,
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
  }, [currentSchedule, activeGroupSetId, defaultGroups]);

  const groupSetOptions = useMemo(
    () => currentGroupSets.map((set) => ({ id: set.id, name: set.name })),
    [currentGroupSets],
  );

  const handleScheduleChange = useCallback((scheduleId) => {
    setCurrentSchedule(scheduleId);
  }, []);

  return {
    currentSchedule,
    scheduleGroupSets,
    activeGroupSetBySchedule,
    activeGroupSetId,
    groupSetOptions,
    scheduleGroups,
    studentGroups,
    schedule,
    subjects,
    groupConfigs,
    currentTimetable,
    isScheduleLoading,
    handleGroupChange,
    handleGroupSetChange,
    handleSaveCurrentAsNewSet,
    handleScheduleChange,
  };
}
