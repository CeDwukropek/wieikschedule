"use strict";
// Real, billable model test using public source events and a disposable account.
const assert=require('node:assert/strict'),crypto=require('node:crypto'),fs=require('node:fs');
if(process.env.RUN_PROVIDER_MODEL_TEST!=='1'||process.env.SCHEDULE_ENVIRONMENT!=='staging'||process.env.SUPABASE_URL!=='http://127.0.0.1:3100/supabase')throw new Error('Explicit local staging only');
const schedule=require('../../api/_lib/schedule');
const {issueContext,readContext,dispatch}=require('../../api/_lib/scheduleTools');
const {getSupabaseAdminClient}=require('../../api/_lib/supabaseAdmin');
const db=getSupabaseAdminClient(),uid='synthetic-plan-filters-'+crypto.randomUUID(),report=[];
const access=fs.readFileSync(process.env.SCHEDULE_NATIVE_TOKEN_FILE||'.staging/odysseus-access-token.txt','utf8').trim();
const base='http://127.0.0.1:3100/local-odysseus/api/schedule';
const selection={faculty:'EiAs3',groups:{C:'C3',Lk:'Lk5',L:'L2',Lek:'Lek4'}};
let userId;
(async()=>{
 const marker=await db.from('staging_marker').select('name').single();assert.ifError(marker.error);assert.equal(marker.data.name,'wieikschedule-local-staging');
 userId=(await schedule.context(uid)).userId;
 try{
  const capabilities=await fetch(base+'/capabilities',{headers:{Authorization:'Bearer '+access}});
  assert.equal(capabilities.status,200,'Staging agent must be ready before the conversation test');
  const catalogue=await capabilities.json();
  for(const [provider,model] of [['openai','gpt-4.1-mini'],['google','gemini-3.1-flash-lite']]){
   const endpoint=catalogue.endpoints.find(row=>row.provider===provider&&row.models.includes(model));assert.ok(endpoint);
   const session='filter-smoke-'+crypto.randomUUID();
   const testCase={provider,model,principal:userId,conversation:session};report.push(testCase);
   const context=()=>issueContext(userId,'odysseus',session,Date.now(),'query',selection);
   const request=async message=>{
    const response=await fetch(base+'/chat',{method:'POST',signal:AbortSignal.timeout(195000),
      headers:{'Content-Type':'application/json',Authorization:'Bearer '+access,'X-Schedule-Context':context()},
      body:JSON.stringify({message,faculty:selection.faculty,groups:selection.groups,session_id:session,intent:'query',endpoint_id:endpoint.id,model,use_memory:false})});
    const result=await response.json();assert.equal(response.status,200,result.detail||'Native request failed');
    testCase.native_session_id=result.native_session_id;
    assert.equal(result.ui?.type,'schedule_plan');assert.equal(result.proposals.length,0);
    return result.data.plan;
   };
   const dates={date_from:'2026-10-19',date_to:'2026-10-23'};
   const expected=await dispatch(readContext(context()),'schedule.get_my_schedule',{...dates,kind:'exercise',limit:100});
   const all=await request('Pokaż mój plan zajęć od 2026-10-19 do 2026-10-23.');
   assert.ok(all.events.some(row=>row.type.toLocaleLowerCase('pl').includes('wyk')));
   const filtered=await request('bez wykładów, bez Labów, same ćwiczenia');
   assert.equal(filtered.kind,'exercise');assert.equal(filtered.date_from,dates.date_from);assert.equal(filtered.date_to,dates.date_to);
   assert.deepEqual(filtered.events.map(row=>row.id).sort(),expected.events.map(row=>row.id).sort());
   assert.ok(filtered.events.length>0);assert.ok(filtered.events.every(row=>row.type.toLocaleLowerCase('pl').includes('ćwicz')));
   Object.assign(testCase,{passed:true,all_events:all.events.length,exercises:filtered.events.length});
   console.log(JSON.stringify({provider,all_events:all.events.length,exercises:filtered.events.length,range_preserved:true,passed:true}));
  }
 }finally{
  const result=await db.from('users').delete().eq('id',userId);assert.ifError(result.error);
  fs.writeFileSync('/tmp/filtered-plan-acceptance.json',JSON.stringify({cases:report},null,2),{mode:0o600});
 }
})().catch(error=>{console.error('Filtered plan staging test failed:',error.message);process.exitCode=1;});
