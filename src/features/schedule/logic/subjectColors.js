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
// A chosen colour is a palette id or a person's own colour ("#rrggbb"); the result is a Tailwind class or the hex.
export const isCustomColor = value => /^#[0-9a-f]{6}$/i.test(String(value || ""));
export const colorClassOf = value => CLASS_BY_ID[value] || (isCustomColor(value) ? value.toLowerCase() : null);

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

// A subject's colour as text on the dark background: the light (400) shade of its Tailwind colour, or the person's own hex.
const TEXT_SHADES = { red: "#f87171", orange: "#fb923c", amber: "#fbbf24", yellow: "#facc15", green: "#4ade80", emerald: "#34d399",
  teal: "#2dd4bf", cyan: "#22d3ee", sky: "#38bdf8", blue: "#60a5fa", indigo: "#818cf8", violet: "#a78bfa", purple: "#c084fc",
  fuchsia: "#e879f9", pink: "#f472b6", rose: "#fb7185", gray: "#9ca3af" };
export function subjectTextColor(color) {
  if (isCustomColor(color)) return color.toLowerCase();
  return TEXT_SHADES[String(color || "").match(/^bg-([a-z]+)-\d+$/)?.[1]] || null;
}
