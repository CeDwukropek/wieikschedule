"use strict";
// Explicit test-process auth stub; never imported by server.cjs or production.
const assert=require('node:assert/strict'),crypto=require('node:crypto'),path=require('node:path');
const root=process.cwd();
if(process.env.SCHEDULE_ENVIRONMENT!=='staging'||process.env.SUPABASE_URL!=='http://127.0.0.1:3100/supabase')throw new Error('Only local staging allowed');
const {getSupabaseAdminClient}=require(path.join(root,'api/_lib/supabaseAdmin'));
const schedule=require(path.join(root,'api/_lib/schedule'));
const tools=require(path.join(root,'api/_lib/scheduleTools'));
(async()=>{
 const db=getSupabaseAdminClient();
 const {data:marker,error:markerError}=await db.from('staging_marker').select('name').single();
 assert.ifError(markerError);assert.equal(marker.name,'wieikschedule-local-staging');
 const suffix=crypto.randomUUID(),uids=['synthetic-api-a-','synthetic-api-b-'].map(prefix=>prefix+suffix);
 let owner=uids[0];const owners=[];
 const authFile=require.resolve(path.join(root,'api/_lib/requestAuth'));
 require.cache[authFile]={id:authFile,filename:authFile,loaded:true,exports:{verifyRequestUser:async()=>({uid:owner})}};
 const invoke=async(name,method,body)=>{
   const handler=require(path.join(root,'api/schedule',name));
   const res={setHeader(){},status(value){this.code=value;return this;},json(value){this.body=value;return this;}};
   await handler({method,body,headers:{}},res);return res;
 };
 try{
   for(const uid of uids)owners.push((await schedule.context(uid)).userId);
   const {data:event,error}=await db.from('events').select('*').eq('status','aktywne').not('source_system','is',null).order('id').limit(1).single();assert.ifError(error);
   const preview=await invoke('propose','POST',{event_id:event.id,operation:'upsert',action:'modify',patch:{room:null}});
   assert.equal(preview.code,200);
   const ctxB={db,userId:owners[1]};assert.deepEqual(await schedule.listOverrides(ctxB),[]);
   owner=uids[1];let response=await invoke('confirm','POST',{proposal_id:preview.body.proposal.id,provider:'manual',session_id:'manual'});assert.equal(response.code,404);
   owner=uids[0];response=await invoke('confirm','POST',{proposal_id:preview.body.proposal.id,provider:'manual',session_id:'manual'});assert.equal(response.code,200);
   const own=await schedule.listOverrides({db,userId:owners[0]});assert.equal(own[0].patch.room,null);
   const claims=tools.readContext(tools.issueContext(owners[0],'odysseus','synthetic-session'));
   const found=await tools.dispatch(claims,'schedule.get_events',{faculty:event.faculty,date_from:event.date,date_to:event.date});
   assert.equal(found.events.find(row=>row.id===event.id).room,null);
   const cancel=await tools.dispatch(claims,'schedule.create_override',{event_id:event.id,action:'cancel',patch:{}});
   assert.equal((await schedule.listOverrides({db,userId:owners[0]}))[0].action,'modify');
   response=await invoke('confirm','POST',{proposal_id:cancel.proposal.id,provider:'odysseus',session_id:'synthetic-session'});assert.equal(response.code,200);
   const cancelled=await tools.dispatch(claims,'schedule.get_events',{faculty:event.faculty,date_from:event.date,date_to:event.date});assert.ok(!cancelled.events.some(row=>row.id===event.id));
   const restored=await tools.dispatch(claims,'schedule.delete_override',{event_id:event.id});
   response=await invoke('confirm','POST',{proposal_id:restored.proposal.id,provider:'odysseus',session_id:'synthetic-session'});assert.equal(response.code,200);
   assert.deepEqual(await schedule.listOverrides({db,userId:owners[0]}),[]);
   const {data:after}=await db.from('events').select('*').eq('id',event.id).single();assert.deepEqual(after,event);
   console.log('Real staging REST/RPC + handlers: owner A/B, null, delegated preview, cancel, restore, source unchanged: PASS');
 }finally{
   for(const table of ['schedule_change_proposals','schedule_overrides']){const {error}=await db.from(table).delete().in('user_id',owners);assert.ifError(error);}
   const {error}=await db.from('users').delete().in('firebase_uid',uids);assert.ifError(error);
 }
})().catch(error=>{console.error('Staging integration test failed:',error.code||error.name);process.exitCode=1;});
