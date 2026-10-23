const fs = require('fs');
const parser = require('@babel/parser');
const src = fs.readFileSync('src/features/schedule/hooks/useScheduleManager.js','utf8');
const ast = parser.parse(src,{sourceType:'module'});
const fn = ast.program.body.find(n => n.type==='ExportNamedDeclaration').declaration;
const take = n => src.slice(n.start,n.end);
const names = new Set(['timetableOptions','defaultScheduleId','currentSchedule','loadedTimetables','isScheduleLoading','isScheduleRefreshing','manualRefreshRef','isTimetableOptionsLoading','hasLoadedTimetableOptions','scheduleRefreshTick','scheduleLoadRequestIdRef','timetableOptionsMessage','failedScheduleLoadsRef','currentTimetable','timetableDataSourceLabel','handleRefreshSchedule','handleScheduleChange']);
const statements=[];
for(const n of fn.body.body){
 if(n.type==='VariableDeclaration'){
  const id=n.declarations[0].id; const name=id.name||id.elements?.[0]?.name;
  if(!names.has(name))continue;
  let text=take(n);
  if(name==='handleRefreshSchedule') text=text.replace('handleRefreshSchedule = useCallback(async () =>','refreshSchedules = useCallback(async (activeExternalSelections = []) =>').replace('[currentSchedule, activeExternalSelections]','[currentSchedule]');
  statements.push(text);
 }else if(n.type==='ExpressionStatement'&&n.expression.callee?.name==='useEffect'){
  let text=take(n);
  if(text.includes('setScheduleGroupSets((prev)'))continue;
  if(text.includes('lastHydratedSignatureRef')){
   statements.push(`useEffect(() => {
    if (savedSettings?.currentSchedule != null) setCurrentSchedule(savedSettings.currentSchedule);
  }, [savedSettings]);`);
  }else if(text.includes('referencedScheduleIds')){
   const body=take(n.expression.arguments[0].body);
   statements.push(`const loadExternalTimetables = useCallback((activeExternalSelections) => ${body}, [currentSchedule, loadedTimetables]);`);
  }else statements.push(text);
 }
}
const imports=src.slice(0,src.indexOf('// useScheduleManager'));
const output=imports+`export function useTimetableData(savedSettings) {\n  `+statements.join('\n\n  ')+`\n\n  return {
    timetableOptions, timetableOptionsMessage, timetableDataSourceLabel,
    currentSchedule, currentTimetable, loadedTimetables,
    isScheduleLoading, isScheduleRefreshing,
    refreshSchedules, loadExternalTimetables, handleScheduleChange,
    refreshTick: scheduleRefreshTick,
  };
}\n`;
parser.parse(output,{sourceType:'module'});
fs.writeFileSync('src/features/schedule/hooks/useTimetableData.js',output);
