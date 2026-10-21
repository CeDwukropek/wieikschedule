import {describeChange,describeSlot,dialogEventFromItem,mergePatch,moveChanges,startTimeOptions,validateMove} from './planEditing';
const row={date:'2026-10-19',start_time:'07:30:00',duration_min:90,room:'A2',instructor:'T'};
test('a new edit keeps earlier private changes of other fields',()=>{
  expect(mergePatch({action:'modify',patch:{room:'B1'}},{start_time:'12:00:00'})).toEqual({room:'B1',start_time:'12:00:00'});
  expect(mergePatch({action:'cancel',patch:{}},{room:'C'})).toEqual({room:'C'});
  expect(mergePatch(undefined,{room:'C'})).toEqual({room:'C'});
});
test('a move sends only what changed, with the length taken from the end time',()=>{
  expect(moveChanges(row,{date:'2026-10-19',start:'07:30',end:'09:00',instructor:'T'})).toEqual({});
  expect(moveChanges(row,{date:'2026-10-22',start:'12:00',end:'13:30',instructor:'T'})).toEqual({date:'2026-10-22',start_time:'12:00:00'});
  expect(moveChanges(row,{date:'2026-10-19',start:'07:30',end:'10:00',instructor:' '})).toEqual({duration_min:150,instructor:null});
});
test('moves are limited to weekdays, the plan range and 07:00–22:00',()=>{
  const bounds={min:'2026-10-01',max:'2027-02-01'};
  expect(validateMove({date:'2026-10-22',start:'12:00',end:'13:30'},bounds)).toBe('');
  expect(validateMove({date:'2026-10-24',start:'12:00',end:'13:30'},bounds)).toMatch(/poniedziałku do piątku/);
  expect(validateMove({date:'2027-03-01',start:'12:00',end:'13:30'},bounds)).toMatch(/poza zakresem/);
  expect(validateMove({date:'2026-10-22',start:'06:30',end:'08:00'},bounds)).toMatch(/07:00/);
  expect(validateMove({date:'2026-10-22',start:'21:00',end:'22:30'},bounds)).toMatch(/22:00/);
  expect(validateMove({date:'2026-10-22',start:'12:00',end:'11:00'},bounds)).toMatch(/po rozpoczęciu/);
});
test('changes and slots are described in plain words',()=>{
  expect(describeSlot(row)).toBe('pon 19.10 · 07:30–09:00 · A2');
  expect(describeChange(row,{...row,date:'2026-10-22',start_time:'12:00:00'})).toBe('pon 19.10 07:30–09:00 → czw 22.10 12:00–13:30');
  expect(describeChange(row,{...row,room:'C3'})).toBe('sala A2 → C3');
  expect(describeChange(row,null)).toBe('odwołane u Ciebie');
});
test('start options follow the university grid and include the class time',()=>{
  expect(startTimeOptions([{start_time:'09:15:00'},{start_time:'07:30:00'},{start_time:'09:15:00'},{start_time:'06:00:00'}],'12:10'))
    .toEqual(['07:30','09:15','12:10']);
});
test('a plan entry opens as a calendar event with its current time',()=>{
  const ev=dialogEventFromItem({kind:'modified',event_id:'e',subject:'MUD',type:'Lab',group:'L1',original:row,
    current:{...row,start_time:'12:00:00'},override:{action:'modify'}});
  expect([ev.event_id,ev.start,ev.end,ev.origin,ev.personal_override]).toEqual(['e','12:00','13:30','base',true]);
});
