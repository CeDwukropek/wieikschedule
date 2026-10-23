const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const root = process.cwd();
function full(file) {
  const resolved = path.resolve(root, file);
  if (!resolved.startsWith(root + path.sep)) throw new Error(`Outside workspace: ${file}`);
  return resolved;
}
function write(file, text) {
  fs.mkdirSync(path.dirname(full(file)), { recursive: true });
  fs.writeFileSync(full(file), text, 'utf8');
}
const files = cp.execFileSync('git', ['ls-files'], { encoding: 'utf8' }).trim().split(/\r?\n/);
const source = new Map(files.filter(f => f.startsWith('src/')).map(f => [f, fs.readFileSync(full(f), 'utf8').replaceAll('\r\n', '\n')]));
for (const [file, text] of source) write(`.tmp-cleanup/original/${file}`, text);
function edit(file, fn) { source.set(file, fn(source.get(file))); }
function cut(text, start, end, replacement = '') {
  const a = text.indexOf(start); const b = text.indexOf(end, a + start.length);
  if (a < 0 || b < 0) throw new Error(`Cannot locate ${start} ... ${end}`);
  return text.slice(0, a) + replacement + text.slice(b);
}
const mapping = {
  'src/App.js': 'src/app/App.js',
  'src/App.test.js': 'src/app/App.test.js',
  'src/FAQ.js': 'src/app/FAQ.js',
  'src/Menu/FloatingMenu.js': 'src/app/navigation/FloatingMenu.js',
  'src/Menu/FloatingMenu.css': 'src/app/navigation/FloatingMenu.css',
  'src/Menu/FloatingMenu.test.js': 'src/app/navigation/FloatingMenu.test.js',
  'src/Menu/FloatingSelectionPanel.js': 'src/app/navigation/DateSelectionPanel.js',
  'src/Menu/Subtract.svg': 'src/app/navigation/RoundedCorner.svg',
  'src/Menu/FloatingChatPanel.js': 'src/features/chat/ChatPanel.js',
  'src/ControlsPanel.js': 'src/features/settings/SettingsPanel.js',
  'src/HideLectures.js': 'src/features/settings/FilterToggle.js',
  'src/ViewModeSwitch.js': 'src/features/settings/ViewModeSwitch.js',
  'src/hooks/useSettings.js': 'src/features/settings/useSettings.js',
  'src/EventCard.js': 'src/features/schedule/components/EventCard.js',
  'src/EventTooltipWrapper.js': 'src/features/schedule/components/EventTooltipWrapper.js',
  'src/ExternalGroupSelectionManager.js': 'src/features/schedule/components/ExternalGroupSelections.js',
  'src/GroupFiltersPanel.js': 'src/features/schedule/components/GroupFiltersPanel.js',
  'src/GroupInput.js': 'src/features/schedule/components/GroupInput.js',
  'src/GroupSetManager.js': 'src/features/schedule/components/GroupSetManager.js',
  'src/View/DayView.js': 'src/features/schedule/components/DayView.js',
  'src/View/WeekView.js': 'src/features/schedule/components/WeekView.js',
  'src/View/ViewStyles.css': 'src/features/schedule/components/ScheduleView.css',
  'src/ExportPngBtn.js': 'src/features/schedule/export/ExportPngButton.js',
  'src/exportICS.js': 'src/features/schedule/export/exportICS.js',
  'src/hooks/useScheduleManager.js': 'src/features/schedule/hooks/useScheduleManager.js',
  'src/hooks/useScheduleManager.test.js': 'src/features/schedule/hooks/useScheduleManager.test.js',
  'src/hooks/useDateHelpers.js': 'src/features/schedule/hooks/useDateHelpers.js',
  'src/hooks/useEventFiltering.js': 'src/features/schedule/logic/filterEvents.js',
  'src/timeSlotUtils.js': 'src/features/schedule/logic/timeSlots.js',
  'src/utils/eventLayout.js': 'src/features/schedule/logic/eventLayout.js',
  'src/utils.js': 'src/features/schedule/logic/teacherDisplay.js',
  'src/utils/dateUtils.js': 'src/utils/date.js',
  'src/timetables/index.js': 'src/features/schedule/data/timetableApi.js',
  'src/myPlanApi.js': 'src/features/my-plan/myPlanApi.js',
  'src/hooks/useFirebaseAuth.js': 'src/features/auth/useFirebaseAuth.js',
  'src/hooks/useUserId.js': 'src/features/auth/useGuestId.js',
  'src/firebase/firebaseClient.js': 'src/lib/firebaseClient.js',
  'src/firebaseClient.js': 'src/lib/firebaseClient.js',
  'src/supabaseClient.js': 'src/lib/supabaseClient.js',
  'src/index.css': 'src/styles/global.css',
};
for (const f of files.filter(f => f.startsWith('src/chatbot/'))) mapping[f] = f.replace('src/chatbot/', 'src/features/chat/');
const removed = new Set(['src/App.css', 'src/logo.svg', 'src/reportWebVitals.js', 'src/firebaseClient.js']);

