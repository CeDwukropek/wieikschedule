const fs = require('fs');
const path = require('path');
const root = process.cwd();
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const write = (f, s) => { fs.mkdirSync(path.dirname(path.join(root,f)), {recursive:true}); fs.writeFileSync(path.join(root,f), s); };
let s = read('src/features/schedule/data/timetableApi.js');
let normalizer = s.slice(s.indexOf('const SUBJECT_COLORS'), s.indexOf('function mapDbEventToLegacyShape'));
normalizer = normalizer.replace('function buildTimetableFromSemesterJson(fileId, json)', 'export function normalizeTimetable(scheduleId, rows)');
normalizer = normalizer.replace('  // Transform raw semester JSON into normalized timetable data used by the app.\n  const rawEvents = Array.isArray(json?.events) ? json.events : [];\n  const name = String(json?.facultyName || fileId);', '  // Adapt database rows to the calendar model at the data boundary.\n  const rawEvents = Array.isArray(rows) ? rows : [];');
normalizer = normalizer.replaceAll('fileId', 'scheduleId').replace('    name,\n', '    name: scheduleId,\n');
normalizer = normalizer.replaceAll('item?.event_id', 'item?.id').replace('normalizeHm(item?.startTime)', 'normalizeHm(normalizeDbTime(item?.start_time))').replaceAll('item?.durationMin', 'item?.duration_min').replace('const status = String(item?.status || "").trim();', 'const status = String(item?.status || "").trim() || "aktywne";');
write('src/features/schedule/data/normalizeTimetable.js', normalizer);
const ext = read('src/features/schedule/components/ExternalGroupSelections.js');
const functions = ext.slice(ext.indexOf('function isHolidayEvent'), ext.indexOf('export default function'));
write('src/features/schedule/logic/externalGroupOptions.js', functions.replaceAll(/function (getTypeOptionsForSubject|getGroupValuesForTypeAndSubject|getSubjectOptionsForGroup)\(/g, 'export function $1('));
write('src/features/schedule/components/ExternalGroupSelections.js', ext.slice(0, ext.indexOf('function isHolidayEvent')) + 'import { getTypeOptionsForSubject, getGroupValuesForTypeAndSubject, getSubjectOptionsForGroup } from "../logic/externalGroupOptions";\n\n' + ext.slice(ext.indexOf('export default function')));
// Preserve endpoint bodies; share only the identical infrastructure functions.
const base = 'api/my-plan/';
const add = read(base + 'add-event.js');
const list = read(base + 'added-events.js');
write('api/_lib/http.js', add.slice(add.indexOf('function respond'), add.indexOf('async function resolveUserIdByFirebaseUid')) + 'module.exports = { respond, setCors };\n');
write('api/_lib/users.js', list.slice(list.indexOf('async function getUserIdByFirebaseUid'), list.indexOf('module.exports =')) + add.slice(add.indexOf('async function resolveUserIdByFirebaseUid'), add.indexOf('module.exports =')) + 'module.exports = { getUserIdByFirebaseUid, resolveUserIdByFirebaseUid };\n');
for (const f of ['add-event.js', 'added-events.js', 'remove-event.js']) {
  let endpoint = read(base + f);
  const start = endpoint.indexOf('function respond');
  const date = f === 'added-events.js' ? endpoint.slice(endpoint.indexOf('function getDateRangeFromQuery'), endpoint.indexOf('async function getUserIdByFirebaseUid')) : '';
  const userFunction = f === 'add-event.js' ? 'resolveUserIdByFirebaseUid' : 'getUserIdByFirebaseUid';
  endpoint = `const { respond, setCors } = require("../_lib/http");\nconst { ${userFunction} } = require("../_lib/users");\n` + endpoint.slice(0,start) + date + endpoint.slice(endpoint.indexOf('module.exports ='));
  write(base + f, endpoint);
}
