import { mergeEvents } from "./mergeEvents";
import { selectExportEvents } from "../export/selectExportEvents";

const lecture = { id: 1, event_id: "lecture", subj: "MAT", type: "Wykład", day: 0,
  start: "10:00", end: "11:30", room: "1", groups: [], dates: ["2026-10-12"] };
const exercise = { ...lecture, id: 2, event_id: "exercise", type: "Ćwiczenia", groups: ["Ć2"] };
const seminar = { ...lecture, id: 3, event_id: "seminar", type: "Seminarium", groups: ["S3"] };
const options = {
  schedule: [], groups: {}, weekStart: new Date(2026, 9, 12),
  externalSelections: [
    { scheduleId: "other", groupType: "Ć", groupValue: "Ć2", subjectKey: "MAT" },
    { scheduleId: "other", groupType: "S", groupValue: "S3", subjectKey: "MAT" },
  ],
  timetables: { other: { schedule: [lecture, exercise, seminar] } },
};

test.each([mergeEvents, selectExportEvents])("calendar and ICS include a shared lecture once and both makeup classes", select => {
  const events = select(options);
  expect(events.map(event => event.event_id).sort()).toEqual(["exercise", "lecture", "seminar"]);
});

test("an external selection does not duplicate events already in the main schedule", () => {
  expect(mergeEvents({ ...options, scheduleId: "other", schedule: [lecture] })).toHaveLength(3);
});

test("hide lectures and exact dates still apply", () => {
  expect(mergeEvents({ ...options, hideLectures: true })).toHaveLength(2);
  expect(mergeEvents({ ...options, weekStart: new Date(2026, 9, 19) })).toEqual([]);
});

test("local numeric IDs in unrelated schedules do not collide", () => {
  const localLecture = { ...lecture, event_id: undefined };
  const events = mergeEvents({ ...options, scheduleId: "main", schedule: [localLecture],
    timetables: { other: { schedule: [localLecture] } } });
  expect(events).toHaveLength(2);
});

test("separate dates and rooms remain separate events in ICS", () => {
  const distinct = { ...lecture, dates: ["2026-10-19"] };
  const differentRoom = { ...lecture, room: "2" };
  expect(selectExportEvents({ ...options, timetables: { other: { schedule: [lecture, distinct, differentRoom] } } })).toHaveLength(3);
});
