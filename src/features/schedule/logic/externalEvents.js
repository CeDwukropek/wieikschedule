import { filterEvents } from "./filterEvents";
import { eventIdentity } from "./eventIdentity";

export function selectExternalEvents(selections, timetables, hideLectures, weekStart) {
  const events = (selections || []).flatMap(item => {
    const scheduleId = String(item?.scheduleId || "").trim();
    const groupType = String(item?.groupType || "").trim();
    const groupValue = String(item?.groupValue || "").trim();
    const subjectKey = String(item?.subjectKey || "").trim();
    const timetable = timetables[scheduleId];
    if (!scheduleId || !groupType || !groupValue || !timetable?.schedule?.length) return [];

    return filterEvents(timetable.schedule, { [groupType]: groupValue }, hideLectures, false, weekStart)
      .filter(event => !subjectKey || String(event.subj || "").trim() === subjectKey)
      .map(event => ({
        key: eventIdentity(event, scheduleId),
        event: { ...event, origin: "base", _sourceScheduleId: scheduleId, _isExternal: true },
      }));
  });
  return [...new Map(events.map(item => [item.key, item])).values()];
}
