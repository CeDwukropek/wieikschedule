"use strict";
// Explicit opt-in: real, billable provider calls with a synthetic schedule user.
const assert=require('node:assert/strict'),crypto=require('node:crypto'),fs=require('node:fs');
if(process.env.RUN_PROVIDER_MODEL_TEST!=='1'||process.env.SCHEDULE_ENVIRONMENT!=='staging'||process.env.SUPABASE_URL!=='http://127.0.0.1:3100/supabase')throw new Error('Explicit local staging only');
const schedule=require('../../api/_lib/schedule');
const {issueContext,readContext,dispatch}=require('../../api/_lib/scheduleTools');
const {getSupabaseAdminClient}=require('../../api/_lib/supabaseAdmin');
const db=getSupabaseAdminClient(),uid='synthetic-providers-'+crypto.randomUUID();
const token=fs.readFileSync(process.env.SCHEDULE_NATIVE_TOKEN_FILE||'.staging/odysseus-access-token.txt','utf8').trim();
const base='http://127.0.0.1:3100/local-odysseus/api/schedule';
const selection={faculty:'EiAs3',groups:{Lk:'Lk1',C:'C1',L:'L1',Lek:'Lek1'}};
const report=[];let userId;
const providers=[['openai',process.env.PROVIDER_OPENAI_MODEL||'gpt-4.1-mini'],['google',process.env.PROVIDER_GOOGLE_MODEL||'gemini-3.1-flash-lite']]
 .filter(([provider])=>!process.env.PROVIDER_TEST_ONLY||process.env.PROVIDER_TEST_ONLY===provider);
assert.ok(providers.length,'Select a supported test provider');
(async()=>{
 const marker=await db.from('staging_marker').select('name').single();assert.ifError(marker.error);assert.equal(marker.data.name,'wieikschedule-local-staging');
 userId=(await schedule.context(uid)).userId;
 try{
  const response=await fetch(base+'/capabilities',{headers:{Authorization:'Bearer '+token}});
  assert.equal(response.status,200);const catalogue=await response.json();
  for(const [provider,model] of providers){
   const endpoint=catalogue.endpoints.find(row=>row.provider===provider&&row.models.includes(model));
   assert.ok(endpoint,provider+' test model must be configured');
   const session='provider-smoke-'+crypto.randomUUID();
   const context=issueContext(userId,'odysseus',session,Date.now(),'query',selection);
   const expected=await dispatch(readContext(context),'schedule.get_next_occurrence',{query:'Modelowania układów dynamicznych lab'});
   assert.equal(expected.status,'found');
   const testCase={provider,model,conversation:session,principal:userId};report.push(testCase);
   const started=Date.now();
   const reply=await fetch(base+'/chat',{method:'POST',signal:AbortSignal.timeout(195000),
    headers:{'Content-Type':'application/json',Authorization:'Bearer '+token,'X-Schedule-Context':context},
    body:JSON.stringify({message:'Kiedy mam najbliższe laby z Modelowania układów dynamicznych?',
     faculty:selection.faculty,groups:selection.groups,session_id:session,intent:'query',
     endpoint_id:endpoint.id,model,use_memory:false})});
   const result=await reply.json();
   Object.assign(testCase,{status:reply.status,seconds:Math.round((Date.now()-started)/1000),native_session_id:result.native_session_id});
   console.log(JSON.stringify({provider,model,status:reply.status,seconds:report.at(-1).seconds}));
   assert.equal(reply.status,200,result.detail||'Provider request failed');assert.equal(result.ok,true);
   assert.equal(result.model_route.provider,provider);
   assert.ok(result.evidence?.some(row=>row.tool==='schedule.get_next_occurrence'&&row.event?.id===expected.event.id));
   assert.ok(result.output.includes(expected.event.date));assert.equal(result.proposals.length,0);
  }
  console.log('Selected providers: real model -> restricted schedule tool -> verified schedule answer: PASS');
 }finally{
  const result=await db.from('users').delete().eq('id',userId);assert.ifError(result.error);
  fs.writeFileSync(process.env.SCHEDULE_PROVIDER_REPORT||'/tmp/schedule-provider-acceptance.json',JSON.stringify({cases:report},null,2),{mode:0o600});
 }
})().catch(error=>{console.error('Provider staging test failed:',error.message);process.exitCode=1;});
