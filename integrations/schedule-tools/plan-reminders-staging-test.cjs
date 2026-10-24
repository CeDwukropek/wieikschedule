"use strict";
// Reminder settings and the calendar feed (E6.8) through the real API code, PostgREST and database of the local
// staging: defaults, own settings, the reminder instants of an entry in the feed, a finished entry without reminders,
// and a feed fingerprint that follows the settings. Explicit test-process auth stub. Synthetic rows are removed.
const assert=require('node:assert/strict'),crypto=require('node:crypto'),path=require('node:path');
const root=process.cwd();
if(process.env.SCHEDULE_ENVIRONMENT!=='staging'||process.env.SUPABASE_URL!=='http://127.0.0.1:3100/supabase')throw new Error('Only local staging allowed');
const {getSupabaseAdminClient}=require(path.join(root,'api/_lib/supabaseAdmin'));
const schedule=require(path.join(root,'api/_lib/schedule'));
const sync=require(path.join(root,'api/_lib/calendarSync'));
let current=null;
const authFile=require.resolve(path.join(root,'api/_lib/requestAuth'));
require.cache[authFile]={id:authFile,filename:authFile,loaded:true,exports:{verifyRequestUser:async()=>({uid:current})}};
const router=require(path.join(root,'api/plan-items/[action].js'));
async function call(who,action,method,body){current=who;
  const res={setHeader(){},status(value){this.code=value;return this;},json(value){this.body=value;return this;}};
  await router({method,url:'/api/plan-items/'+action,query:{},body,headers:{authorization:'Bearer synthetic'}},res);return res;}
const ok=(res,label)=>{assert.equal(res.code,200,label+': '+JSON.stringify(res.body));return res.body;};
(async()=>{
  const db=getSupabaseAdminClient();
  const {data:marker,error:markerError}=await db.from('staging_marker').select('name').single();
  assert.ifError(markerError);assert.equal(marker.name,'wieikschedule-local-staging');
  const firebase='synthetic-reminders-'+crypto.randomUUID();
  const ctx=await schedule.context(firebase);
  try{
    const defaults=ok(await call(firebase,'preferences','GET'),'defaults');
    assert.equal(defaults.custom,false);
    assert.deepEqual(defaults.reminders.kolokwium,[{days_before:1,at:'18:00'},{minutes_before:60}]);
    // A future lab of one group and a private kolokwium on it.
    const today=new Date().toISOString().slice(0,10);
    const {data:lab,error}=await db.from('events').select('id,faculty,group,date,start_time').eq('status','aktywne').like('source_key','["stac",%')
      .like('group','L%').gte('date',today).order('date').limit(1).single();
    assert.ifError(error);
    const saved=ok(await call(firebase,'save','POST',{items:[{scope:'personal',faculty:lab.faculty,kind:'kolokwium',title:'Kolokwium test',
      timing:'class',event_id:lab.id}]}),'save').items[0];
    const prefix=lab.group.match(/^[^\d]+/)[0];
    const selection={faculty:lab.faculty,groups:{[prefix]:lab.group}},window={date_from:lab.date,date_to:lab.date};
    const before=await sync.feedFingerprint(ctx,selection,window);
    let feed=await sync.buildFeed(ctx,selection,window);
    let entry=feed.entries.find(item=>item.id===saved.id);
    assert.equal(entry.reminders.length,2,'Defaults: the evening before and an hour before');
    assert.ok(entry.reminders.every(at=>/Z$/.test(at)));
    // Own settings: one reminder two days before; the fingerprint and the feed version follow.
    const own=ok(await call(firebase,'save-preferences','POST',{reminders:{kolokwium:[{days_before:2,at:'20:00'}]}}),'own');
    assert.equal(own.custom,true);
    const after=await sync.feedFingerprint(ctx,selection,window);
    assert.notEqual(after,before);
    const versionBefore=feed.version;
    feed=await sync.buildFeed(ctx,selection,window);
    entry=feed.entries.find(item=>item.id===saved.id);
    assert.equal(entry.reminders.length,1);assert.notEqual(feed.version,versionBefore);
    // A finished entry has no reminders.
    ok(await call(firebase,'state','POST',{item_id:saved.id,progress:'done'}),'done');
    feed=await sync.buildFeed(ctx,selection,window);
    assert.deepEqual(feed.entries.find(item=>item.id===saved.id).reminders,[]);
    // Invalid settings are refused; null restores the defaults.
    assert.equal((await call(firebase,'save-preferences','POST',{reminders:{kolokwium:[{minutes_before:1}]}})).code,422);
    assert.equal(ok(await call(firebase,'save-preferences','POST',{reminders:null}),'reset').custom,false);
    console.log('plan reminders staging test passed');
  }finally{
    await db.from('plan_items').delete().eq('owner_id',ctx.userId);
    await db.from('users').delete().eq('id',ctx.userId);
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
