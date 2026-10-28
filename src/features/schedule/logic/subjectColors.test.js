import { subjectNames, withSubjectColors } from "./subjectColors";

const subjects = { MAT: { name: "Matematyka", color: "bg-indigo-900" }, FIZ: { name: "Fizyka", color: "bg-sky-500" } };

test("a chosen colour applies to the whole subject and is also found by its name", () => {
  const coloured = withSubjectColors(subjects, { Matematyka: "green", Fizyka: "nope" });
  expect(coloured.MAT.color).toBe("bg-green-600");
  expect(coloured.FIZ.color).toBe("bg-sky-500");
  expect(coloured.Matematyka).toEqual({ name: "Matematyka", color: "bg-green-600" });
});

test("without chosen colours the subjects stay as they were", () => {
  expect(withSubjectColors(subjects, {})).toBe(subjects);
  expect(withSubjectColors(subjects, undefined)).toBe(subjects);
});

test("subject names with classes are listed once, alphabetically, without days off", () => {
  const all = { ...subjects, MAT_2: { name: "Matematyka" }, BN: { name: "Boże Narodzenie" } };
  const events = [{ subj: "MAT" }, { subj: "MAT_2" }, { subj: "FIZ" }, { subj: "BN", status: "wolne" }];
  expect(subjectNames(all, events)).toEqual(["Fizyka", "Matematyka"]);
});
