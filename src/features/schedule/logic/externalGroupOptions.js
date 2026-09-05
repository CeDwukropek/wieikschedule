function isHolidayEvent(event) {
  const normalizedType = String(event?.type || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return normalizedType === "swieto";
}

function sortGroupValues(a, b) {
  const getParts = (value) => {
    const raw = String(value || "").trim();
    const prefix = raw.match(/^[^\d]+/)?.[0] || raw;
    const numberMatch = raw.match(/(\d+)/);
    const number = numberMatch
      ? Number(numberMatch[1])
      : Number.POSITIVE_INFINITY;
    return { prefix, number, raw };
  };

  const pa = getParts(a);
  const pb = getParts(b);
  if (pa.prefix !== pb.prefix) return pa.prefix.localeCompare(pb.prefix, "pl");
  if (pa.number !== pb.number) return pa.number - pb.number;
  return pa.raw.localeCompare(pb.raw, "pl");
}

function getGroupValuesForType(timetable, groupType) {
  if (!timetable || !groupType) return [];

  const config = (timetable.groups || []).find((g) => g.type === groupType);
  const prefix = config?.prefix || groupType;
  const values = new Set();

  (timetable.schedule || []).forEach((event) => {
    if (isHolidayEvent(event)) return;

    (event.groups || []).forEach((group) => {
      const raw = String(group || "").trim();
      if (!raw) return;
      if (raw.startsWith(prefix)) values.add(raw);
    });
  });

  if (config?.defaultValue) values.add(config.defaultValue);

  return Array.from(values).sort(sortGroupValues);
}

export function getSubjectOptionsForGroup(timetable, groupType, groupValue) {
  if (!timetable) return [];

  const subjectMap = timetable.subjects || {};
  const optionsByKey = new Map();
  const desiredPrefix = groupType
    ? (timetable.groups || []).find((g) => g.type === groupType)?.prefix ||
      groupType
    : "";

  (timetable.schedule || []).forEach((event) => {
    if (isHolidayEvent(event)) return;

    const groups = Array.isArray(event.groups) ? event.groups : [];

    if (groupValue) {
      if (!groups.includes(groupValue)) return;
    } else if (desiredPrefix) {
      const hasPrefix = groups.some((group) =>
        String(group || "")
          .trim()
          .startsWith(desiredPrefix),
      );
      if (!hasPrefix) return;
    }

    const key = String(event.subj || event.title || "").trim();
    if (!key || optionsByKey.has(key)) return;

    const label = String(
      subjectMap[key]?.name || event.title || event.subj || key,
    ).trim();

    optionsByKey.set(key, {
      value: key,
      label: label || key,
    });
  });

  return Array.from(optionsByKey.values()).sort((a, b) =>
    a.label.localeCompare(b.label, "pl"),
  );
}

export function getTypeOptionsForSubject(timetable, subjectKey) {
  if (!timetable) return [];
  if (!subjectKey) return timetable.groups || [];

  const availablePrefixes = new Set();
  (timetable.schedule || []).forEach((event) => {
    if (isHolidayEvent(event)) return;

    if (String(event?.subj || "").trim() !== String(subjectKey || "").trim()) {
      return;
    }

    (event.groups || []).forEach((group) => {
      const raw = String(group || "").trim();
      const prefix = raw.match(/^[^\d]+/)?.[0] || "";
      if (prefix) availablePrefixes.add(prefix);
    });
  });

  return (timetable.groups || []).filter((group) =>
    availablePrefixes.has(String(group.prefix || group.type || "")),
  );
}

export function getGroupValuesForTypeAndSubject(timetable, groupType, subjectKey) {
  const values = getGroupValuesForType(timetable, groupType);
  if (!subjectKey) return values;

  const filtered = values.filter((value) => {
    return (timetable.schedule || []).some((event) => {
      if (isHolidayEvent(event)) return false;

      if (
        String(event?.subj || "").trim() !== String(subjectKey || "").trim()
      ) {
        return false;
      }
      return (event.groups || []).includes(value);
    });
  });

  return filtered;
}

