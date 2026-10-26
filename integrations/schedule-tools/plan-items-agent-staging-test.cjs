"use strict";
// Agent entry previews (E6.7) through the real tool endpoint, plan-items router, PostgREST and database of the local
// staging: a signed context, plan_items.prepare_entries on a real class series, confirmation of chosen rows, and
// refusals for another account, a tampered preview and a missing hour. Explicit test-process auth stub for the app
// side only; the tool side uses a real signed context. Synthetic rows are removed.
const assert=require('node:assert/strict'),crypto=require('node:crypto'),path=require('node:path');
const root=process.cwd();
if(process.env.SCHEDULE_ENVIRONMENT!=='staging'||process.env.SUPABASE_URL!=='http://127.0.0.1:3100/supabase')throw new Error('Only local staging allowed');
const {getSupabaseAdminClient}=require(path.join(root,'api/_lib/supabaseAdmin'));
const schedule=require(path.join(root,'api/_lib/schedule'));
const {issueContext}=require(path.join(root,'api/_lib/scheduleTools'));
let current=null;
const authFile=require.resolve(path.join(root,'api/_lib/requestAuth'));
require.cache[authFile]={id:authFile,filename:authFile,loaded:true,exports:{verifyRequestUser:async()=>({uid:current})}};
const tools=require(path.join(root,'api/_routes/schedule/tools'));
const items=require(path.join(root,'api/plan-items/[action].js'));
const respond=()=>({setHeader(){},status(value){this.code=value;return this;},json(value){this.body=value;return this;}});
async function tool(token,name,args){const res=respond();
  await tools({method:'POST',headers:{authorization:'Bearer '+token},body:{tool:name,arguments:args}},res);return res;}
async function confirm(who,body){current=who;const res=respond();
  await items({method:'POST',url:'/api/plan-items/confirm-agent',query:{},body,headers:{authorization:'Bearer synthetic'}},res);return res;}
(async()=>{
  const db=getSupabaseAdminClient();
  const {data:marker,error:markerError}=await db.from('staging_marker').select('name').single();
  assert.ifError(markerError);assert.equal(marker.name,'wieikschedule-local-staging');
  const suffix=crypto.randomUUID(),uid=name=>`synthetic-agent-${name}-${suffix}`;
  const ids={};
  try{
    for(const name of ['student','other'])ids[name]=(await schedule.context(uid(name))).userId;
    const today=new Date().toISOString().slice(0,10);
    // A lab of one group, two of its future dates and a day without that class.
    const {data:first,error}=await db.from('events').select('faculty,subject,group,date,type').eq('status','aktywne').like('source_key','["stac",%')
      .like('group','L%').ilike('type','lab%').gte('date',today).order('date').limit(1).single();
    assert.ifError(error);
    const {data:labs}=await db.from('events').select('id,date,start_time').eq('faculty',first.faculty).eq('subject',first.subject)
      .eq('group',first.group).eq('status','aktywne').gte('date',today).order('date').limit(2);
    assert.equal(labs.length,2);
    const prefix=first.group.match(/^[^\d]+/)[0];
    const selection={faculty:first.faculty,groups:{[prefix]:first.group}};
    const token=issueContext(ids.student,'odysseus','agent-test',Date.now(),'entries',selection);
    const free=new Date(Date.parse(labs[0].date)+86400000).toISOString().slice(0,10);
    const res=await tool(token,'plan_items.prepare_entries',{kind:'kolokwium',subject:first.subject,title:'Kolokwium testowe',
      terms:[{date:labs[0].date},{date:labs[1].date},{date:free}]});
    assert.equal(res.code,200,JSON.stringify(res.body));
    const {proposal}=res.body.result;
    assert.deepEqual(proposal.items.map(entry=>[entry.item.timing,entry.item.event_id??null,entry.item.scope,entry.needs_time]),
      [['class',labs[0].id,'personal',false],['class',labs[1].id,'personal',false],['slot',null,'personal',true]]);
    // A query-mode context cannot prepare entries.
    const query=await tool(issueContext(ids.student,'odysseus','agent-test',Date.now(),'query',selection),'plan_items.prepare_entries',
      {kind:'kolokwium',subject:first.subject,terms:[{date:labs[0].date}]});
    assert.equal(query.code,403);
    // Another account, a tampered row and a missing hour are refused; nothing is written.
    assert.equal((await confirm(uid('other'),{proposal,indexes:[0]})).body.error,'INVALID_PREVIEW');
    const tampered={...proposal,items:proposal.items.map(entry=>({...entry,item:{...entry.item,scope:'group'}}))};
    assert.equal((await confirm(uid('student'),{proposal:tampered,indexes:[0]})).body.error,'INVALID_PREVIEW');
    assert.equal((await confirm(uid('student'),{proposal,indexes:[2]})).body.error,'TIME_REQUIRED');
    const {count:none}=await db.from('plan_items').select('id',{count:'exact',head:true}).eq('owner_id',ids.student);
    assert.equal(none,0);
    // The chosen rows are saved as one series, the day without a class at the hour the person gave.
    const saved=await confirm(uid('student'),{proposal,indexes:[0,2],times:{2:'10:00'}});
    assert.equal(saved.code,200,JSON.stringify(saved.body));
    assert.deepEqual(saved.body.items.map(item=>[item.timing,item.date,item.start_time]),
      [['class',labs[0].date,labs[0].start_time],['slot',free,'10:00:00']]);
    assert.equal(saved.body.items[0].series_id,saved.body.items[1].series_id);
    // A second confirmation of the same rows is refused as a duplicate, not saved twice.
    assert.equal((await confirm(uid('student'),{proposal,indexes:[0]})).code,409);
    console.log('plan items agent staging test passed');
  }finally{
    const owners=Object.values(ids);
    if(owners.length){
      await db.from('plan_items').delete().in('owner_id',owners);
      await db.from('users').delete().in('id',owners);
    }
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
