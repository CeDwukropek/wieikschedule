import React, { useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";

import { getTypeOptionsForSubject, getGroupValuesForTypeAndSubject, getSubjectOptionsForGroup } from "../logic/externalGroupOptions";

export default function ExternalGroupSelections({
  currentSchedule,
  timetableOptions = [],
  externalSelections = [],
  loadedTimetables = {},
  onAddExternalSelection,
  onUpdateExternalSelection,
  onRemoveExternalSelection,
}) {
  const scheduleOptions = useMemo(
    () => timetableOptions.filter((tt) => tt.id !== currentSchedule),
    [currentSchedule, timetableOptions],
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
