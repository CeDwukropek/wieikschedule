"use strict";
// The writes the app's entry form sends (E6.4: newItems, editItems, withRevisions, remove and restore), through
// the real API handlers, PostgREST and database of the local staging. The payload shapes are the ones the React
// tests check for the form. Explicit test-process auth stub; never imported by server.cjs. Synthetic rows are removed.
const assert=require('node:assert/strict'),crypto=require('node:crypto'),path=require('node:path');
const root=process.cwd();
if(process.env.SCHEDULE_ENVIRONMENT!=='staging'||process.env.SUPABASE_URL!=='http://127.0.0.1:3100/supabase')throw new Error('Only local staging allowed');
const {getSupabaseAdminClient}=require(path.join(root,'api/_lib/supabaseAdmin'));
const schedule=require(path.join(root,'api/_lib/schedule'));
let current=null;
const authFile=require.resolve(path.join(root,'api/_lib/requestAuth'));
require.cache[authFile]={id:authFile,filename:authFile,loaded:true,exports:{verifyRequestUser:async()=>({uid:current})}};
const router=require(path.join(root,'api/plan-items/[action].js'));
async function call(who,action,payload){
  current=who;
  const res={setHeader(){},status(value){this.code=value;return this;},json(value){this.body=value;return this;}};
  await router({method:'POST',url:'/api/plan-items/'+action,query:{},body:payload,headers:{authorization:'Bearer synthetic'}},res);
  return res;
}
const ok=(res,label)=>{assert.equal(res.code,200,label+': '+JSON.stringify(res.body));return res.body;};
const ref=({id,revision})=>({id,revision});
(async()=>{
  const db=getSupabaseAdminClient();
  const {data:marker,error:markerError}=await db.from('staging_marker').select('name').single();
  assert.ifError(markerError);assert.equal(marker.name,'wieikschedule-local-staging');
  const suffix=crypto.randomUUID(),uid=name=>`synthetic-editing-${name}-${suffix}`;
  const ids={},created=[];
  try{
    for(const name of ['starosta','student'])ids[name]=(await schedule.context(uid(name))).userId;
    const today=new Date().toISOString().slice(0,10);
    // A lab of one group and its next occurrence: what "Najbliższe zajęcia grupy" offers.
    const {data:first,error}=await db.from('events').select('*').eq('status','aktywne').not('source_system','is',null)
      .like('group','L%').gte('date',today).order('date').limit(1).single();
    assert.ifError(error);
    const {data:next,error:nextError}=await db.from('events').select('*').eq('status','aktywne').eq('faculty',first.faculty)
      .eq('subject',first.subject).eq('type',first.type).eq('group',first.group).gt('date',first.date).order('date').limit(1).single();
    assert.ifError(nextError);
    const {error:roleError}=await db.from('plan_roles').insert({user_id:ids.starosta,role:'starosta',faculty:first.faculty});assert.ifError(roleError);
    const base={faculty:first.faculty,kind:'kolokwium',title:'Kolokwium',details:'Rozdziały 1–3'};

    // From the class dialog: this and the next class, one series.
    const series=ok(await call(uid('starosta'),'save',{items:[{scope:'group',...base,timing:'class',event_id:first.id},
      {scope:'group',...base,timing:'class',event_id:next.id}]}),'class series').items;
    created.push(...series.map(item=>item.id));
    assert.equal(series[0].series_id,series[1].series_id);assert.ok(series[0].series_id);
    assert.deepEqual(series.map(item=>[item.date,item.group]),[[first.date,first.group],[next.date,next.group]]);

    // From a free slot: a group entry with subject and group, and a week later; and a student's private deadline.
    const later=new Date(Date.parse(first.date)+7*86400000).toISOString().slice(0,10);
    const slot={scope:'group',...base,kind:'poprawa',title:'Poprawa',subject:first.subject,group:first.group,timing:'slot',start_time:'09:00',duration_min:90,due_time:null};
    const own=ok(await call(uid('starosta'),'save',{items:[{...slot,date:first.date},{...slot,date:later}]}),'slot series').items;
    created.push(...own.map(item=>item.id));
    assert.equal(own[0].series_id,own[1].series_id);
    let res=await call(uid('starosta'),'save',{items:[{...slot,subject:'Nie ma takiego przedmiotu',date:first.date}]});
    assert.deepEqual([res.code,res.body.error],[422,'UNKNOWN_SUBJECT']);
    const report=ok(await call(uid('student'),'save',{items:[{scope:'personal',faculty:first.faculty,kind:'sprawozdanie',title:'Sprawozdanie',
      details:null,subject:first.subject,group:null,timing:'due',date:later,due_time:null,start_time:null,duration_min:null}]}),'private due').items[0];
    created.push(report.id);
    res=await call(uid('student'),'save',{items:[{scope:'group',...base,timing:'class',event_id:first.id}]});
    assert.deepEqual([res.code,res.body.error],[403,'FORBIDDEN']);

    // Editing "this and the following" and undoing it with the revisions the save returned.
    const edited=ok(await call(uid('starosta'),'save',{items:series.map(item=>({...ref(item),details:'Całość'}))}),'series edit').items;
    assert.deepEqual(edited.map(item=>[item.details,item.revision]),[['Całość',2],['Całość',2]]);
    const undone=ok(await call(uid('starosta'),'save',{items:edited.map(item=>({...ref(item),details:'Rozdziały 1–3'}))}),'undo edit').items;
    assert.deepEqual(undone.map(item=>item.details),['Rozdziały 1–3','Rozdziały 1–3']);
    // Moving the first kolokwium onto the class that already has one: a duplicate, nothing changes.
    res=await call(uid('starosta'),'save',{items:[{...ref(undone[0]),timing:'class',event_id:next.id}]});
    assert.deepEqual([res.code,res.body.error],[409,'DUPLICATE']);
    // A class entry moved to a time of its own and back (undo writes the class only).
    const moved=ok(await call(uid('starosta'),'save',{items:[{...ref(undone[0]),timing:'slot',date:later,start_time:'12:00',duration_min:60,due_time:null}]}),'to slot').items[0];
    assert.deepEqual([moved.timing,moved.event_id,moved.date,moved.start_time],['slot',null,later,'12:00:00']);
    const back=ok(await call(uid('starosta'),'save',{items:[{...ref(moved),timing:'class',event_id:first.id}]}),'back to class').items[0];
    assert.deepEqual([back.timing,back.event_id,back.date,back.state],['class',first.id,first.date,'active']);
    // A stale revision (another tab, another starosta) is refused instead of overwriting.
    res=await call(uid('starosta'),'save',{items:[{...ref(moved),title:'Stara wersja'}]});
    assert.deepEqual([res.code,res.body.error],[409,'CHANGED']);

    // Removing the whole series and restoring it from the toast.
    const removed=ok(await call(uid('starosta'),'remove',{items:[ref(back),ref(undone[1])]}),'remove series').items;
    const restored=ok(await call(uid('starosta'),'remove',{items:removed,restore:true}),'restore series').items;
    assert.equal(restored.length,2);
    const {data:alive,error:aliveError}=await db.from('plan_items').select('id').in('id',restored.map(item=>item.id)).is('deleted_at',null);
    assert.ifError(aliveError);assert.equal(alive.length,2);
    // A student cannot remove a group entry.
    res=await call(uid('student'),'remove',{items:[ref(own[0])]});
    assert.deepEqual([res.code,res.body.error],[404,'NOT_FOUND']);
    console.log('plan items editing staging test passed');
  }finally{
    if(created.length)await db.from('plan_items').delete().in('id',created);
    const owners=Object.values(ids);
    if(owners.length){await db.from('plan_roles').delete().in('user_id',owners);await db.from('users').delete().in('id',owners);}
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
