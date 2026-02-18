export function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export const dayNames = ["Pon", "Wt", "Śr", "Czw", "Pt"];

const teacherNormalizationRules = [
  [/in\?\./g, "inż."],
  [/Sie\?ko/g, "Sieńko"],
  [/So\?tys/g, "Sołtys"],
  [/Ra\?ny/g, "Raźny"],
  [/Sier\?\?ga/g, "Sierżęga"],
  [/Ozi\?b\?o/g, "Oziębło"],
  [/\?aba/g, "Żaba"],
  [/G\?barowski/g, "Gąbarowski"],
];

export function normalizeTeacherDisplay(teacher) {
  let normalized = (teacher || "").trim();
  for (const [pattern, replacement] of teacherNormalizationRules) {
    normalized = normalized.replace(pattern, replacement);
  }
  return normalized;
}

export function splitTeacherDisplay(teacher) {
  const normalized = normalizeTeacherDisplay(teacher);
  if (!normalized) return [];

  return normalized
    .split("/")
    .map((item) => item.trim())
    .filter(Boolean);
}
