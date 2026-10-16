"use strict";
// Explicit opt-in; temporary schedule identity, never a real Firebase account.
const assert=require('node:assert/strict'),crypto=require('node:crypto'),fs=require('node:fs');
if(process.env.RUN_LOCAL_MODEL_TEST!=='1'||process.env.SCHEDULE_ENVIRONMENT!=='staging'||process.env.SUPABASE_URL!=='http://127.0.0.1:3100/supabase')throw new Error('Explicit local staging only');
const schedule=require('../../api/_lib/schedule');
const {issueContext,readContext,dispatch}=require('../../api/_lib/scheduleTools');
const {getSupabaseAdminClient}=require('../../api/_lib/supabaseAdmin');
const db=getSupabaseAdminClient(),uid='synthetic-semantic-'+crypto.randomUUID(),session='semantic-'+crypto.randomUUID();
const selection={faculty:'EiAs3',groups:{Lk:'Lk1',C:'C1',L:'L1',Lek:'Lek1'}};
const token=fs.readFileSync(process.env.SCHEDULE_NATIVE_TOKEN_FILE||'.staging/odysseus-access-token.txt','utf8').trim();
const nativeBase='http://127.0.0.1:3100/local-odysseus/api/schedule';
const report=[];let userId,otherUserId,endpointId;
const context=(scope=selection,intent='query',provider='odysseus')=>issueContext(userId,provider,session,Date.now(),intent,scope);
const query=(name,args,scope=selection,intent='query')=>dispatch(readContext(context(scope,intent)),'schedule.'+name,args);
async function native(message,scope=selection,intent='query'){
 const started=Date.now();
 const response=await fetch(nativeBase+'/chat',{method:'POST',signal:AbortSignal.timeout(205000),headers:{'Content-Type':'application/json',Authorization:'Bearer '+token,'X-Schedule-Context':context(scope,intent)},body:JSON.stringify({message,faculty:scope.faculty,session_id:session,groups:scope.groups,intent,endpoint_id:endpointId,model:process.env.NATIVE_MODEL||'google/gemma-4-26b-a4b-qat',use_memory:false})});
 const result=await response.json();assert.equal(response.status,200,`native HTTP ${response.status}: ${result.detail||result.message||'request failed'}`);assert.equal(result.ok,true);
 report.push({intent,seconds:Math.round((Date.now()-started)/1000),evidence:result.evidence?.map(row=>({tool:row.tool,status:row.status,date:row.event?.date,group:row.event?.group})),slots:result.data?.slots?.length||0});
 console.log(JSON.stringify(report.at(-1)));return result;
}
(async()=>{
 const marker=await db.from('staging_marker').select('name').single();assert.ifError(marker.error);assert.equal(marker.data.name,'wieikschedule-local-staging');
 userId=(await schedule.context(uid)).userId;
 try{
  otherUserId=(await schedule.context(uid+'-other')).userId;
  const first=await query('get_next_occurrence',{query:'Modelowania układów dynamicznych lab'});
  assert.equal(first.status,'found');assert.equal(first.event.date,'2026-10-19');assert.equal(first.event.group,'Lk1');
  const other=await query('get_next_occurrence',{query:'MUD',kind:'laboratory'},{...selection,groups:{Lk:'Lk2'}});
  assert.equal(other.event.date,'2026-10-26');assert.equal(other.event.group,'Lk2');
  assert.equal((await query('get_next_occurrence',{query:'MUD',kind:'laboratory'},{faculty:'EiAs3',groups:{}})).status,'missing_groups');
  const relayed=await fetch('http://n8n:5678/webhook/schedule-tools-v1',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+context(selection,'query','n8n')},body:JSON.stringify({tool:'schedule.get_next_occurrence',arguments:{query:'MUD',kind:'laboratory'}})}).then(response=>response.json());
  assert.equal(relayed.ok,true);assert.equal(relayed.result.event.id,first.event.id);
  const original=await db.from('events').select('*').eq('id',first.event.id).single();assert.ifError(original.error);
  const cancellation=await schedule.propose({db,userId},{event_id:first.event.id,operation:'upsert',action:'cancel',patch:{}},'odysseus',session);
  await schedule.confirm({db,userId},{proposal_id:cancellation.id,provider:'odysseus',session_id:session});
  const afterCancel=await query('get_next_occurrence',{query:'MUD',kind:'laboratory'});
  assert.notEqual(afterCancel.event.id,first.event.id);assert.ok(afterCancel.event.date>first.event.date);
  const reset=await schedule.propose({db,userId},{event_id:first.event.id,operation:'delete'},'odysseus',session);
  await schedule.confirm({db,userId},{proposal_id:reset.id,provider:'odysseus',session_id:session});
  assert.equal((await query('get_next_occurrence',{query:'MUD',kind:'laboratory'})).event.id,first.event.id);
  let preview=await schedule.propose({db,userId},{event_id:first.event.id,operation:'upsert',action:'modify',patch:{date:'2026-10-20',start_time:'10:00:00'}},'odysseus',session);
  await schedule.confirm({db,userId},{proposal_id:preview.id,provider:'odysseus',session_id:session});
  assert.equal((await query('get_next_occurrence',{query:'MUD',kind:'laboratory'})).event.date,'2026-10-20');
  const otherContext=readContext(issueContext(otherUserId,'odysseus',session,Date.now(),'query',selection));
  const otherAccount=await dispatch(otherContext,'schedule.get_next_occurrence',{query:'MUD',kind:'laboratory'});
  assert.equal(otherAccount.event.date,'2026-10-19');
  const choices=await query('find_makeup_options',{query:'MUD',kind:'laboratory'},selection,'makeup');
  const candidate=choices.slots.find(row=>row.date==='2026-10-19'&&row.group==='Lk5');assert.ok(candidate);
  const added=await db.from('user_added_events').insert({user_id:userId,event_id:candidate.id,reason:'makeup',status:'active',schedule_name:selection.faculty});assert.ifError(added.error);
  const next=await query('get_next_occurrence',{query:'MUD',kind:'laboratory'});assert.equal(next.event.id,candidate.id);assert.equal(next.event.is_added,true);
  const remove=await db.from('user_added_events').delete().eq('user_id',userId);assert.ifError(remove.error);
  const revert=await schedule.propose({db,userId},{event_id:first.event.id,operation:'delete'},'odysseus',session);
  await schedule.confirm({db,userId},{proposal_id:revert.id,provider:'odysseus',session_id:session});
  const after=await db.from('events').select('*').eq('id',first.event.id).single();assert.ifError(after.error);assert.deepEqual(after.data,original.data);
  console.log('Real REST/RPC: selected groups, cancel/restore, moves, additions, accounts A/B, n8n semantic relay, source unchanged: PASS');
  if(process.env.SKIP_NATIVE_MODEL==='1')return;
  for(let attempt=0;attempt<15&&!endpointId;attempt++){
   const response=await fetch(nativeBase+'/capabilities',{headers:{Authorization:'Bearer '+token}});
   assert.notEqual(response.status,401,'native access token must be valid');
   const capabilities=await response.json();
   endpointId=capabilities.endpoints?.find(row=>row.models.includes(process.env.NATIVE_MODEL||'google/gemma-4-26b-a4b-qat'))?.id;
   if(!endpointId)await new Promise(resolve=>setTimeout(resolve,500));
  }
  assert.ok(endpointId,'selected local model must be available after startup');
  const question='kiedy mam najbliższe laby z Modelowania układów dynamicznych?';
  const answer=await native(question);
  assert.ok(answer.evidence?.some(row=>row.tool==='schedule.get_next_occurrence'&&row.event?.date==='2026-10-19'&&row.event?.group==='Lk1'));
  assert.ok(answer.output.includes('2026-10-19')&&answer.output.includes('07:30'));assert.equal(answer.proposals.length,0);
  const second=await native(question,{...selection,groups:{...selection.groups,Lk:'Lk2'}});
  assert.ok(second.output.includes('2026-10-26'));assert.ok(second.evidence?.some(row=>row.event?.group==='Lk2'));
  const missing=await native(question,{faculty:'EiAs3',groups:{}});assert.ok(missing.evidence?.some(row=>row.status==='missing_groups'));assert.ok(missing.output.includes('Lk'));
  const makeup=await native('Chcę odrobić laboratorium z Modelowania układów dynamicznych w najbliższych dwóch tygodniach.',selection,'makeup');
  assert.ok(makeup.data?.slots?.length);assert.equal(makeup.proposals.length,0);
  assert.ok(makeup.evidence?.some(row=>row.tool==='schedule.find_makeup_options'));
  assert.ok(makeup.data.slots.every(row=>row.event_id&&['free','conflict'].includes(row.conflict_status)));
  fs.writeFileSync(process.env.SCHEDULE_ACCEPTANCE_REPORT||'.staging/semantic-acceptance.json',JSON.stringify({passed:true,cases:report},null,2),{mode:0o600});
  console.log('Real Gemma: exact user question, changed group, missing group and makeup cards: PASS');
 }finally{
  for(const table of ['user_added_events','schedule_change_proposals','schedule_overrides']){const result=await db.from(table).delete().in('user_id',[userId,otherUserId].filter(Boolean));assert.ifError(result.error);}
  const result=await db.from('users').delete().in('firebase_uid',[uid,uid+'-other']);assert.ifError(result.error);
 }
})().catch(error=>{console.error('Semantic staging test failed:',error.code||error.name,error.message);process.exitCode=1;});
