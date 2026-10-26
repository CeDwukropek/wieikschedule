"use strict";
// Private changes of a whole series (E6.6) through the real API code, PostgREST and database of the local staging:
// a real university series, one call, a replay, undo, and all-or-nothing on a stale occurrence. Synthetic rows are removed.
const assert=require('node:assert/strict'),crypto=require('node:crypto'),path=require('node:path');
const root=process.cwd();
if(process.env.SCHEDULE_ENVIRONMENT!=='staging'||process.env.SUPABASE_URL!=='http://127.0.0.1:3100/supabase')throw new Error('Only local staging allowed');
const {getSupabaseAdminClient}=require(path.join(root,'api/_lib/supabaseAdmin'));
const schedule=require(path.join(root,'api/_lib/schedule'));
(async()=>{
  const db=getSupabaseAdminClient();
  const {data:marker,error:markerError}=await db.from('staging_marker').select('name').single();
  assert.ifError(markerError);assert.equal(marker.name,'wieikschedule-local-staging');
  const ctx=await schedule.context('synthetic-batches-'+crypto.randomUUID());
  try{
    // The first future lab and the rest of its university series (same series id and group).
    const today=new Date().toISOString().slice(0,10);
    const {data:first,error}=await db.from('events').select('id,source_key,faculty').eq('status','aktywne').like('source_key','["stac",%')
      .like('group','L%').gte('date',today).order('date').limit(1).single();
    assert.ifError(error);
    const [,seriesId,,group]=JSON.parse(first.source_key);
    const {data:rows,error:rowsError}=await db.from('events').select('id,date,source_key').eq('faculty',first.faculty).eq('status','aktywne')
      .like('source_key',`["stac",${JSON.stringify(seriesId)},%`).order('date');
    assert.ifError(rowsError);
    const series=rows.filter(row=>JSON.parse(row.source_key)[3]===group).slice(0,3);
    assert.ok(series.length>=2,'Need a series with at least two occurrences');
    const cancel=series.map(row=>({event_id:row.id,operation:'upsert',action:'cancel',patch:{},reason:null}));

    const started=Date.now();
    const done=await schedule.applyBatch(ctx,{changes:cancel,request_id:'batch-'+crypto.randomUUID().slice(0,8)});
    assert.equal(done.results.length,series.length);
    assert.ok(done.undo.every(change=>change.operation==='delete'));
    const {data:after}=await db.from('schedule_overrides').select('event_id,action').eq('user_id',ctx.userId);
    assert.deepEqual(after.map(row=>row.action).sort(),series.map(()=>'cancel'));
    // A retried request (same id) changes nothing and returns the same undo.
    const requestId='batch-'+crypto.randomUUID().slice(0,8);
    const room=series.map(row=>({event_id:row.id,operation:'upsert',action:'modify',patch:{room:'B-batch'},reason:null}));
    const first1=await schedule.applyBatch(ctx,{changes:room,request_id:requestId});
    const again=await schedule.applyBatch(ctx,{changes:room,request_id:requestId});
    assert.equal(again.replayed,true);assert.deepEqual(again.undo,first1.undo);
    assert.ok(first1.undo.every(change=>change.action==='cancel'),'Undo returns the earlier cancellations');
    // One occurrence that cannot be changed (restoring a class without a private change) keeps the whole batch out.
    const {data:spare,error:spareError}=await db.from('events').select('id').eq('status','aktywne').not('source_system','is',null)
      .not('id','in',`(${series.map(row=>row.id).join(',')})`).limit(1).single();
    assert.ifError(spareError);
    const before=await db.from('schedule_overrides').select('event_id,action,patch').eq('user_id',ctx.userId).order('event_id');
    const t0=Date.now();
    await assert.rejects(schedule.applyBatch(ctx,{changes:[{event_id:series[0].id,operation:'delete'},{event_id:spare.id,operation:'delete'}],
      request_id:'batch-'+crypto.randomUUID().slice(0,8)}),error=>error.statusCode===404);
    assert.ok(Date.now()-t0<3000,'A refused batch must not hang');
    const unchanged=await db.from('schedule_overrides').select('event_id,action,patch').eq('user_id',ctx.userId).order('event_id');
    assert.deepEqual(unchanged.data,before.data);
    // Undo of the room change brings the cancellations back, in one call.
    const undone=await schedule.applyBatch(ctx,{changes:first1.undo,request_id:'batch-'+crypto.randomUUID().slice(0,8)});
    assert.equal(undone.results.length,series.length);
    const {data:restored}=await db.from('schedule_overrides').select('action').eq('user_id',ctx.userId);
    assert.ok(restored.every(row=>row.action==='cancel'));
    console.log(`schedule batches staging test passed (${series.length} occurrences, first batch ${Date.now()-started} ms total)`);
  }finally{
    await db.from('schedule_change_proposals').delete().eq('user_id',ctx.userId);
    await db.from('schedule_overrides').delete().eq('user_id',ctx.userId);
    await db.from('users').delete().eq('id',ctx.userId);
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
