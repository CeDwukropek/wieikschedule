import { useEffect, useState } from "react";

export function useViewSettings(savedSettings) {
  const [viewMode, setViewMode] = useState(savedSettings?.viewMode ?? "week");
  const [hideLectures, setHideLectures] = useState(savedSettings?.hideLectures ?? false);
  const [showAll, setShowAll] = useState(savedSettings?.showAll ?? false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof savedSettings?.viewMode === "string") setViewMode(savedSettings.viewMode);
    if (typeof savedSettings?.hideLectures === "boolean") setHideLectures(savedSettings.hideLectures);
    if (typeof savedSettings?.showAll === "boolean") setShowAll(savedSettings.showAll);
    setReady(true);
  }, [savedSettings]);

  return { viewMode, setViewMode, hideLectures, setHideLectures, showAll, setShowAll, ready };
}