edit('src/index.js', s => s.replace("import reportWebVitals from './reportWebVitals';\n", '').split('// If you want to start measuring performance')[0].trimEnd() + '\n');
edit('src/firebase/firebaseClient.js', s => s.replace('getApps, initializeApp', 'getApp, getApps, initializeApp').replaceAll(/process\.env\.(REACT_APP_\w+),/g, 'String(process.env.$1 || "").trim(),').replace('getApps()[0]', 'getApp()'));

// Keep the active filtering algorithm; eliminate state/cache that has no consumer.
edit('src/hooks/useEventFiltering.js', s => {
  let body = s.slice(s.indexOf('    // 1)'), s.indexOf('\n  }, []);'));
  body = cut(body, '    const selectedLectoratRaw', '    const selectedLekLanguageCode');
  body = cut(body, '    const matchesSelectedLectorat', '    const matchesLectoratLanguage');
  body = cut(body, '        const shouldFilterLectoratBySubjectOnly', '        // jeśli');
  body = body.replace('          if (\n            !shouldFilterLectoratBySubjectOnly &&\n            !shouldFilterLectoratByLanguageOnly\n          ) {', '          if (!shouldFilterLectoratByLanguageOnly) {');
  body = body.replace(/\n        if \(shouldFilterLectoratBySubjectOnly\) \{\n          if \(!matchesSelectedLectorat\(ev\)\) continue;\n        \}/, '');
  body = cut(body, '    const normalizeIso', '    const hasExactWeekContext');
  body = body.replaceAll('normalizeIso(targetDate)', 'toIsoDate(targetDate)').replace(/^  /gm, '');
  return 'import { timeToMinutes } from "../utils/time";\nimport { toIsoDate } from "../utils/dateUtils";\n\nfunction isLecture(event) {\n  return event.type?.toLowerCase() === "wykład";\n}\n\nexport function filterEvents(schedule, groups, hideLectures, showAll, weekStartDate) {\n' + body + '\n}\n';
});
edit('src/App.js', s => {
  s = s.replace('import { useEventFiltering }', 'import { filterEvents }');
  s = cut(s, '  const [selectedLectoratBySchedule', '  // Schedule and group management');
  s = s.replaceAll(/^[ \t]*selectedLectoratBySchedule[: ,].*\n/gm, '');
  s = cut(s, '      if (\n        savedSettings.selectedLectoratBySchedule', '    }\n\n    setSettingsReady');
  s = cut(s, '  const lektoratOptions', '  useEffect(() => {\n    const clamped');
  s = cut(s, '  // Event filtering with caching', '  const buildMergedEvents');
  s = s.replaceAll('computeFiltered', 'filterEvents').replaceAll(/^[ \t]*selectedLectoratSubject,\n/gm, '');
  s = cut(s, '    filtering: {', '    scheduleState: {');
  s = cut(s, '    lektoratState: {', '    exportState: {');
  s = s.replaceAll(/^[ \t]*scheduleGroups,\n/gm, '');
  return s;
});
edit('src/Menu/FloatingMenu.js', s => {
  s = s.replace('  filtering,\n', '').replace('  lektoratState,\n', '').replace('  const { computeFiltered } = filtering || {};\n', '');
  s = cut(s, '  const {\n    lektoratOptions', '  const { exportRef }');
  s = cut(s, '        lektoratState={{', '        exportState={{');
  return s.replace('          computeFiltered,\n', '').replace('  const aiButtonRef = useRef(null);\n', '').replace('ref={aiButtonRef} ', '');
});
edit('src/ControlsPanel.js', s => {
  s = 'import { filterEvents } from "./hooks/useEventFiltering";\n' + s;
  s = s.replace('  lektoratState,\n', '').replace('    computeFiltered,\n', '');
  s = cut(s, '  const {\n    shouldShowLectoratSelect', '  const { exportRef,');
  s = s.replaceAll('computeFiltered(', 'filterEvents(').replaceAll(/^[ \t]*(selectedLectoratSubject,|shouldShowLectoratSelect=|selectedLectoratSubject=|onLectoratChange=|lektoratOptions=).*\n/gm, '');
  s = s.replace('                compact\n', '');
  return s;
});
edit('src/GroupFiltersPanel.js', s => {
  s = cut(s, '  shouldShowLectoratSelect,', '}) {');
  return cut(s, '      {shouldShowLectoratSelect ?', '    </div>\n  );');
});
edit('src/GroupSetManager.js', s => {
  s = s.replace('  compact = false,\n', '');
  s = s.slice(0, s.indexOf('  // Desktop layout'));
  s = s.replace('  // Mobile compact layout\n  if (compact) {\n', '');
  const start = s.indexOf('    return (');
  s = s.slice(0, start) + s.slice(start).replace(/^  /gm, '');
  return s.trimEnd() + '\n';
});
for (const f of ['src/EventCard.js', 'src/EventTooltipWrapper.js']) edit(f, s => s.replace(/\{\/\*\s+\{ev\.type \?[\s\S]*?\*\/\}/g, ''));
edit('src/ExportPngBtn.js', s => s.replace('toPng /*, toJpeg */', 'toPng'));
edit('src/timeSlotUtils.js', s => s.slice(s.indexOf('export function createTimeSlots'), s.indexOf('export function getEventsForSlot')).trimEnd() + '\n');
edit('src/utils.js', s => s.slice(s.indexOf('const teacherNormalizationRules')).replace('export function normalizeTeacherDisplay', 'function normalizeTeacherDisplay'));
source.set('src/utils/time.js', 'export function timeToMinutes(time) {\n  const [hours, minutes] = time.split(":").map(Number);\n  return hours * 60 + minutes;\n}\n');
edit('src/utils/dateUtils.js', s => s.slice(0, s.indexOf('export function isLecture')) + '\nexport function toIsoDate(date) {\n  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";\n  const year = String(date.getFullYear());\n  const month = String(date.getMonth() + 1).padStart(2, "0");\n  const day = String(date.getDate()).padStart(2, "0");\n  return `${year}-${month}-${day}`;\n}\n');
edit('src/timetables/index.js', s => {
  s = s.replace('export const allTimetables = [];\nexport const defaultTimetable = null;\n', '');
  return cut(s, 'export function getCachedTimetableInfoById', 'export function isCachedTimetableStale');
});
edit('src/hooks/useScheduleManager.js', s => cut(s, '  // Flatten active groups by schedule', '  // Expose schedule entries').replace('    scheduleGroups,\n', ''));
edit('src/View/ViewStyles.css', s => s.replace(/\.week-header \{[^}]+\}\n/g, '').replace(/\n  \/\* Android Chrome[^\n]+\n  /, '\n').replace(/\.event-container,\n\.day-event-container \{[^}]+\}\n/, ''));
edit('src/View/WeekView.js', s => s.replace(/\n        \.hour-even \{[^}]+\}\n/, '\n'));
edit('src/chatbot/n8nClient.js', s => s.replace('export class ChatbotApiError', 'class ChatbotApiError'));

