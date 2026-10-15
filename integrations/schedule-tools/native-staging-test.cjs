"use strict";
// Explicit, opt-in acceptance test. Uses a temporary DB user, the local model,
// and a separate native Odysseus; never authenticates as a real Firebase user.
const assert=require('node:assert/strict'),crypto=require('node:crypto'),fs=require('node:fs');
if(process.env.RUN_LOCAL_MODEL_TEST!=='1'||process.env.SCHEDULE_ENVIRONMENT!=='staging'||process.env.SUPABASE_URL!=='http://127.0.0.1:3100/supabase')throw new Error('Opt-in local staging only');
const {getSupabaseAdminClient}=require('../../api/_lib/supabaseAdmin');
const schedule=require('../../api/_lib/schedule');
const {issueContext}=require('../../api/_lib/scheduleTools');
const db=getSupabaseAdminClient();
const access=fs.readFileSync('.staging/odysseus-access-token.txt','utf8').trim();
const nativeBase='http://127.0.0.1:3100/local-odysseus/api/schedule';
const uid='synthetic-native-'+crypto.randomUUID(),session='acceptance-'+crypto.randomUUID();
let userId;
let endpointId;
const model=process.env.NATIVE_MODEL||'google/gemma-4-26b-a4b-qat';
const report=[];
async function ask(intent,message,event){
 const started=Date.now();
 const response=await fetch(nativeBase+'/chat',{method:'POST',signal:AbortSignal.timeout(205000),headers:{
  'Content-Type':'application/json',Authorization:'Bearer '+access,
  'X-Schedule-Context':issueContext(userId,'odysseus',session,Date.now(),intent)},body:JSON.stringify({
   message,faculty:event.faculty,session_id:session,intent,groups:{L:'L1'},
   endpoint_id:endpointId,model,use_memory:false})});
 const data=await response.json();
 assert.equal(response.status,200,`native HTTP ${response.status}`);assert.equal(data.ok,true);
 report.push({intent,native_session_id:data.native_session_id,seconds:Math.round((Date.now()-started)/1000),
   proposals:data.proposals?.length||0,slots:data.data?.slots?.length||0});
 console.log(JSON.stringify(report.at(-1)));
 return data;
}
(async()=>{
 const marker=await db.from('staging_marker').select('name').single();assert.ifError(marker.error);
 assert.equal(marker.data.name,'wieikschedule-local-staging');
 const capabilities=await fetch(nativeBase+'/capabilities',{headers:{Authorization:'Bearer '+access}}).then(response=>response.json());
 endpointId=capabilities.endpoints?.find(row=>row.models.includes(model))?.id;
 assert.ok(endpointId,'chosen local model must be available');
 userId=(await schedule.context(uid)).userId;
 try{
  const {data:rows,error}=await db.from('events').select('*').eq('status','aktywne')
    .gte('date',new Date().toISOString().slice(0,10)).order('date').limit(100);
  assert.ifError(error);
  const event=rows.find(row=>row.group&&/\d/.test(row.group)&&!String(row.type).toLowerCase().includes('wyk'));
  assert.ok(event,'future grouped source event required');
  const query=await ask('query',`Sprawdź narzędziami plan na ${event.date}. Wyszukaj przedmiot ${event.subject}. Podaj datę, godzinę i prowadzącego znalezionych zajęć.`,event);
  assert.equal(query.proposals.length,0);assert.ok(query.output.includes(event.date)||query.output.includes(event.subject),'answer should reference retrieved data');
  const makeup=await ask('makeup',`Chcę odrobić ${event.subject}. Wyszukaj istniejące terminy wszystkich grup dokładnie ${event.date}. Pokaż dostępne terminy. Nie zmieniaj oryginalnych zajęć.`,event);
  assert.equal(makeup.proposals.length,0);assert.ok(makeup.data?.slots?.length,'makeup should offer existing source events');
  const ids=makeup.data.slots.map(row=>row.event_id);
  const real=await db.from('events').select('id').in('id',ids);assert.ifError(real.error);assert.equal(real.data.length,ids.length);
  const move=await ask('reschedule',`Wyraźnie proszę o prywatną zmianę sali dla wydarzenia ${event.id} (${event.subject}, ${event.date}). Ustaliliśmy z prowadzącym salę TEST-NATIVE. Przygotuj podgląd zmiany sali, nie zmieniaj daty ani godziny.`,event);
  assert.equal(move.proposals.length,1,'model should prepare exactly one preview');
  assert.equal(move.proposals[0].requires_confirmation,true);
  assert.deepEqual(await schedule.listOverrides({db,userId}),[],'no changes without browser confirmation');
  const after=await db.from('events').select('*').eq('id',event.id).single();assert.ifError(after.error);assert.deepEqual(after.data,event);
  fs.writeFileSync('.staging/native-acceptance.json',JSON.stringify({passed:true,cases:report},null,2),{mode:0o600});
  console.log('Native Odysseus + local Gemma + schedule tools: PASS; official events and private overrides unchanged');
 }finally{
  for(const table of ['schedule_change_proposals','schedule_overrides']){const result=await db.from(table).delete().eq('user_id',userId);assert.ifError(result.error);}
  const result=await db.from('users').delete().eq('firebase_uid',uid);assert.ifError(result.error);
 }
})().catch(error=>{console.error('Native acceptance failed:',error.code||error.name,error.message);process.exitCode=1;});
