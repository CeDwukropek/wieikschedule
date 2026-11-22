import {applyPersonalOverrides,effectiveTimetables,effectiveAddedEvents} from './effectiveSchedule';
import {ghostEvents,groupChangeItems} from './planEditing';
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
test('a starosta\'s change shows for the whole group, under one\'s own change; cancelled or moved ones are faded for that group only',()=>{
 const lab={...source,id:'uuid-lab',type:'laboratorium',group:'L1',date:'2026-10-13'};
 const moved={event_id:lab.id,faculty:'TEST',action:'modify',patch:{date:'2026-10-14',room:'B2'}};
 const cancelled={event_id:source.id,faculty:'TEST',action:'cancel',patch:{}};
 const [row]=applyPersonalOverrides([lab],[],[moved]);
 expect([row.date,row.room,row.group_override,row.personal_override]).toEqual(['2026-10-14','B2',true,undefined]);
 // One's own change wins over the group's: here another room, and a class the group cancelled kept privately.
 expect(applyPersonalOverrides([lab],[{event_id:lab.id,action:'modify',patch:{room:'C3'}}],[moved])[0]).toMatchObject({date:'2026-10-14',room:'C3'});
 expect(applyPersonalOverrides([source],[],[cancelled])).toEqual([]);
 expect(applyPersonalOverrides([source],[{event_id:source.id,action:'modify',patch:{room:'D4'}}],[cancelled])[0].room).toBe('D4');
 const items=groupChangeItems([moved,cancelled,{...moved,faculty:'OTHER'}],[source,lab],'TEST');
 expect(items.map(item=>[item.kind,item.original.date,item.current?.date??null])).toEqual([['modified','2026-10-13','2026-10-14'],['cancelled','2026-10-12',null]]);
 const week=new Date(2026,9,12);
 const forGroup=groups=>ghostEvents(items,{faculties:['TEST'],weekStart:week,forGroup:true,groups,showAll:false}).map(tile=>[tile.ghost,tile.ghostFor]);
 expect(forGroup({L:'L1'})).toEqual([['moved-from','group'],['cancelled','group']]);
 expect(forGroup({L:'L2'})).toEqual([['cancelled','group']]);
});
