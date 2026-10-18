const test=require('node:test'),assert=require('node:assert/strict');
const {resolveSubject,eventKind,belongsToUser}=require('../_lib/scheduleSearch');
const {queryPlan,clock}=require('../_lib/scheduleQueries');
const {validateSelection}=require('../_lib/scheduleSelection');
const name='Modelowanie układów dynamicznych';
const row=(id,date,group,type='Labolatorium Komputerowe',subject=name,time='07:30:00')=>({id,date,group,type,subject,start_time:time,duration_min:90,faculty:'EiAs3',status:'aktywne',room:'12',instructor:'Test Instructor'});
const rows=[row('a','2026-10-19','Lk1'),row('b','2026-10-19','Lk5',undefined,undefined,'09:15:00'),row('c','2026-10-26','Lk2'),row('d','2026-11-02','Lk1'),row('e','2026-10-20','W','Wykład')];
const selection={faculty:'EiAs3',groups:{Lk:'Lk1',C:'C1',L:'L1',Lek:'Lek1'}};
const data={source:rows,events:rows,bounds:{date_from:'2026-10-19',date_to:'2026-11-02'}};
const now=new Date('2026-10-16T07:00:00Z');
const call=(tool,args={},scope=selection,fixture=data)=>queryPlan({},scope,'schedule.'+tool,args,now,async()=>fixture);
test('subject resolution separates labs, Polish inflection, accents and source misspelling',()=>{
 for(const query of ['Modelowania układów dynamicznych lab','laby z modelowania ukladow dynamicznych','MUD']){
  const result=resolveSubject(rows,query);assert.equal(result.status,'resolved');assert.equal(result.subject,name);
 }
 assert.equal(resolveSubject(rows,'kiedy mam najbliższe laby z Modelowania układów dynamicznych?').kind,'laboratory');
 assert.equal(eventKind('Labolatorium Komputerowe'),'laboratory');
 assert.equal(eventKind('Laboratorium'),'laboratory');
 assert.equal(eventKind('Ćwiczenia'),'exercise');
});
test('ambiguity and typos require a real catalogue choice instead of guessing',()=>{
 const catalogue=[...rows,row('x','2026-10-20','C1','Ćwiczenia','Modelowanie statystyczne')];
 const ambiguous=resolveSubject(catalogue,'Modelowanie');assert.equal(ambiguous.status,'ambiguous_subject');assert.equal(ambiguous.candidates.length,2);
 assert.equal(resolveSubject(rows,'Modelowannie ukladow dynamicznych').status,'ambiguous_subject');
 assert.equal(resolveSubject(rows,'Nieistniejący przedmiot').status,'subject_not_found');
 assert.equal(resolveSubject(rows,'MUD wyklad','laboratory').status,'ambiguous_kind');
});
test('nearest lab is picked by the signed group, across the entire available future plan',async()=>{
 const one=await call('get_next_occurrence',{query:'Modelowania układów dynamicznych lab'});
 assert.equal(one.status,'found');assert.equal(one.event.id,'a');assert.equal(one.event.date,'2026-10-19');
 const two=await call('get_next_occurrence',{query:'MUD',kind:'laboratory'},{...selection,groups:{Lk:'Lk2'}});
 assert.equal(two.event.id,'c');assert.equal(two.event.date,'2026-10-26');
 const cancelled={...data,events:rows.filter(row=>row.id!=='a')};
 const later=await call('get_next_occurrence',{query:'MUD',kind:'laboratory'},selection,cancelled);
 assert.equal(later.event.date,'2026-11-02');
});
test('missing groups, unknown subject, absent kind and no future event are different results',async()=>{
 assert.equal((await call('get_next_occurrence',{query:'MUD',kind:'laboratory'},{faculty:'EiAs3',groups:{}})).status,'missing_groups');
 assert.equal((await call('get_next_occurrence',{query:'xyz'})).status,'subject_not_found');
 assert.equal((await call('get_next_occurrence',{query:'MUD',kind:'project'})).status,'kind_not_found');
 const empty=await call('get_next_occurrence',{query:'MUD',kind:'laboratory',date_to:'2026-10-18'});
 assert.equal(empty.status,'outside_available_range');assert.equal(empty.event,undefined);
 const noClasses=await call('get_next_occurrence',{query:'MUD',kind:'laboratory',date_from:'2026-10-21',date_to:'2026-10-25'});
 assert.equal(noClasses.status,'no_upcoming_in_available_data');assert.equal(noClasses.event,null);
 assert.equal(empty.available_range.date_to,'2026-11-02');
 assert.equal((await call('find_makeup_options',{query:'MUD'})).status,'ambiguous_kind');
 assert.equal((await call('get_next_occurrence',{query:'MUD'},selection,{source:[],events:[],bounds:{date_from:null,date_to:null}})).status,'data_unavailable');
 const both={...data,events:[...rows,row('physical','2026-10-19','L1')]};
 assert.deepEqual((await call('get_next_occurrence',{query:'MUD',kind:'laboratory'},{...selection,groups:{Lk:'Lk1'}},both)).required_groups,['L']);
});
test('effective moves and additions are considered before picking the nearest date',async()=>{
 const changed={...data,events:[{...rows[0],date:'2026-10-27'}, {...rows[1],is_added:true},...rows.slice(2)].sort((a,b)=>a.date.localeCompare(b.date)||a.start_time.localeCompare(b.start_time))};
 const result=await call('get_next_occurrence',{query:'MUD',kind:'laboratory'},selection,changed);
 assert.equal(result.event.id,'b');assert.equal(result.event.is_added,true);
});
test('makeup options are real other-group occurrences with deterministic conflicts',async()=>{
 const extra=row('conflict','2026-10-19','C1','Ćwiczenia','Inny przedmiot','09:00:00');
 const result=await call('find_makeup_options',{query:'MUD',kind:'laboratory'},selection,{...data,source:[...rows,extra],events:[...rows,extra]});
 assert.equal(result.status,'found');assert.ok(result.slots.every(slot=>slot.id!=='a'&&slot.id!=='d'));
 const slot=result.slots.find(slot=>slot.event_id==='b');assert.equal(slot.conflict_status,'conflict');assert.equal(slot.conflicts[0].id,'conflict');
 assert.equal(result.slots.find(slot=>slot.id==='c').conflict_status,'free');
});
test('additional groups and subject filters participate in my plan and collision checks',async()=>{
 const external={...row('ext','2026-10-19','C2','Ćwiczenia','Inny przedmiot','09:00:00'),faculty:'Other'};
 const ignored={...external,id:'not-selected',subject:'Nie wybrano'};
 const scope={...selection,external:[{faculty:'Other',groups:{C:'C2'},subject:'Inny przedmiot'}]};
 const fixture={...data,source:[...rows,external,ignored],events:[...rows,external,ignored]};
 const plan=await call('get_my_schedule',{date_from:'2026-10-19'},scope,fixture);
 assert.ok(plan.events.some(row=>row.id==='ext'));assert.ok(!plan.events.some(row=>row.id==='not-selected'));
 const makeup=await call('find_makeup_options',{query:'MUD',kind:'laboratory'},scope,fixture);
 assert.equal(makeup.slots.find(row=>row.id==='b').conflict_status,'conflict');
 assert.equal(makeup.slots.find(row=>row.id==='b').conflicts[0].id,'ext');
 const sameFaculty={...selection,external:[{faculty:'EiAs3',groups:{Lk:'Lk5'},subject:name}]};
 const same=await call('get_my_schedule',{date_from:'2026-10-19'},sameFaculty);
 assert.ok(same.events.some(row=>row.id==='b'));
});
test('my schedule filters before pagination and errors never become an empty schedule',async()=>{
 const result=await call('get_my_schedule',{date_from:'2026-10-19',date_to:'2026-11-02',limit:1});
 assert.equal(result.total,3);assert.equal(result.next_offset,1);assert.equal(result.events[0].id,'a');
 await assert.rejects(queryPlan({},selection,'schedule.get_next_occurrence',{query:'MUD'},now,async()=>{throw Object.assign(new Error('unavailable'),{statusCode:503});}),{statusCode:503});
 await assert.rejects(call('get_next_occurrence',{query:'MUD',groups:{Lk:'Lk5'}}),{code:'INVALID_ARGUMENTS'});
 await assert.rejects(call('get_my_schedule',{date_from:'2026-02-30'}),{code:'INVALID_DATE'});
});
test('Warsaw midnight and class start time determine what is upcoming',async()=>{
 const midnight=new Date('2026-10-16T22:30:00Z');assert.equal(clock(midnight).date,'2026-10-17');
 const fixture={source:rows,events:[row('past','2026-10-17','Lk1',undefined,undefined,'00:15:00'),row('next','2026-10-17','Lk1')],bounds:data.bounds};
 const result=await queryPlan({},selection,'schedule.get_next_occurrence',{query:'MUD',kind:'laboratory'},midnight,async()=>fixture);
 assert.equal(result.event.id,'next');
});
test('only exercises excludes lectures, both lab spellings and language classes before pagination',async()=>{
 const exercises=[row('ex1','2026-10-20','C1','Ćwiczenia','Obwody'),row('ex2','2026-10-21','C1','Ćwiczenia','Pole')];
 const fixtures=[...rows,...exercises,row('lab','2026-10-20','L1','Laboratorium'),row('language','2026-10-20','Lek1','Lektorat')];
 const fixture={...data,source:fixtures,events:fixtures};
 // Missing L/Lk/Lek groups cannot block a query limited to exercises.
 const scope={faculty:'EiAs3',groups:{C:'C1'}};
 const args={date_from:'2026-10-19',date_to:'2026-10-23',kind:'exercise',limit:1};
 const first=await call('get_my_schedule',args,scope,fixture);
 assert.equal(first.total,2);assert.equal(first.next_offset,1);assert.deepEqual(first.events.map(row=>row.id),['ex1']);
 assert.equal(first.kind,'exercise');assert.ok(first.message.includes('**07:30–09:00**'));assert.ok(!first.message.includes('Wykład'));
 const second=await call('get_my_schedule',{...args,offset:1},scope,fixture);
 assert.deepEqual(second.events.map(row=>row.id),['ex2']);assert.equal(second.next_offset,null);
});
test('excluded kinds also filter additions and external groups without hiding an empty result',async()=>{
 const exercise=row('exercise','2026-10-19','C1','Ćwiczenia');
 const external={...row('ext-lab','2026-10-19','Lk5'),faculty:'Other'};
 const fixture={...data,source:[...rows,exercise,external],events:[...rows.map(row=>({...row,is_added:true})),exercise,external]};
 const scope={...selection,external:[{faculty:'Other',groups:{Lk:'Lk5'},subject:name}]};
 const args={date_from:'2026-10-19',date_to:'2026-10-23',exclude_kinds:['lecture','laboratory']};
 const result=await call('get_my_schedule',args,scope,fixture);
 assert.deepEqual(result.events.map(row=>row.id),['exercise']);assert.deepEqual(result.exclude_kinds,args.exclude_kinds);
 const empty=await call('get_my_schedule',{...args,kind:'project'},scope,fixture);
 assert.equal(empty.status,'no_events_in_available_data');assert.equal(empty.total,0);assert.equal(empty.next_offset,null);
 assert.match(empty.message,/filtr/);
});
test('invalid or injected kind filters fail before data access',async()=>{
 for(const args of [{kind:'Ćwiczenia'},{exclude_kinds:'lecture'},{exclude_kinds:['lecture','lecture']},{exclude_kinds:['unknown']},{kind:null}]){
  await assert.rejects(call('get_my_schedule',args),error=>error.statusCode===422);
 }
 const exercise=row('exercise','2026-10-19','C1','Ćwiczenia');
 const missing=await call('get_my_schedule',{date_from:'2026-10-19',kind:'exercise'},{faculty:'EiAs3',groups:{}},
   {...data,source:[exercise],events:[exercise]});
 assert.equal(missing.status,'missing_groups');assert.deepEqual(missing.required_groups,['C']);
});
test('group matching handles lectures, prefix groups, additions and language choices',()=>{
 assert.equal(belongsToUser(row('a','2026-10-19','Lk'),selection.groups),true);
 assert.equal(belongsToUser(row('a','2026-10-19','Lk5'),selection.groups),false);
 assert.equal(belongsToUser({...row('a','2026-10-19','Lk5'),is_added:true},{}),true);
 assert.equal(belongsToUser(row('a','2026-10-19','W','Wykład'),{}),true);
 assert.equal(belongsToUser(row('a','2026-10-19','Lek','Lektorat','Język niemiecki'),{Lek:'LekN'}),true);
 assert.equal(belongsToUser(row('a','2026-10-19','Lek1','Lektorat','Język angielski'),{Lek:'LekN'}),false);
});
test('selection rejects injected identities, invalid groups and oversized context',()=>{
 assert.deepEqual(validateSelection(selection),selection);
 assert.throws(()=>validateSelection({...selection,user_id:'someone'}),{code:'INVALID_ARGUMENTS'});
 assert.throws(()=>validateSelection({...selection,groups:[]}));
 assert.throws(()=>validateSelection({...selection,groups:{Lk:12}}));
});
