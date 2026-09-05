import { timeToMinutes } from "../../../utils/time";
import { toIsoDate } from "../../../utils/date";

function isLecture(event) {
  return event.type?.toLowerCase() === "wykład";
}

export function filterEvents(schedule, groups, hideLectures, showAll, weekStartDate) {
  // 1) Zestaw wybranych grup (O(1) membership)
  const groupSet = new Set(Object.values(groups || {}).filter(Boolean));

  // 2) Cache na zamianę "HH:MM" → minuty (unikamy powtórzeń)
  const minutesCache = new Map();
  const getMin = (hhmm) => {
    let v = minutesCache.get(hhmm);
    if (v == null) {
      v = timeToMinutes(hhmm);
      minutesCache.set(hhmm, v);
    }
    return v;
  };

  const hasExactWeekContext =
    weekStartDate instanceof Date && !Number.isNaN(weekStartDate.getTime());

  const normalizeText = (value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const selectedLekGroup = String(groups?.Lek || "").trim();
  const selectedLekToken = selectedLekGroup
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/^LEK/, "");
  const selectedLekLanguageCode =
    selectedLekToken === "N"
      ? "de"
      : selectedLekToken === "F"
        ? "fr"
        : selectedLekToken
          ? "en"
          : "";

  const isLectoratEvent = (ev) => {
    const eventType = normalizeText(ev?.type);
    if (eventType.includes("lekt")) return true;
    if (!Array.isArray(ev?.groups)) return false;
    return ev.groups.some((group) => normalizeText(group).startsWith("lek"));
  };

  const matchesLectoratLanguage = (ev, languageCode) => {
    if (!languageCode) return true;
    const source = normalizeText(
      `${ev?.subj || ""} ${ev?.title || ""} ${ev?.subjectName || ""}`,
    );
    if (languageCode === "de") return source.includes("niemiecki");
    if (languageCode === "fr") return source.includes("francuski");
    return source.includes("angielski");
  };

  // 3) Jedno przejście: filtrujemy i zbieramy w tablicę
  const out = [];
  for (const ev of schedule) {
    if (
      hasExactWeekContext &&
      Array.isArray(ev.dates) &&
      ev.dates.length > 0
    ) {
      const eventDay = Number(ev.day);
      const dayOffset = Number.isFinite(eventDay) ? eventDay : 0;
      const targetDate = new Date(weekStartDate);
      targetDate.setDate(targetDate.getDate() + dayOffset);
      const targetIso = toIsoDate(targetDate);
      if (!targetIso || !ev.dates.includes(targetIso)) continue;
    }

    // ukryj wykłady, jeśli proszono
    if (hideLectures && isLecture(ev)) continue;

    // wykłady zawsze przepuszczamy (jeśli nie są ukryte)
    if (!isLecture(ev)) {
      // Lek selection supports numeric groups (Lek1...) and language shortcuts (LekN, LekF)
      if (selectedLekLanguageCode && isLectoratEvent(ev)) {
        if (!matchesLectoratLanguage(ev, selectedLekLanguageCode)) continue;
      }

      const shouldFilterLectoratByLanguageOnly =
        !showAll &&
        isLectoratEvent(ev) &&
        (selectedLekLanguageCode === "de" ||
          selectedLekLanguageCode === "fr");

      // jeśli nie "pokaż wszystko", filtruj po grupach
      if (!showAll) {
        const isDayOff =
          String(ev?.status || "")
            .trim()
            .toLowerCase() === "wolne";
        if (ev.appliesToAllGroups || isDayOff) {
          out.push(ev);
          continue;
        }
        if (!shouldFilterLectoratByLanguageOnly) {
          const matchesGroup =
            Array.isArray(ev.groups) &&
            ev.groups.some((eventGroup) => {
              const normalizedEventGroup = String(eventGroup || "").trim();
              if (!normalizedEventGroup) return false;

              if (groupSet.has(normalizedEventGroup)) return true;

              const eventHasNumber = /\d/.test(normalizedEventGroup);
              if (eventHasNumber) return false;

              return Array.from(groupSet).some((selectedGroup) =>
                String(selectedGroup || "")
                  .trim()
                  .startsWith(normalizedEventGroup),
              );
            });
          if (!matchesGroup) continue;
        }
      }

    }

    out.push(ev);
  }

  // 5) Sort: dzień → start → opcjonalnie id (stabilizacja)
  out.sort(
    (a, b) =>
      a.day - b.day ||
      getMin(a.start) - getMin(b.start) ||
      (a.id ?? 0) - (b.id ?? 0),
  );

  return out;
}
