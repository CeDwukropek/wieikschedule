import { mergeEvents } from "../logic/mergeEvents";

// One effective source for all weeks, including confirmed personal additions.
export function selectExportEvents(options) {
  return mergeEvents({ ...options, weekStart: null });
}
