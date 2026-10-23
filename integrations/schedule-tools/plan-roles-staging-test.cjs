"use strict";
// The starosta panel (E6.5) through the real API handlers, PostgREST and database of the local staging: invites,
// roles, and the history of changes with its role-only authors and undo. Explicit test-process auth stub; never
// imported by server.cjs. Synthetic rows are removed.
const assert=require('node:assert/strict'),crypto=require('node:crypto'),path=require('node:path');
const root=process.cwd();
if(process.env.SCHEDULE_ENVIRONMENT!=='staging'||process.env.SUPABASE_URL!=='http://127.0.0.1:3100/supabase')throw new Error('Only local staging allowed');
const {getSupabaseAdminClient}=require(path.join(root,'api/_lib/supabaseAdmin'));
const schedule=require(path.join(root,'api/_lib/schedule'));
let current=null;
const authFile=require.resolve(path.join(root,'api/_lib/requestAuth'));
require.cache[authFile]={id:authFile,filename:authFile,loaded:true,exports:{verifyRequestUser:async()=>({uid:current})}};
const router=require(path.join(root,'api/plan-items/[action].js'));
async function call(who,action,method,payload){
  current=who;
  const res={setHeader(){},status(value){this.code=value;return this;},json(value){this.body=value;return this;}};
  await router({method,url:'/api/plan-items/'+action,query:method==='GET'?payload:{},body:method==='GET'?undefined:payload,
    headers:{authorization:'Bearer synthetic'}},res);
  return res;
}
const ok=(res,label)=>{assert.equal(res.code,200,label+': '+JSON.stringify(res.body));return res.body;};
(async()=>{
  const db=getSupabaseAdminClient();
  const {data:marker,error:markerError}=await db.from('staging_marker').select('name').single();
  assert.ifError(markerError);assert.equal(marker.name,'wieikschedule-local-staging');
  const suffix=crypto.randomUUID(),uid=name=>`synthetic-roles-${name}-${suffix}`;
  const ids={},created=[];
  try{
    for(const name of ['admin','starosta','leader','other','student'])ids[name]=(await schedule.context(uid(name))).userId;
    const {error:adminError}=await db.from('plan_roles').insert({user_id:ids.admin,role:'admin'});assert.ifError(adminError);
    const today=new Date().toISOString().slice(0,10);
    const {data:event,error}=await db.from('events').select('*').eq('status','aktywne').not('source_system','is',null)
      .like('group','L%').gte('date',today).order('date').limit(1).single();
    assert.ifError(error);
    const {data:other,error:otherError}=await db.from('events').select('group').eq('faculty',event.faculty).like('group','L%').neq('group',event.group).limit(1).single();
    assert.ifError(otherError);
    // A starosta from the admin, a group starosta from the starosta, and one for another group.
    const starostaCode=ok(await call(uid('admin'),'invite','POST',{role:'starosta',faculty:event.faculty}),'admin invite').invite.code;
    ok(await call(uid('starosta'),'redeem','POST',{code:starostaCode}),'starosta redeem');
    const leaderCode=ok(await call(uid('starosta'),'invite','POST',{role:'group_starosta',faculty:event.faculty,group:event.group}),'invite').invite.code;
    ok(await call(uid('leader'),'redeem','POST',{code:leaderCode}),'leader redeem');
    const otherCode=ok(await call(uid('starosta'),'invite','POST',{role:'group_starosta',faculty:event.faculty,group:other.group}),'invite 2').invite.code;
    ok(await call(uid('other'),'redeem','POST',{code:otherCode}),'other redeem');
    const managed=ok(await call(uid('starosta'),'roles','GET',{}),'roles').managed;
    assert.ok(managed.some(role=>role.group===event.group&&!role.mine));assert.ok(!/user_id/.test(JSON.stringify(managed)));

    // The group starosta adds, edits and removes an entry of their group.
    const base={scope:'group',faculty:event.faculty,subject:event.subject,group:event.group,kind:'kolokwium',timing:'due',date:event.date,due_time:null,title:'Kolokwium'};
    const item=ok(await call(uid('leader'),'save','POST',{items:[base]}),'create').items[0];created.push(item.id);
    const edited=ok(await call(uid('leader'),'save','POST',{items:[{id:item.id,revision:item.revision,title:'Kolokwium 1'}]}),'edit').items[0];
    const [removed]=ok(await call(uid('leader'),'remove','POST',{items:[{id:edited.id,revision:edited.revision}]}),'remove').items;

    // The starosta sees all three changes, newest first, authors by role only.
    let changes=ok(await call(uid('starosta'),'history','GET',{faculty:event.faculty}),'history').changes.filter(change=>change.item_id===item.id);
    assert.deepEqual(changes.map(change=>[change.operation,change.actor]),
      [['delete',`starosta grupy ${event.group}`],['update',`starosta grupy ${event.group}`],['create',`starosta grupy ${event.group}`]]);
    assert.deepEqual([changes[1].previous.title,changes[1].item.title],['Kolokwium','Kolokwium 1']);
    assert.deepEqual(changes[0].current,{revision:removed.revision,deleted:true});
    // The author sees themselves; another group's starosta does not see this group; students see nothing.
    assert.equal(ok(await call(uid('leader'),'history','GET',{faculty:event.faculty}),'own history').changes.find(change=>change.item_id===item.id).actor,'Ty');
    assert.ok(!ok(await call(uid('other'),'history','GET',{faculty:event.faculty}),'other history').changes.some(change=>change.item_id===item.id));
    const res=await call(uid('student'),'history','GET',{faculty:event.faculty});
    assert.deepEqual([res.code,res.body.error],[403,'FORBIDDEN']);
    assert.ok(!/synthetic|user_id|actor_id|owner_id/.test(JSON.stringify(changes)));

    // Undo from the history: the removal, then the edit, each only as the latest change.
    ok(await call(uid('starosta'),'remove','POST',{items:[{id:item.id,revision:changes[0].revision}],restore:true}),'restore');
    changes=ok(await call(uid('starosta'),'history','GET',{faculty:event.faculty}),'history 2').changes.filter(change=>change.item_id===item.id);
    assert.deepEqual([changes[0].operation,changes[0].actor],['restore','Ty']);
    assert.equal(ok(await call(uid('leader'),'history','GET',{faculty:event.faculty}),'leader view').changes.find(change=>change.item_id===item.id).actor,'starosta');
    const latest=changes[0].revision,previous=changes.find(change=>change.operation==='update').previous;
    const undone=ok(await call(uid('starosta'),'save','POST',{items:[{id:item.id,revision:latest,title:previous.title,kind:previous.kind,
      details:previous.details,subject:previous.subject,group:previous.group,timing:'due',date:previous.date,due_time:previous.due_time,
      start_time:null,duration_min:null}]}),'undo edit').items[0];
    assert.equal(undone.title,'Kolokwium');
    console.log('plan roles staging test passed');
  }finally{
    if(created.length)await db.from('plan_items').delete().in('id',created);
    const owners=Object.values(ids);
    if(owners.length){
      await db.from('plan_role_invites').delete().in('created_by',owners);
      await db.from('plan_roles').delete().in('user_id',owners);
      await db.from('users').delete().in('id',owners);
    }
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
