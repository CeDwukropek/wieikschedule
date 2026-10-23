import { useEffect, useState } from "react";

export function useViewSettings(savedSettings) {
  const [viewMode, setViewMode] = useState(savedSettings?.viewMode ?? "week");
  const [hideLectures, setHideLectures] = useState(savedSettings?.hideLectures ?? false);
  const [showAll, setShowAll] = useState(savedSettings?.showAll ?? false);
  const [alwaysShowWeekend, setAlwaysShowWeekend] = useState(savedSettings?.alwaysShowWeekend ?? false);
  const [entryScope, setEntryScope] = useState(savedSettings?.entryScope ?? "all");
  const [hiddenKinds, setHiddenKinds] = useState(savedSettings?.hiddenKinds ?? []);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setViewMode(savedSettings?.viewMode ?? "week");
    setHideLectures(savedSettings?.hideLectures ?? false);
    setShowAll(savedSettings?.showAll ?? false);
    setAlwaysShowWeekend(savedSettings?.alwaysShowWeekend ?? false);
    setEntryScope(savedSettings?.entryScope ?? "all");
    setHiddenKinds(savedSettings?.hiddenKinds ?? []);
    setReady(true);
  }, [savedSettings]);

  return { viewMode, setViewMode, hideLectures, setHideLectures, showAll, setShowAll, alwaysShowWeekend, setAlwaysShowWeekend,
    entryScope, setEntryScope, hiddenKinds, setHiddenKinds, ready };
}
