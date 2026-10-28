import { isDayOff } from "../../plan-items/planItemLogic";

// Colours a person can give a subject; every class of the subject (lecture, lab, …) shares it.
// Stored by id, so the classes behind them can change without touching saved settings.
export const SUBJECT_PALETTE = [
  { id: "red", label: "Czerwony", className: "bg-red-800" },
  { id: "orange", label: "Pomarańczowy", className: "bg-orange-600" },
  { id: "amber", label: "Bursztynowy", className: "bg-amber-600" },
  { id: "green", label: "Zielony", className: "bg-green-600" },
  { id: "teal", label: "Morski", className: "bg-teal-600" },
  { id: "cyan", label: "Turkusowy", className: "bg-cyan-600" },
  { id: "sky", label: "Błękitny", className: "bg-sky-500" },
  { id: "purple", label: "Fioletowy", className: "bg-purple-600" },
  { id: "fuchsia", label: "Fuksja", className: "bg-fuchsia-700" },
  { id: "pink", label: "Różowy", className: "bg-pink-600" },
];
const CLASS_BY_ID = Object.fromEntries(SUBJECT_PALETTE.map(({ id, className }) => [id, className]));
export const colorClassOf = id => CLASS_BY_ID[id] || null;

// Subjects with the chosen colours (keyed by subject name). Subjects of other plans are found by their
// title (see eventSubject), so a chosen colour is also added under the name itself.
export function withSubjectColors(subjects = {}, chosen = {}) {
  const picked = Object.entries(chosen || {}).filter(([, id]) => colorClassOf(id));
  if (!picked.length) return subjects;
  const result = Object.fromEntries(Object.entries(subjects).map(([code, subject]) =>
    [code, colorClassOf(chosen[subject.name]) ? { ...subject, color: colorClassOf(chosen[subject.name]) } : subject]));
  for (const [name, id] of picked) result[name] ??= { name, color: colorClassOf(id) };
  return result;
}

// Distinct names of subjects that have classes in the plan (not only days off such as holidays), alphabetically.
export function subjectNames(subjects = {}, events = []) {
  const taught = new Set(events.filter(ev => !isDayOff(ev)).map(ev => ev.subj));
  return [...new Set(Object.entries(subjects || {}).filter(([code]) => taught.has(code)).map(([, subject]) => subject.name)
    .filter(Boolean))].sort((a, b) => a.localeCompare(b, "pl"));
}
