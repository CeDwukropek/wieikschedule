import { mergeEvents } from "../logic/mergeEvents";

// ICS retains the existing all-weeks export of base and external group schedules.
export function selectExportEvents(options) {
  return mergeEvents({ ...options, weekStart: null, addedEvents: [] });
}
