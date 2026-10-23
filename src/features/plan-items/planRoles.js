import { describeItemTime, kindOf } from "./planItemLogic";

export function roleLabel(role) {
  if (role.role === "admin") return "Admin";
  if (role.role === "starosta") return `Starosta ${role.faculty}`;
  return `Starosta grupy ${role.group} (${role.faculty})`;
}
export const ROLE_NAMES = { starosta: "Starosta kierunku", group_starosta: "Starosta grupy" };

// Whom one may invite, and to which plans: an admin anyone anywhere, a starosta group starostas of their plans.
export function inviteChoices(roles, timetableOptions = []) {
  const admin = roles.some(role => role.role === "admin");
  const faculties = admin
    ? timetableOptions.map(option => option.id).filter(id => id && id.toLowerCase() !== "all")
    : [...new Set(roles.filter(role => role.role === "starosta").map(role => role.faculty))];
  return { roles: !faculties.length ? [] : admin ? ["group_starosta", "starosta"] : ["group_starosta"], faculties };
}
// Plans whose changes one may look through.
export const historyFaculties = (roles, scheduleId) => roles.some(role => role.role === "admin")
  ? [scheduleId] : [...new Set(roles.filter(role => role.faculty).map(role => role.faculty))];

const byGroup = (a, b) => a.localeCompare(b, "pl", { numeric: true });
export const groupsOf = (schedule = []) => [...new Set(schedule.flatMap(ev => ev.groups || []))].filter(group => group !== "W").sort(byGroup);

export function inviteMessage(invite) {
  const until = new Date(invite.expires_at).toLocaleDateString("pl-PL", { day: "numeric", month: "long" });
  const role = invite.role === "starosta" ? `starosta kierunku ${invite.faculty}` : `starosta grupy ${invite.group} (${invite.faculty})`;
  return `Kod zaproszenia do planu WIEiK: ${invite.code} (rola: ${role}). Zaloguj się w aplikacji i wpisz go w Ustawienia → `
    + `Kolokwia i terminy → „Mam kod zaproszenia”. Kod jest jednorazowy i ważny do ${until}.`;
}

// Fields of an earlier version, written back to undo a change (entries on a class keep only the class).
function versionFields(version) {
  const text = { kind: version.kind, title: version.title, details: version.details, subject: version.subject, group: version.group };
  if (version.timing === "class") return { ...text, timing: "class", event_id: version.event_id };
  if (version.timing === "slot") return { ...text, timing: "slot", date: version.date, start_time: version.start_time,
    duration_min: version.duration_min, due_time: null };
  return { ...text, timing: "due", date: version.date, due_time: version.due_time, start_time: null, duration_min: null };
}
// Only the latest change of an entry can be undone, so nothing newer is overwritten.
export function historyUndo(change) {
  const { current, operation, revision, previous, item_id: id } = change;
  if (!current || current.revision !== revision) return null;
  if (operation === "delete") return current.deleted ? { action: "restore", label: "Przywróć", items: [{ id, revision }] } : null;
  if (current.deleted) return null;
  if (operation === "create" || operation === "restore") return { action: "remove", label: "Usuń", items: [{ id, revision }] };
  if (operation === "update" && previous) return { action: "save", label: "Cofnij", items: [{ id, revision, ...versionFields(previous) }] };
  return null;
}

const OPERATIONS = { create: "Dodanie", update: "Zmiana", delete: "Usunięcie", restore: "Przywrócenie", review: "Zmiana planu uczelni" };
const REVIEW = { moved: "zajęcia przeniesione", cancelled: "zajęcia odwołane", changed: "zajęcia zmienione" };
// What a change did, in a few short lines.
export function describeChange(change) {
  const { item, previous, operation } = change;
  const lines = [];
  if (operation === "review") lines.push(item.state === "review" ? `Do sprawdzenia: ${REVIEW[item.review_reason] || "zajęcia zmienione"}.` : "Zajęcia wróciły na swój termin.");
  if (operation === "update" && previous) {
    if (previous.title !== item.title) lines.push(`Tytuł: ${previous.title} → ${item.title}`);
    if (previous.kind !== item.kind) lines.push(`Rodzaj: ${kindOf(previous).label} → ${kindOf(item).label}`);
    const before = describeItemTime(previous), after = describeItemTime(item);
    if (before !== after) lines.push(`Termin: ${before} → ${after}`);
    if ((previous.details || "") !== (item.details || "")) lines.push(item.details ? `Zakres materiału: ${item.details}` : "Usunięto zakres materiału.");
    if (previous.state === "review" && item.state === "active" && !lines.length) lines.push("Termin potwierdzony.");
  }
  if (operation === "create") lines.push(describeItemTime(item));
  return { what: OPERATIONS[operation] || operation, lines };
}

// Group entries waiting for a starosta after the university changed their class.
export const reviewItems = items => items.filter(item => item.scope === "group" && item.state === "review" && item.can_edit)
  .sort((a, b) => a.date.localeCompare(b.date));
