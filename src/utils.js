export function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export const dayNames = ["Pon", "Wt", "Śr", "Czw", "Pt"];