// Update identifiers alongside renamed files (including imports and test mocks).
const names = { ControlsPanel: 'SettingsPanel', HideLectures: 'FilterToggle', ExportPngBtn: 'ExportPngButton', ExternalGroupSelectionManager: 'ExternalGroupSelections', FloatingSelectionPanel: 'DateSelectionPanel', FloatingChatPanel: 'ChatPanel', useUserId: 'useGuestId' };
function resolve(file, ref) {
  const base = path.posix.normalize(path.posix.join(path.posix.dirname(file), ref));
  return [base, base + '.js', base + '/index.js'].find(f => source.has(f));
}
for (const [file, original] of source) {
  if (removed.has(file)) continue;
  let text = original;
  const dest = mapping[file] || file;
  if (file.endsWith('.js')) {
    const ast = parser.parse(text, { sourceType: 'module', plugins: ['jsx'] });
    const replacements = [];
    traverse(ast, { StringLiteral(p) {
      const ref = p.node.value;
      if (!ref.startsWith('.')) return;
      let target = resolve(file, ref);
      if (!target) return;
      if (target === 'src/utils.js' && p.parentPath.isImportDeclaration() && p.parentPath.node.specifiers.some(s => s.imported?.name === 'timeToMinutes')) target = 'src/utils/time.js';
      let newRef = path.posix.relative(path.posix.dirname(dest), mapping[target] || target);
      if (newRef.endsWith('.js')) newRef = newRef.slice(0, -3);
      if (!newRef.startsWith('.')) newRef = './' + newRef;
      replacements.push({ start: p.node.start, end: p.node.end, value: JSON.stringify(newRef) });
    }});
    for (const r of replacements.sort((a,b) => b.start-a.start)) text = text.slice(0,r.start)+r.value+text.slice(r.end);
    for (const [oldName,newName] of Object.entries(names)) text = text.replaceAll(new RegExp(`\\b${oldName}\\b`, 'g'), newName);
    parser.parse(text, { sourceType: 'module', plugins: ['jsx'] });
  }
  write(dest, text);
}
for (const f of files.filter(f => f.startsWith('src/'))) if (removed.has(f) || mapping[f] && mapping[f] !== f) fs.unlinkSync(full(f));
fs.unlinkSync(full('postcss.config.js'));
fs.mkdirSync(full('data/imports'), { recursive: true });
fs.renameSync(full('events.csv'), full('data/imports/events.csv'));
console.log('Source reorganized; originals retained temporarily for equivalence checks.');
