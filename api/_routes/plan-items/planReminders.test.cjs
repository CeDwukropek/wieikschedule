const test=require('node:test'),assert=require('node:assert/strict');
const r=require('../../_lib/planReminders');

test('Warsaw wall-clock times become the right instants on both sides of the October DST change',()=>{
  assert.equal(r.warsawInstant('2026-10-24','18:00').toISOString(),'2026-10-24T16:00:00.000Z');
  assert.equal(r.warsawInstant('2026-10-25','18:00').toISOString(),'2026-10-25T17:00:00.000Z');
  assert.equal(r.warsawInstant('2026-03-29','09:00').toISOString(),'2026-03-29T07:00:00.000Z');
});

test('reminders follow the kind: the evening before and an hour before a kolokwium, none by the hour for a day-long deadline',()=>{
  const settings=r.effectiveReminders();
  const quiz={kind:'kolokwium',timing:'class',date:'2026-10-26',start_time:'09:15:00'};
  assert.deepEqual(r.reminderTimes(quiz,settings.kolokwium),['2026-10-25T17:00:00.000Z','2026-10-26T07:15:00.000Z']);
  const report={kind:'sprawozdanie',timing:'due',date:'2026-10-28',due_time:null};
  assert.deepEqual(r.reminderTimes(report,[{days_before:1,at:'18:00'},{minutes_before:60}]),['2026-10-27T17:00:00.000Z']);
  assert.deepEqual(r.reminderTimes({...report,due_time:'23:59:00'},[{minutes_before:60}]),['2026-10-28T21:59:00.000Z']);
  assert.deepEqual(r.reminderTimes(quiz,[]),[]);
});

test('own settings replace the defaults of the kinds they name and are checked',()=>{
  assert.deepEqual(r.validateReminders({kolokwium:[{days_before:2,at:'20:00'},{days_before:2,at:'20:00'}],inne:[]}),
    {kolokwium:[{days_before:2,at:'20:00'}],inne:[]});
  assert.deepEqual(r.effectiveReminders({inne:[]}).inne,[]);
  assert.deepEqual(r.effectiveReminders({inne:[]}).kolokwium,r.DEFAULT_REMINDERS.kolokwium);
  for(const bad of [{kolos:[]},{kolokwium:[{days_before:15,at:'18:00'}]},{kolokwium:[{minutes_before:2}]},
    {kolokwium:[{days_before:1}]},{kolokwium:[{days_before:1,at:'18:00',note:'x'}]},{kolokwium:new Array(4).fill({minutes_before:30})},[]])
    assert.throws(()=>r.validateReminders(bad),{code:'INVALID_REMINDERS'},JSON.stringify(bad));
});
