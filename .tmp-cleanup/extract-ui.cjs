const fs = require('fs');
const read = f => fs.readFileSync(f, 'utf8');
const write = (f,s) => fs.writeFileSync(f,s);
let panel = read('src/features/settings/SettingsPanel.js');
const start = panel.indexOf('  const handleExportICS');
const end = panel.indexOf('  return (\n    <>', start);
panel = panel.slice(0,start) + `  const handleExportICS = () => exportICS(selectExportEvents({
    schedule, groups: studentGroups, hideLectures, showAll,
    externalSelections, timetables: loadedTimetables,
  }));

` + panel.slice(end);
panel = panel.replace('import { filterEvents } from "../schedule/logic/filterEvents";', 'import { selectExportEvents } from "../schedule/export/selectExportEvents";');
const icon = panel.slice(panel.indexOf('function GoogleIcon'), panel.indexOf('export default function'));
const authStart = panel.indexOf('  const {\n    user,');
const authEnd = panel.indexOf('  const scheduleOptions', authStart);
const auth = panel.slice(authStart, authEnd);
const uiStart = panel.indexOf('            <div className="space-y-2">');
const uiEnd = panel.indexOf('            {/* Schedule selector */}', uiStart);
const ui = panel.slice(uiStart,uiEnd).trim().replace(/^            /gm, '    ');
write('src/features/auth/GoogleSignInButton.js', `import { LogOut } from "lucide-react";
import { useFirebaseAuth } from "./useFirebaseAuth";

${icon}export default function GoogleSignInButton() {
${auth}  return (
    ${ui}
  );
}
`);
panel = panel.slice(0,uiStart) + '            <GoogleSignInButton />\n\n' + panel.slice(uiEnd);
panel = panel.slice(0,authStart) + panel.slice(authEnd);
panel = panel.slice(0,panel.indexOf('function GoogleIcon')) + panel.slice(panel.indexOf('export default function'));
panel = panel.replace(', LogOut', '').replace('import { useFirebaseAuth } from "../auth/useFirebaseAuth";', 'import GoogleSignInButton from "../auth/GoogleSignInButton";');
write('src/features/settings/SettingsPanel.js', panel);

let css = read('src/app/navigation/FloatingMenu.css');
const a = css.indexOf('.dock-chat-panel {'); const b = css.indexOf('.dock-selection-reveal {',a);
write('src/features/chat/ChatPanel.css', css.slice(a,b));
write('src/app/navigation/FloatingMenu.css', css.slice(0,a)+css.slice(b));
write('src/features/chat/ChatPanel.js', 'import "./ChatPanel.css";\n'+read('src/features/chat/ChatPanel.js'));
let slot = read('src/features/chat/SlotChoiceCard.js');
slot = 'import { addMinutes, normalizeTime } from "../../utils/time";\n' + slot.slice(0, slot.indexOf('function timeToMinutes')) + slot.slice(slot.indexOf('function formatDate'));
slot = slot.slice(0,slot.indexOf('function normalizeStartTime')) + slot.slice(slot.indexOf('export default function'));
slot = slot.replace('normalizeStartTime(slot?.start_time)', 'normalizeTime(slot?.start_time)');
write('src/features/chat/SlotChoiceCard.js', slot);
