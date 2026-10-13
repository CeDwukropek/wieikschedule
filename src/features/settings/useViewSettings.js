import { useEffect, useState } from "react";

export function useViewSettings(savedSettings) {
  const [viewMode, setViewMode] = useState(savedSettings?.viewMode ?? "week");
  const [hideLectures, setHideLectures] = useState(savedSettings?.hideLectures ?? false);
  const [showAll, setShowAll] = useState(savedSettings?.showAll ?? false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setViewMode(savedSettings?.viewMode ?? "week");
    setHideLectures(savedSettings?.hideLectures ?? false);
    setShowAll(savedSettings?.showAll ?? false);
    setReady(true);
  }, [savedSettings]);

  return { viewMode, setViewMode, hideLectures, setHideLectures, showAll, setShowAll, ready };
}
