"use strict";
// Conflicts reach the API through the real PostgREST of the local staging as a quick 409. SQLSTATE 40001
// made PostgREST retry the transaction without limit. Synthetic rows are removed.
const assert=require('node:assert/strict'),crypto=require('node:crypto'),path=require('node:path');
const root=process.cwd();
if(process.env.SCHEDULE_ENVIRONMENT!=='staging'||process.env.SUPABASE_URL!=='http://127.0.0.1:3100/supabase')throw new Error('Only local staging allowed');
const {getSupabaseAdminClient}=require(path.join(root,'api/_lib/supabaseAdmin'));
const schedule=require(path.join(root,'api/_lib/schedule'));
const timed=async(label,promise)=>{
  const started=Date.now();
  const result=await Promise.race([promise,new Promise(resolve=>setTimeout(()=>resolve({error:{code:'TIMEOUT'}}),3000))]);
  assert.equal(result.error?.code,'PT409',`${label}: ${JSON.stringify(result.error)}`);
  return Date.now()-started;
};
(async()=>{
  const db=getSupabaseAdminClient();
  const {data:marker,error:markerError}=await db.from('staging_marker').select('name').single();
  assert.ifError(markerError);assert.equal(marker.name,'wieikschedule-local-staging');
  const ctx=await schedule.context('synthetic-conflict-'+crypto.randomUUID());
  let item=null;
  try{
    const {data:event,error}=await db.from('events').select('id').eq('status','aktywne').not('source_system','is',null).limit(1).single();
    assert.ifError(error);
    const {data:proposal,error:proposeError}=await db.rpc('propose_schedule_change',{p_user_id:ctx.userId,p_event_id:event.id,
      p_operation:'upsert',p_action:'cancel',p_patch:{},p_reason:null,p_provider:'manual',p_session_id:'conflict-test'});
    assert.ifError(proposeError);
    await db.from('schedule_change_proposals').update({expires_at:new Date(Date.now()-1000).toISOString()}).eq('id',proposal.id);
    const expired=await timed('expired preview',db.rpc('confirm_schedule_change',{p_user_id:ctx.userId,p_proposal_id:proposal.id,
      p_provider:'manual',p_session_id:'conflict-test'}));
    const {data:saved,error:saveError}=await db.rpc('save_plan_items',{p_user:ctx.userId,p_items:[{scope:'personal',faculty:'Test',
      kind:'inne',timing:'due',date:new Date().toISOString().slice(0,10),title:'Konflikt'}]});
    assert.ifError(saveError);item=saved[0].id;
    const stale=await timed('stale entry',db.rpc('remove_plan_items',{p_user:ctx.userId,p_items:[{id:item,revision:99}],p_restore:false}));
    const update=await timed('stale update',db.rpc('save_plan_items',{p_user:ctx.userId,p_items:[{id:item,revision:99,title:'Stare'}]}));
    assert.throws(()=>schedule.databaseError({code:'PT409'}),{statusCode:409,code:'PLAN_CHANGED'});
    console.log(`conflict status staging test passed (${expired}, ${stale}, ${update} ms)`);
  }finally{
    if(item)await db.from('plan_items').delete().eq('id',item);
    await db.from('users').delete().eq('id',ctx.userId);
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
