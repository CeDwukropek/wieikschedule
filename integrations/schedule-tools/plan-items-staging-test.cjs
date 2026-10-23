"use strict";
// Plan entries and roles through the real API handlers, PostgREST and database of the local staging.
// Explicit test-process auth stub; never imported by server.cjs or production. Synthetic rows are removed.
const assert=require('node:assert/strict'),crypto=require('node:crypto'),path=require('node:path');
const root=process.cwd();
if(process.env.SCHEDULE_ENVIRONMENT!=='staging'||process.env.SUPABASE_URL!=='http://127.0.0.1:3100/supabase')throw new Error('Only local staging allowed');
const {getSupabaseAdminClient}=require(path.join(root,'api/_lib/supabaseAdmin'));
const schedule=require(path.join(root,'api/_lib/schedule'));
const {feedEntries}=require(path.join(root,'api/_lib/planItems'));
let current=null;
const authFile=require.resolve(path.join(root,'api/_lib/requestAuth'));
require.cache[authFile]={id:authFile,filename:authFile,loaded:true,exports:{verifyRequestUser:async()=>({uid:current})}};
const router=require(path.join(root,'api/plan-items/[action].js'));
async function call(who,action,method,payload){
  current=who;
  const res={setHeader(){},status(value){this.code=value;return this;},json(value){this.body=value;return this;}};
  const query=method==='GET'?{...payload}:{};
  await router({method,url:'/api/plan-items/'+action,query,body:method==='GET'?undefined:payload,headers:who?{authorization:'Bearer synthetic'}:{}},res);
  return res;
}
const ok=(res,label)=>{assert.equal(res.code,200,label+': '+JSON.stringify(res.body));return res.body;};
(async()=>{
  const db=getSupabaseAdminClient();
  const {data:marker,error:markerError}=await db.from('staging_marker').select('name').single();
  assert.ifError(markerError);assert.equal(marker.name,'wieikschedule-local-staging');
  const suffix=crypto.randomUUID(),uid=name=>`synthetic-items-${name}-${suffix}`;
  const people=['admin','starosta','leader','student'],ids={},created=[];
  try{
    for(const name of people)ids[name]=(await schedule.context(uid(name))).userId;
    const {error:adminError}=await db.from('plan_roles').insert({user_id:ids.admin,role:'admin'});assert.ifError(adminError);
    const today=new Date().toISOString().slice(0,10);
    const {data:event,error}=await db.from('events').select('*').eq('status','aktywne').not('source_system','is',null)
      .like('group','L%').gte('date',today).order('date').limit(1).single();
    assert.ifError(error);
    const range={faculties:event.faculty,from:event.date,to:event.date};

    // Roles by invite codes.
    let res=await call(uid('student'),'invite','POST',{role:'starosta',faculty:event.faculty});
    assert.deepEqual([res.code,res.body.error],[403,'FORBIDDEN']);
    const starostaCode=ok(await call(uid('admin'),'invite','POST',{role:'starosta',faculty:event.faculty}),'admin invite').invite.code;
    ok(await call(uid('starosta'),'redeem','POST',{code:starostaCode.toLowerCase()}),'starosta redeem');
    res=await call(uid('leader'),'redeem','POST',{code:starostaCode});
    assert.deepEqual([res.code,res.body.error],[404,'INVITE_INVALID']);
    const leaderCode=ok(await call(uid('starosta'),'invite','POST',{role:'group_starosta',faculty:event.faculty,group:event.group}),'group invite').invite.code;
    const leaderRole=ok(await call(uid('leader'),'redeem','POST',{code:leaderCode}),'leader redeem').role;
    const managed=ok(await call(uid('starosta'),'roles','GET',{}),'roles').managed;
    assert.ok(managed.some(role=>role.id===leaderRole.id&&!role.mine));
    assert.ok(!JSON.stringify(managed).includes(ids.leader));

    // Entries.
    const quiz={scope:'group',faculty:event.faculty,kind:'kolokwium',timing:'class',event_id:event.id,title:'Kolokwium (test)'};
    res=await call(uid('student'),'save','POST',{items:[quiz]});
    assert.deepEqual([res.code,res.body.error],[403,'FORBIDDEN']);
    const saved=ok(await call(uid('leader'),'save','POST',{items:[quiz]}),'leader save').items[0];created.push(saved.id);
    assert.equal(saved.date,event.date);assert.ok(!('author_id' in saved));
    res=await call(uid('leader'),'save','POST',{items:[quiz]});
    assert.deepEqual([res.code,res.body.error],[409,'DUPLICATE']);
    res=await call(uid('leader'),'save','POST',{items:[{id:saved.id,revision:99,title:'Stare'}]});
    assert.deepEqual([res.code,res.body.error],[409,'CHANGED']);
    res=await call(uid('student'),'save','POST',{items:[{scope:'personal',faculty:event.faculty,kind:'inne',timing:'slot',
      date:event.date,start_time:'21:30',duration_min:60,title:'Za późno'}]});
    assert.deepEqual([res.code,res.body.error],[422,'OUTSIDE_HOURS']);
    const own=ok(await call(uid('student'),'save','POST',{items:[{scope:'personal',faculty:event.faculty,kind:'inne',timing:'due',
      date:event.date,title:'Własny termin'}]}),'personal save').items[0];created.push(own.id);

    // Who sees what.
    const guest=ok(await call(null,'list','GET',range),'guest list');
    assert.ok(guest.items.some(item=>item.id===saved.id&&!item.can_edit&&item.my_state===null));
    assert.ok(!guest.items.some(item=>item.id===own.id));
    assert.ok(!JSON.stringify(guest).match(/author_id|owner_id|updated_by/));
    const student=ok(await call(uid('student'),'list','GET',range),'student list');
    assert.deepEqual(student.items.filter(item=>created.includes(item.id)).map(item=>[item.id,item.can_edit]).sort(),
      [[saved.id,false],[own.id,true]].sort());
    assert.ok(ok(await call(uid('leader'),'list','GET',range),'leader list').items.find(item=>item.id===saved.id).can_edit);

    // Personal state, the calendar mirror and undo.
    ok(await call(uid('student'),'state','POST',{item_id:saved.id,progress:'ready'}),'state');
    const mirror=await feedEntries({db,userId:ids.student},{faculty:event.faculty,groups:{L:event.group}},
      {date_from:event.date,date_to:event.date},[{faculty:event.faculty,subject:event.subject}]);
    assert.deepEqual(mirror.filter(item=>created.includes(item.id)).map(item=>[item.id,item.progress]).sort(),
      [[saved.id,'ready'],[own.id,'todo']].sort());
    const removed=ok(await call(uid('leader'),'remove','POST',{items:[{id:saved.id,revision:saved.revision}]}),'remove').items;
    assert.ok(!ok(await call(null,'list','GET',range),'after remove').items.some(item=>item.id===saved.id));
    ok(await call(uid('leader'),'remove','POST',{items:removed,restore:true}),'undo');
    assert.ok(ok(await call(null,'list','GET',range),'after undo').items.some(item=>item.id===saved.id));

    // A revoked group starosta can no longer write.
    ok(await call(uid('starosta'),'revoke','POST',{role_id:leaderRole.id}),'revoke');
    const fresh=ok(await call(uid('student'),'list','GET',range),'refresh').items.find(item=>item.id===saved.id);
    res=await call(uid('leader'),'save','POST',{items:[{id:saved.id,revision:fresh.revision,title:'Po odebraniu roli'}]});
    assert.deepEqual([res.code,res.body.error],[404,'NOT_FOUND']);
    console.log('plan items staging test passed');
  }finally{
    if(created.length)await db.from('plan_items').delete().in('id',created);
    const owners=Object.values(ids);
    if(owners.length)await db.from('users').delete().in('id',owners);
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
