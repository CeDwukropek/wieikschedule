import {applyPersonalOverrides,effectiveTimetables,effectiveAddedEvents} from './effectiveSchedule';
import {normalizeTimetable} from '../schedule/data/normalizeTimetable';
import {mapAddedEvent} from './eventMappers';
import {selectExportEvents} from '../schedule/export/selectExportEvents';
import {buildICS} from '../schedule/export/exportICS';
const source={id:'uuid-a',faculty:'TEST',date:'2026-10-12',start_time:'09:00:00',duration_min:90,subject:'Math',room:'1',instructor:'Teacher',type:'wykład',group:'W',status:'aktywne'};
test('private projection preserves source, null, dates and does not pollute public cache',()=>{
 const base=normalizeTimetable('TEST',[source]);
 const personal=effectiveTimetables({TEST:base},[{event_id:source.id,action:'modify',patch:{room:null,date:'2027-02-08'}}]).TEST;
 expect(personal.schedule[0].room).toBe('');expect(personal.schedule[0].dates).toEqual(['2027-02-08']);
 expect(personal.maxDate).toBe('2027-02-08');expect(base.rawRows[0].room).toBe('1');expect(base.schedule[0].dates).toEqual(['2026-10-12']);
 expect(applyPersonalOverrides([source],[{event_id:source.id,action:'modify',patch:{instructor:null}}])[0].room).toBe('1');
});
test('cancel applies to external copies and added events; off-screen additions are exported once',()=>{
 const other={...source,id:'uuid-b',date:'2026-12-14'};
 const added=[mapAddedEvent({...other,event_id:other.id,added_event_id:'addition'})];
 const cancellation=[{event_id:source.id,action:'cancel',patch:{}}];
 const tables=effectiveTimetables({TEST:normalizeTimetable('TEST',[source])},cancellation);
 const events=selectExportEvents({schedule:tables.TEST.schedule,showAll:true,groups:{},addedEvents:effectiveAddedEvents(added,cancellation)});
 expect(events.map(e=>e.event_id)).toEqual(['uuid-b']);
 expect(buildICS(events)).toContain('DTSTART:20261214T090000');
 expect(effectiveAddedEvents([mapAddedEvent({...source,event_id:source.id})],cancellation)).toEqual([]);
});
test('ICS UID survives moving and UI reindexing',()=>{
 const base=normalizeTimetable('TEST',[source]).schedule;
 const moved=normalizeTimetable('TEST',applyPersonalOverrides([source],[{event_id:source.id,action:'modify',patch:{date:'2026-10-19'}}])).schedule;
 expect(buildICS(base).match(/UID:.+/)[0]).toBe(buildICS(moved).match(/UID:.+/)[0]);
 expect(buildICS(moved)).toContain('SUMMARY:Math');
});
