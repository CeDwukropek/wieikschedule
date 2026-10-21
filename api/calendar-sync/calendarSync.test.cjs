const test=require('node:test'),assert=require('node:assert/strict');
const sync=require('../_lib/calendarSync');
const {loadPlan}=require('../_lib/scheduleQueries');
const row=(id,date,group,extra={})=>({id,date,group,faculty:'EiAs3',subject:'Modelowanie układów dynamicznych',type:'Laboratorium',
  start_time:'07:30:00',duration_min:90,room:'12',instructor:'Test Instructor',status:'aktywne',is_added:false,override_revision:0,override_action:null,...extra});
const selection={faculty:'EiAs3',groups:{L:'L1'}};
const window={date_from:'2026-10-01',date_to:'2026-10-31'};
test('pairing codes are typed by hand, normalized and hashed; tokens have a fixed shape',()=>{
  const code=sync.newCode();
  assert.match(code,/^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  assert.equal(sync.codeHash(code.toLowerCase().replace(/-/g,' ')),sync.codeHash(code));
  assert.throws(()=>sync.codeHash('ABCD-EFGH-IJKL'),{code:'INVALID_CODE'});
  const token=sync.newToken();
  assert.match(sync.tokenHash(token),/^[0-9a-f]{64}$/);
  assert.notEqual(sync.tokenHash(token),sync.tokenHash(sync.newToken()));
  for(const bad of ['', 'eyJ.firebase.jwt', token.slice(0,-1), null])assert.throws(()=>sync.tokenHash(bad),{code:'LINK_INVALID'});
});
test('link follows the current content of its named group set',async()=>{
  const link={firebase_uid:'uid-a',faculty:'EiAs3',group_set_id:'set-2'};
  const settings=groups=>({scheduleGroupSets:{EiAs3:{sets:[{id:'set-1',name:'Mój',groups:{L:'L9'}},{id:'set-2',name:'Plan',groups,
    externalSelections:[{scheduleId:'EiAs1',groupType:'C',groupValue:'C2',subjectKey:'MAT',subjectName:'Matematyka'},{scheduleId:'EiAs1',groupType:'',groupValue:''}]}]}}});
  let read=async uid=>{assert.equal(uid,'uid-a');return settings({L:'L1'});};
  const first=await sync.linkSelection(link,read);
  assert.equal(first.name,'Plan');
  assert.deepEqual(first.selection,{faculty:'EiAs3',groups:{L:'L1'},external:[{faculty:'EiAs1',groups:{C:'C2'},subject:'Matematyka'}]});
  read=async()=>settings({L:'L4'});
  assert.deepEqual((await sync.linkSelection(link,read)).selection.groups,{L:'L4'});
  await assert.rejects(sync.linkSelection({...link,group_set_id:'gone'},read),{code:'GROUP_SET_MISSING'});
  await assert.rejects(sync.linkSelection(link,async()=>({})),{code:'GROUP_SET_MISSING'});
  const legacy=settings({L:'L1'});delete legacy.scheduleGroupSets.EiAs3.sets[1].externalSelections[0].subjectName;
  await assert.rejects(sync.linkSelection(link,async()=>legacy),{code:'SELECTION_NEEDS_REFRESH'});
});
test('feed range defaults around today and is bounded',()=>{
  const now=new Date('2026-10-21T10:00:00Z');
  assert.deepEqual(sync.feedRange({},now),{date_from:'2026-10-07',date_to:'2027-03-20'});
  assert.deepEqual(sync.feedRange({from:'2026-10-01',to:'2026-10-02'},now),{date_from:'2026-10-01',date_to:'2026-10-02'});
  assert.throws(()=>sync.feedRange({from:'2026-10-02',to:'2026-10-01'},now),{code:'INVALID_RANGE'});
  assert.throws(()=>sync.feedRange({from:'2026-01-01',to:'2026-12-31'},now),{code:'INVALID_RANGE'});
  assert.throws(()=>sync.feedRange({from:'2026-02-30'},now),{code:'INVALID_DATE'});
});
test('feed contains only the user plan with cancellations, days off, private changes and makeup classes',async()=>{
  const rows=[row('own','2026-10-05','L1'),row('other','2026-10-05','L2'),row('added','2026-10-06','L3',{is_added:true}),
    row('moved','2026-10-07','L1',{start_time:'12:00:00',override_action:'modify',override_revision:2}),
    row('cancelled','2026-10-08','L1',{override_action:'cancel',override_revision:1}),
    row('free','2026-10-09',null,{status:'wolne',subject:'Dzień wolny',type:null}),row('late','2026-11-02','L1')];
  const load=async(ctx,scope,options)=>{assert.deepEqual(options,{includeCancelled:true});return {source:rows,events:rows};};
  const feed=await sync.buildFeed({},selection,window,load);
  const byId=Object.fromEntries(feed.events.map(item=>[item.event_id,item]));
  assert.deepEqual(Object.keys(byId),['own','added','moved','cancelled','free']);
  assert.equal(byId.own.status,'scheduled');assert.equal(byId.own.kind,'laboratory');
  assert.equal(byId.added.added,true);
  assert.equal(byId.moved.modified,true);assert.equal(byId.moved.start_time,'12:00:00');assert.equal(byId.moved.override_revision,2);
  assert.equal(byId.cancelled.status,'cancelled');
  assert.equal(byId.free.status,'day_off');
  const again=await sync.buildFeed({},selection,window,load);
  assert.equal(again.version,feed.version);
  rows[0].room='13';
  const changed=await sync.buildFeed({},selection,window,load);
  assert.notEqual(changed.version,feed.version);
  assert.notEqual(changed.events[0].version,feed.events[0].version);
  await assert.rejects(sync.buildFeed({},{faculty:'Other',groups:{}},window,load),{code:'DATA_UNAVAILABLE'});
});
function fakeDb(tables){
  return {from(name){
    const query={select:()=>query,in:()=>query,or:()=>query,order:()=>query,eq:()=>query,
      range:async()=>({data:tables[name],error:null})};
    return query;
  }};
}
test('loadPlan keeps cancelled rows only for calendar mirrors',async()=>{
  const source=[row('a','2026-10-05','L1'),row('b','2026-10-06','L1')];
  for(const item of source){delete item.is_added;delete item.override_revision;delete item.override_action;}
  const ctx={userId:'u',db:fakeDb({events:source,user_added_events:[],
    schedule_overrides:[{event_id:'b',action:'cancel',patch:{},revision:3,events:source[1]}]})};
  assert.deepEqual((await loadPlan(ctx,selection)).events.map(item=>item.id),['a']);
  assert.equal((await loadPlan(ctx,selection)).events[0].override_action,undefined);
  const mirror=await loadPlan(ctx,selection,{includeCancelled:true});
  assert.deepEqual(mirror.events.map(item=>[item.id,item.override_action,item.override_revision]),[['a',null,0],['b','cancel',3]]);
});
test('invalid link tokens are rejected before any database access',async()=>{
  let touched=false;
  const handler=sync.linkEndpoint('GET',async()=>({}),()=>{touched=true;return {};});
  const response={headers:{},setHeader(key,value){this.headers[key]=value;},status(code){this.code=code;return this;},json(body){this.body=body;}};
  await handler({method:'GET',headers:{authorization:'Bearer eyJ.firebase.jwt'}},response);
  assert.equal(response.code,401);assert.equal(response.body.error,'LINK_INVALID');assert.equal(touched,false);
  await handler({method:'POST',headers:{}},response);
  assert.equal(response.code,405);
});
test('a revoked or expired link is reported as invalid, not as an empty plan',async()=>{
  const db={rpc:async()=>({data:null,error:{code:'P0002'}})};
  const handler=sync.linkEndpoint('GET',async()=>({events:[]}),()=>db);
  const response={setHeader(){},status(code){this.code=code;return this;},json(body){this.body=body;}};
  await handler({method:'GET',headers:{authorization:'Bearer '+sync.newToken()}},response);
  assert.equal(response.code,401);assert.equal(response.body.error,'LINK_INVALID');assert.equal(response.body.events,undefined);
});
