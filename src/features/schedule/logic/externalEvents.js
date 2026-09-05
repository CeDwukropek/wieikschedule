import { filterEvents } from "./filterEvents";

export function selectExternalEvents(selections, timetables, hideLectures, weekStart) {
  return (selections || []).flatMap(item => {
    const scheduleId = String(item?.scheduleId || "").trim();
    const groupType = String(item?.groupType || "").trim();
    const groupValue = String(item?.groupValue || "").trim();
    const subjectKey = String(item?.subjectKey || "").trim();
    const timetable = timetables[scheduleId];
    if (!scheduleId || !groupType || !groupValue || !timetable?.schedule?.length) return [];

    return filterEvents(timetable.schedule, { [groupType]: groupValue }, hideLectures, false, weekStart)
      .filter(event => !subjectKey || String(event.subj || "").trim() === subjectKey)
      .map(event => ({
        key: ["external", scheduleId, groupType, groupValue, subjectKey || "*",
          event.id, event.day, event.start, event.end, event.room].join("::"),
        event: { ...event, origin: "base", _sourceScheduleId: scheduleId, _isExternal: true },
      }));
  });
}
