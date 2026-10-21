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
// Chainable Supabase double: every builder call is recorded, awaiting resolves the table handler.
function chainDb(handlers){
  const calls=[];
  return {calls,rpc:async(name,args)=>{calls.push(['rpc',name,args]);return handlers.rpc(name,args);},
    from(table){
      const query={table,ops:[]};calls.push(query);
      const chain=new Proxy({},{get(_,key){
        if(key==='then'){const result=handlers[table](query);return (resolve,reject)=>Promise.resolve(result).then(resolve,reject);}
        return (...args)=>{query.ops.push([key,...args]);return chain;};
      }});
      return chain;
    }};
}
const EVENT='00000000-0000-0000-0000-0000000000aa';
const link={id:'11111111-1111-1111-1111-111111111111',faculty:'EiAs3'};
function changeFixture({rowExtra={},previous=null,replay=[]}={}){
  const plan=[row(EVENT,'2026-10-19','L1',rowExtra),row('00000000-0000-0000-0000-0000000000bb','2026-10-19','L2')];
  const db=chainDb({
    schedule_change_proposals:()=>({data:replay,error:null}),
    schedule_overrides:()=>({data:previous,error:null}),
    user_added_events:()=>({data:[{id:'x'}],error:null}),
    rpc:(name,args)=>name==='propose_schedule_change'
      ?{data:{id:'22222222-2222-2222-2222-222222222222',event_id:args.p_event_id,operation:args.p_operation,action:args.p_action,patch:args.p_patch,
        provider:args.p_provider,session_id:args.p_session_id,expected_event:plan[0],expected_override:previous},error:null}
      :{data:{event_id:EVENT,operation:'upsert'},error:null},
  });
  const deps={load:async(ctx,scope,options)=>{assert.deepEqual(options,{includeCancelled:true});return {source:plan,events:plan};},
    selectionOf:async()=>({selection})};
  const version=sync.occurrence(plan[0]).version;
  return {db,deps,version,ctx:{db,userId:'u'}};
}
const body=(version,extra={})=>({event_id:EVENT,operation:'modify',values:{start_time:'12:00:00'},expected_version:version,request_id:'req-12345678',...extra});
test('calendar changes are validated before touching data',()=>{
  const ok=body('0123456789abcdef');
  assert.equal(sync.validateCalendarChange(ok).mode,'apply');
  for(const bad of [{operation:'delete'},{expected_version:'x'},{request_id:'a'},{values:{subject:'X'}},{values:{}},{mode:'force'},
    {operation:'cancel'},{operation:'remove_added',values:undefined,mode:'propose'}])
    assert.throws(()=>sync.validateCalendarChange({...ok,...bad}),error=>error.statusCode===422);
  assert.equal(sync.validateCalendarChange({...ok,operation:'cancel',values:undefined}).operation,'cancel');
});
test('an own edit is applied at once and keeps earlier private changes of other fields',async()=>{
  const f=changeFixture({previous:{action:'modify',patch:{room:'A2'}}});
  const result=await sync.calendarChange(f.ctx,link,body(f.version,{values:{start_time:'12:00:00',room:''}}),f.deps);
  assert.equal(result.status,'applied');
  const [propose,confirm]=f.db.calls.filter(call=>call[0]==='rpc');
  assert.equal(propose[1],'propose_schedule_change');
  assert.deepEqual(propose[2].p_patch,{room:null,start_time:'12:00:00'});
  assert.equal(propose[2].p_provider,'odysseus-calendar');
  assert.equal(propose[2].p_session_id,`cal:${link.id}:req-12345678`);
  assert.deepEqual([confirm[1],confirm[2].p_provider,confirm[2].p_session_id],['confirm_schedule_change','odysseus-calendar',propose[2].p_session_id]);
});
test('a stale calendar version is a conflict and nothing is proposed',async()=>{
  const f=changeFixture();
  await assert.rejects(sync.calendarChange(f.ctx,link,body('0000000000000000'),f.deps),{code:'PLAN_CHANGED',statusCode:409});
  assert.equal(f.db.calls.filter(call=>call[0]==='rpc').length,0);
});
test('a retried request returns the applied result instead of changing the plan twice',async()=>{
  const f=changeFixture({replay:[{id:'p',result:{event_id:EVENT},consumed_at:'now'}]});
  const result=await sync.calendarChange(f.ctx,link,body(f.version),{...f.deps,load:async()=>{throw new Error('must not load');}});
  assert.deepEqual(result,{status:'applied',replayed:true,result:{event_id:EVENT}});
});
test('agent previews are not confirmed; other groups and wrong operations are refused',async()=>{
  let f=changeFixture();
  const preview=await sync.calendarChange(f.ctx,link,body(f.version,{mode:'propose'}),f.deps);
  assert.equal(preview.status,'proposed');
  assert.deepEqual(f.db.calls.filter(call=>call[0]==='rpc').map(call=>call[1]),['propose_schedule_change']);
  f=changeFixture();
  await assert.rejects(sync.calendarChange(f.ctx,link,{...body(f.version),event_id:'00000000-0000-0000-0000-0000000000bb'},f.deps),{code:'NOT_IN_PLAN'});
  await assert.rejects(sync.calendarChange(f.ctx,link,{...body(f.version),operation:'restore',values:undefined},f.deps),{code:'NOTHING_TO_RESTORE'});
  await assert.rejects(sync.calendarChange(f.ctx,link,{...body(f.version),operation:'remove_added',values:undefined},f.deps),{code:'NOT_ADDED'});
  f=changeFixture({rowExtra:{is_added:true}});
  await assert.rejects(sync.calendarChange(f.ctx,link,{...body(f.version),operation:'cancel',values:undefined},f.deps),{code:'ADDED_EVENT'});
  await assert.rejects(sync.calendarChange(f.ctx,link,{...body(f.version),operation:'remove',values:undefined,mode:'propose'},f.deps),{code:'INVALID_MODE'});
  const removed=await sync.calendarChange(f.ctx,link,{...body(f.version),operation:'remove',values:undefined},f.deps);
  assert.equal(removed.result.operation,'remove_added');
  const update=f.db.calls.find(call=>call.table==='user_added_events');
  assert.deepEqual(update.ops.filter(op=>op[0]==='eq'),[['eq','user_id','u'],['eq','event_id',EVENT],['eq','schedule_name','EiAs3'],['eq','status','active']]);
});
test('a link can only confirm previews it created itself',async()=>{
  const db=chainDb({schedule_change_proposals:()=>({data:{session_id:'cal:other-link:req-1'},error:null}),rpc:()=>({data:{},error:null})});
  await assert.rejects(sync.confirmCalendarProposal({db,userId:'u'},link,{proposal_id:'22222222-2222-2222-2222-222222222222'}),{code:'NOT_FOUND'});
  assert.equal(db.calls.filter(call=>call[0]==='rpc').length,0);
});
test('deleting a regular class in the calendar becomes a private cancellation',async()=>{
  const f=changeFixture();
  assert.equal((await sync.calendarChange(f.ctx,link,{...body(f.version),operation:'remove',values:undefined},f.deps)).status,'applied');
  const propose=f.db.calls.find(call=>call[0]==='rpc');
  assert.deepEqual([propose[2].p_operation,propose[2].p_action,propose[2].p_patch],['upsert','cancel',{}]);
});
test('a link lists and declines only the previews it created',async()=>{
  const queries=[];
  const db=chainDb({schedule_change_proposals:query=>{queries.push(query);
    return query.ops.some(op=>op[0]==='update')?{data:[{id:'p'}],error:null}:{data:[],error:null};}});
  await sync.listCalendarProposals({db,userId:'u'},link);
  assert.deepEqual(queries[0].ops.find(op=>op[0]==='like'),['like','session_id',`cal:${link.id}:%`]);
  assert.deepEqual(queries[0].ops.find(op=>op[0]==='in'),['in','provider',['odysseus-calendar']]);
  assert.deepEqual(await sync.rejectCalendarProposal({db,userId:'u'},link,{proposal_id:'22222222-2222-2222-2222-222222222222'}),{rejected:true});
  const update=queries[1].ops;
  assert.ok(update.some(op=>op[0]==='like'&&op[2]===`cal:${link.id}:%`));
  assert.ok(update.some(op=>op[0]==='is'&&op[1]==='consumed_at'));
  const none=chainDb({schedule_change_proposals:()=>({data:[],error:null})});
  await assert.rejects(sync.rejectCalendarProposal({db:none,userId:'u'},link,{proposal_id:'22222222-2222-2222-2222-222222222222'}),{code:'NOT_FOUND'});
});
