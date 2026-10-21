"use strict";
const schedule=require('./schedule');
const FIELDS='id,faculty,date,start_time,duration_min,subject,instructor,room,group,type,status';
const SHOWN=['date','start_time','duration_min','room','instructor'];
const AGENT_PROVIDERS=['n8n','odysseus','odysseus-calendar'];
const pick=row=>row?Object.fromEntries(SHOWN.map(key=>[key,row[key]??null])):null;
function base(row){return {event_id:row.id,faculty:row.faculty,subject:row.subject,type:row.type??null,group:row.group??null};}
// One read model for every personal entry: private changes, cancellations, makeup classes, agent previews.
async function personalPlan(ctx,now=new Date()){
  const overrides=await schedule.listOverrides(ctx);
  const items=overrides.filter(row=>row.events).map(row=>({...base(row.events),
    kind:row.action==='cancel'?'cancelled':'modified',original:pick(row.events),
    current:row.action==='cancel'?null:pick({...row.events,...row.patch}),
    override:{action:row.action,patch:row.patch,reason:row.reason??null,revision:row.revision,updated_at:row.updated_at}}));
  const added=[];
  for(let from=0;;from+=1000){
    const {data,error}=await ctx.db.from('user_added_events').select(`id,schedule_name,reason,created_at,events(${FIELDS})`)
      .eq('user_id',ctx.userId).eq('status','active').order('id').range(from,from+999);
    schedule.databaseError(error);added.push(...data);if(data.length<1000)break;
  }
  const changed=new Map(items.map(item=>[item.event_id,item]));
  const addedIds=new Set(added.filter(row=>row.events).map(row=>row.events.id));
  // A changed makeup class is listed once, among makeup classes, with its change.
  items.splice(0,items.length,...items.filter(item=>!(item.kind==='modified'&&addedIds.has(item.event_id))));
  for(const row of added.filter(row=>row.events)){
    const change=changed.get(row.events.id);
    items.push({...base(row.events),kind:'added',added_event_id:row.id,schedule_name:row.schedule_name,reason:row.reason,
      original:pick(row.events),current:change?change.current:pick(row.events),override:change?.override||null});
  }
  const {data,error}=await ctx.db.from('schedule_change_proposals')
    .select('id,event_id,operation,action,patch,reason,provider,session_id,expires_at,expected_event,expected_override')
    .eq('user_id',ctx.userId).in('provider',AGENT_PROVIDERS).is('consumed_at',null).gt('expires_at',now.toISOString())
    .order('created_at').limit(50);
  schedule.databaseError(error);
  const proposals=data.map(row=>{
    const before=row.expected_override?.action==='cancel'?null:{...row.expected_event,...(row.expected_override?.patch||{})};
    const after=row.operation==='delete'?row.expected_event:row.action==='cancel'?null:{...row.expected_event,...row.patch};
    return {...base(row.expected_event),kind:'proposal',id:row.id,source:row.expected_event,operation:row.operation,action:row.action,reason:row.reason??null,
      provider:row.provider,session_id:row.session_id,expires_at:row.expires_at,original:pick(row.expected_event),
      before:pick(before),after:pick(after)};
  });
  const order=(a,b)=>(a.current||a.original).date.localeCompare((b.current||b.original).date);
  // Raw overrides feed the effective plan (week, makeup classes, ICS) from this same response.
  return {items:items.sort(order),proposals,overrides};
}
module.exports={personalPlan};
