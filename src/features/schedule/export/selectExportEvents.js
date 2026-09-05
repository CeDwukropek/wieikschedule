import { filterEvents } from "../logic/filterEvents";
import { selectExternalEvents } from "../logic/externalEvents";

// ICS retains the existing all-weeks export of base and external group schedules.
export function selectExportEvents({ schedule, groups, hideLectures, showAll, externalSelections, timetables }) {
  return [
    ...filterEvents(schedule, groups, hideLectures, showAll, null),
    ...selectExternalEvents(externalSelections, timetables, hideLectures, null).map(item => item.event),
  ];
}
