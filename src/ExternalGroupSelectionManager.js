import React, { useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import { allTimetables } from "./timetables";

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

function getSubjectOptionsForGroup(timetable, groupType, groupValue) {
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

function getTypeOptionsForSubject(timetable, subjectKey) {
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

function getGroupValuesForTypeAndSubject(timetable, groupType, subjectKey) {
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

export default function ExternalGroupSelectionManager({
  currentSchedule,
  externalSelections = [],
  loadedTimetables = {},
  onAddExternalSelection,
  onUpdateExternalSelection,
  onRemoveExternalSelection,
}) {
  const scheduleOptions = useMemo(
    () => allTimetables.filter((tt) => tt.id !== currentSchedule),
    [currentSchedule],
  );

  const groupedSelections = useMemo(() => {
    const grouped = [];
    const bySchedule = new Map();

    externalSelections.forEach((item) => {
      const scheduleId = String(item?.scheduleId || "").trim();
      const key = scheduleId || `pending-${item.id}`;

      if (!bySchedule.has(key)) {
        const group = {
          key,
          scheduleId,
          items: [],
        };
        bySchedule.set(key, group);
        grouped.push(group);
      }

      bySchedule.get(key).items.push(item);
    });

    return grouped;
  }, [externalSelections]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-200">Dodatkowe grupy</h3>
      </div>

      {groupedSelections.length === 0 ? (
        <p className="text-xs text-gray-400">
          Dodaj pojedyncze grupy z innych planów.
        </p>
      ) : null}

      <div className="space-y-4">
        {groupedSelections.map((grouped) => {
          const timetable = loadedTimetables[grouped.scheduleId];
          const scheduleLabel = scheduleOptions.find(
            (option) => option.id === grouped.scheduleId,
          )?.name;

          return (
            <div
              key={grouped.key}
              className="rounded border border-neutral-700 bg-neutral-900/60 p-[10px]"
            >
              <div className="mb-2 flex items-center justify-between">
                {grouped.scheduleId ? (
                  <div className="text-xs font-medium text-gray-200">
                    {scheduleLabel || grouped.scheduleId}
                  </div>
                ) : (
                  <div className="w-full">
                    <select
                      value={grouped.scheduleId || ""}
                      onChange={(e) => {
                        grouped.items.forEach((row) => {
                          onUpdateExternalSelection?.(row.id, {
                            scheduleId: e.target.value,
                          });
                        });
                      }}
                      className="w-full px-2 py-1.5 bg-neutral-800 text-gray-300 border border-neutral-700 rounded text-xs"
                    >
                      <option value="">Wybierz plan</option>
                      {scheduleOptions.map((tt) => (
                        <option key={tt.id} value={tt.id}>
                          {tt.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {grouped.scheduleId ? (
                  <button
                    type="button"
                    onClick={() => onAddExternalSelection?.(grouped.scheduleId)}
                    className="ml-2 inline-flex items-center gap-1 rounded bg-neutral-800 px-2 py-1 text-[11px] text-gray-200 hover:bg-neutral-700"
                  >
                    <Plus className="h-3 w-3" />
                    Przedmiot
                  </button>
                ) : null}
              </div>

              {grouped.items.map((item, idx) => {
                const typeOptions = getTypeOptionsForSubject(
                  timetable,
                  item.subjectKey,
                );
                const valueOptions = getGroupValuesForTypeAndSubject(
                  timetable,
                  item.groupType,
                  item.subjectKey,
                );
                const subjectOptions = getSubjectOptionsForGroup(
                  timetable,
                  item.groupType,
                  item.groupValue,
                );

                return (
                  <div
                    key={item.id}
                    className={
                      idx > 0 ? "mt-2 border-t border-neutral-700 pt-2" : ""
                    }
                  >
                    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-2 items-center">
                      <select
                        value={item.subjectKey || ""}
                        onChange={(e) =>
                          onUpdateExternalSelection?.(item.id, {
                            subjectKey: e.target.value,
                          })
                        }
                        className="w-full min-w-0 truncate px-2 py-1.5 bg-neutral-800 text-gray-300 border border-neutral-700 rounded text-xs"
                        disabled={!item.scheduleId}
                      >
                        <option value="">Wszystkie przedmioty</option>
                        {subjectOptions.map((subject) => (
                          <option key={subject.value} value={subject.value}>
                            {subject.label}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => onRemoveExternalSelection?.(item.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded bg-neutral-800 text-red-300 hover:bg-neutral-700"
                        aria-label="Usuń dodatkową grupę"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-2 grid min-w-0 grid-cols-[3fr_1fr] gap-2 items-center">
                      <select
                        value={item.groupType || ""}
                        onChange={(e) =>
                          onUpdateExternalSelection?.(item.id, {
                            groupType: e.target.value,
                          })
                        }
                        className="w-full min-w-0 truncate px-2 py-1.5 bg-neutral-800 text-gray-300 border border-neutral-700 rounded text-xs"
                        disabled={!item.scheduleId}
                      >
                        <option value="">Typ grupy</option>
                        {typeOptions.map((group) => (
                          <option key={group.type} value={group.type}>
                            {group.label}
                          </option>
                        ))}
                      </select>

                      <select
                        value={item.groupValue || ""}
                        onChange={(e) =>
                          onUpdateExternalSelection?.(item.id, {
                            groupValue: e.target.value,
                          })
                        }
                        className="w-full min-w-0 px-2 py-1.5 bg-neutral-800 text-gray-300 border border-neutral-700 rounded text-xs"
                        disabled={!item.groupType}
                      >
                        <option value="">Grupa</option>
                        {valueOptions.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}

              {grouped.scheduleId && !timetable ? (
                <p className="mt-2 text-[11px] text-gray-500">
                  Ładowanie planu...
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      <button
        onClick={() => onAddExternalSelection?.("")}
        type="button"
        className="w-full inline-flex items-center justify-center gap-1 rounded bg-neutral-800 px-2 py-2 text-xs text-gray-200 hover:bg-neutral-700"
      >
        Dodaj
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
