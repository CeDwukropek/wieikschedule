// Automatically import all timetables
import { timetableData as timetableEiA2 } from "./timetableEiA2";
import { timetableData as timetableEiA4 } from "./timetableEiA4";
import { timetableData as timetableIwIK2 } from "./timetableIwIK2";

// Normalize the timetable structure
// EiA2 uses suffix naming (NAME_EiA2, SCHEDULE_EiA2), EiA4 uses plain naming (NAME, SCHEDULE)
const normalizeTimetable = (data, id) => {
  // Try to find NAME, SCHEDULE, SUBJECTS, and GROUPS fields with or without suffixes
  const nameKey = Object.keys(data).find((key) => key.startsWith("NAME"));
  const scheduleKey = Object.keys(data).find((key) =>
    key.startsWith("SCHEDULE"),
  );
  const subjectsKey = Object.keys(data).find((key) =>
    key.startsWith("SUBJECTS"),
  );
  const groupsKey = Object.keys(data).find((key) => key.startsWith("GROUPS"));

  return {
    id,
    name: data[nameKey] || id,
    schedule: data[scheduleKey] || [],
    subjects: data[subjectsKey] || {},
    groups: data[groupsKey] || [],
  };
};

// Export array of all available timetables
export const allTimetables = [
  normalizeTimetable(timetableEiA2, "eia2"),
  normalizeTimetable(timetableEiA4, "eia4"),
  normalizeTimetable(timetableIwIK2, "iwik2"),
];

// Export a map for quick access by id
export const timetableMap = allTimetables.reduce((acc, tt) => {
  acc[tt.id] = tt;
  return acc;
}, {});

// Default timetable
export const defaultTimetable = allTimetables[0];
