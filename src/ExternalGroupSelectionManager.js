import React, { useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import { allTimetables } from "./timetables";

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
    (event.groups || []).forEach((group) => {
      const raw = String(group || "").trim();
      if (!raw) return;
      if (raw.startsWith(prefix)) values.add(raw);
    });
  });

  if (config?.defaultValue) values.add(config.defaultValue);

  return Array.from(values).sort(sortGroupValues);
}

function getSubjectOptionsForGroup(timetable, groupValue) {
  if (!timetable || !groupValue) return [];

  const subjectMap = timetable.subjects || {};
  const optionsByKey = new Map();

  (timetable.schedule || []).forEach((event) => {
    const groups = Array.isArray(event.groups) ? event.groups : [];
    if (!groups.includes(groupValue)) return;

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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-200">Dodatkowe grupy</h3>
        <button
          onClick={onAddExternalSelection}
          type="button"
          className="inline-flex items-center gap-1 rounded bg-neutral-800 px-2 py-1 text-xs text-gray-200 hover:bg-neutral-700"
        >
          <Plus className="h-3.5 w-3.5" />
          Dodaj
        </button>
      </div>

      {externalSelections.length === 0 ? (
        <p className="text-xs text-gray-400">
          Brak dodatkowych grup. Dodaj pojedyncze grupy z innych planów.
        </p>
      ) : null}

      <div className="space-y-2">
        {externalSelections.map((item) => {
          const timetable = loadedTimetables[item.scheduleId];
          const typeOptions = timetable?.groups || [];
          const valueOptions = getGroupValuesForType(timetable, item.groupType);
          const subjectOptions = getSubjectOptionsForGroup(
            timetable,
            item.groupValue,
          );

          return (
            <div
              key={item.id}
              className="rounded border border-neutral-800 bg-neutral-900/60 p-2"
            >
              <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 items-center">
                <select
                  value={item.scheduleId || ""}
                  onChange={(e) =>
                    onUpdateExternalSelection?.(item.id, {
                      scheduleId: e.target.value,
                    })
                  }
                  className="px-2 py-1.5 bg-neutral-800 text-gray-300 border border-neutral-700 rounded text-xs"
                >
                  <option value="">Wybierz plan</option>
                  {scheduleOptions.map((tt) => (
                    <option key={tt.id} value={tt.id}>
                      {tt.name}
                    </option>
                  ))}
                </select>

                <select
                  value={item.groupType || ""}
                  onChange={(e) =>
                    onUpdateExternalSelection?.(item.id, {
                      groupType: e.target.value,
                    })
                  }
                  className="px-2 py-1.5 bg-neutral-800 text-gray-300 border border-neutral-700 rounded text-xs"
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
                  className="px-2 py-1.5 bg-neutral-800 text-gray-300 border border-neutral-700 rounded text-xs"
                  disabled={!item.groupType}
                >
                  <option value="">Grupa</option>
                  {valueOptions.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>

                <select
                  value={item.subjectKey || ""}
                  onChange={(e) =>
                    onUpdateExternalSelection?.(item.id, {
                      subjectKey: e.target.value,
                    })
                  }
                  className="px-2 py-1.5 bg-neutral-800 text-gray-300 border border-neutral-700 rounded text-xs"
                  disabled={!item.groupValue}
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

              {item.scheduleId && !timetable ? (
                <p className="mt-2 text-[11px] text-gray-500">
                  Ładowanie planu...
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
