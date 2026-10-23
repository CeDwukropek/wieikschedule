"use strict";
const { getSupabaseAdminClient } = require('./supabaseAdmin');
const { resolveUserIdByFirebaseUid } = require('./users');
const FIELDS = 'id,faculty,date,start_time,duration_min,subject,instructor,room,group,type,status';
const PROVIDERS = ['manual','n8n','odysseus','odysseus-calendar'];
function fail(statusCode,code,message) { throw Object.assign(new Error(message),{statusCode,code}); }
function keys(value,allowed) {
  if (!value || typeof value!=='object' || Array.isArray(value) || Object.keys(value).some(k=>!allowed.includes(k)))
    fail(422,'INVALID_ARGUMENTS','Nieprawidłowe pola żądania.');
}
function uuid(value) { if(typeof value!=='string'||!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value)) fail(422,'INVALID_ID','Nieprawidłowy identyfikator.'); return value; }
function text(value,max,required=false) {
  if ((value==null && !required)) return null;
  if(typeof value!=='string'||value.length>max||(required&&!value.trim())) fail(422,'INVALID_TEXT','Nieprawidłowa wartość tekstowa.');
  return value;
}
function databaseError(error) {
  if (!error) return;
  if (error.code==='40001'||error.code==='23505') fail(409,'PLAN_CHANGED','Plan zmienił się lub podgląd wygasł. Przygotuj nowy podgląd.');
  if (error.code==='P0002') fail(404,'NOT_FOUND','Nie znaleziono wydarzenia lub podglądu.');
  if (error.code==='54000') fail(429,'TOO_MANY_PROPOSALS','Masz zbyt wiele otwartych podglądów. Spróbuj za kilka minut.');
  if (error.code?.startsWith('22')||error.code==='23514') fail(422,'INVALID_CHANGE','Zmiana jest nieprawidłowa. Sprawdź datę, pola i zakres 07:00–22:00.');
  fail(503,'SCHEDULE_UNAVAILABLE','Prywatny plan jest chwilowo niedostępny.');
}
async function context(uid) {
  const db=getSupabaseAdminClient();
  return {db,userId:await resolveUserIdByFirebaseUid(db,uid)};
}
async function listOverrides(ctx) {
  const result=[];
  for(let from=0;;from+=1000){
    const {data,error}=await ctx.db.from('schedule_overrides')
      .select('id,event_id,action,patch,reason,revision,updated_at,events('+FIELDS+')').eq('user_id',ctx.userId).order('event_id').range(from,from+999);
    databaseError(error);result.push(...data);if(data.length<1000)return result;
  }
}
function validateChange(args) {
  keys(args,['event_id','operation','action','patch','reason']); uuid(args.event_id);
  if(!['upsert','delete'].includes(args.operation)) fail(422,'INVALID_OPERATION','Nieprawidłowa operacja.');
  if(args.operation==='delete') {
    if(args.action!=null||args.reason!=null||(args.patch&&Object.keys(args.patch).length)) fail(422,'INVALID_DELETE','Przywrócenie nie przyjmuje zmian pól.');
    return {event_id:args.event_id,operation:'delete',action:null,patch:{},reason:null};
  }
  if(!['modify','cancel'].includes(args.action)) fail(422,'INVALID_ACTION','Nieprawidłowy rodzaj zmiany.');
  keys(args.patch,['date','start_time','duration_min','room','instructor']);
  if((args.action==='cancel'&&Object.keys(args.patch).length)||(args.action==='modify'&&!Object.keys(args.patch).length)) fail(422,'INVALID_PATCH','Wybierz przynajmniej jedno pole do zmiany.');
  for(const [key,value] of Object.entries(args.patch)) {
    if(['room','instructor'].includes(key)) text(value,256);
    if(key==='duration_min'&&(!Number.isInteger(value)||value<1||value>900)) fail(422,'INVALID_DURATION','Czas trwania musi wynosić od 1 do 900 minut.');
    if(key==='start_time'&&(typeof value!=='string'||!/^([01]\d|2[0-3]):[0-5]\d:00$/.test(value))) fail(422,'INVALID_TIME','Nieprawidłowa godzina.');
    if(key==='date'&&(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value))||new Date(value).toISOString().slice(0,10)!==value)) fail(422,'INVALID_DATE','Nieprawidłowa data.');
  }
  return {...args,reason:text(args.reason,1000)};
}
async function propose(ctx,args,provider='manual',sessionId='manual') {
  const change=validateChange(args);
  text(sessionId,128,true);
  if(!PROVIDERS.includes(provider)) fail(422,'INVALID_PROVIDER','Nieprawidłowy agent.');
  const {data,error}=await ctx.db.rpc('propose_schedule_change',{
    p_user_id:ctx.userId,p_event_id:change.event_id,p_operation:change.operation,p_action:change.action,
    p_patch:change.patch,p_reason:change.reason,p_provider:provider,p_session_id:sessionId});
  databaseError(error);
  const source=data.expected_event, previous=data.expected_override;
  const effective=(row,override)=>override?.action==='cancel'?null:{...row,...(override?.patch||{})};
  return {id:data.id,event_id:data.event_id,operation:data.operation,action:data.action,patch:data.patch,reason:data.reason,
    provider:data.provider,session_id:data.session_id,expires_at:data.expires_at,
    source,before:effective(source,previous),after:effective(source,change.operation==='delete'?null:change),
    requires_confirmation:true};
}
async function confirm(ctx,args) {
  keys(args,['proposal_id','provider','session_id']);uuid(args.proposal_id);text(args.session_id,128,true);
  if(!PROVIDERS.includes(args.provider)) fail(422,'INVALID_PROVIDER','Nieprawidłowy agent.');
  const {data,error}=await ctx.db.rpc('confirm_schedule_change',{p_user_id:ctx.userId,p_proposal_id:args.proposal_id,p_provider:args.provider,p_session_id:args.session_id});
  databaseError(error);return data;
}
// Expires an open agent preview so it is offered nowhere anymore; consumed ones are left as they are.
async function reject(ctx,args,sessionPrefix='') {
  keys(args,['proposal_id']);uuid(args.proposal_id);
  const {data,error}=await ctx.db.from('schedule_change_proposals').update({expires_at:new Date().toISOString()})
    .eq('id',args.proposal_id).eq('user_id',ctx.userId).in('provider',['n8n','odysseus','odysseus-calendar'])
    .like('session_id',sessionPrefix+'%').is('consumed_at',null).select('id');
  databaseError(error);
  if(!data.length) fail(404,'NOT_FOUND','Nie znaleziono otwartej propozycji.');
  return {rejected:true};
}
// Restores the override state captured in a proposal: re-create it, or remove the one created since.
function undoOf(eventId,previous) {
  return previous?{event_id:eventId,operation:'upsert',action:previous.action,patch:previous.patch||{},reason:previous.reason??null}
    :{event_id:eventId,operation:'delete'};
}
// A person's own edit: preview and confirmation in one request, idempotent per request id.
async function apply(ctx,args) {
  keys(args,['event_id','operation','action','patch','reason','request_id']);
  if(typeof args.request_id!=='string'||!/^[A-Za-z0-9_-]{8,64}$/.test(args.request_id)) fail(422,'INVALID_REQUEST','Nieprawidłowy identyfikator żądania.');
  const sessionId='manual:'+args.request_id;
  const {data:done,error}=await ctx.db.from('schedule_change_proposals').select('event_id,result,expected_override')
    .eq('user_id',ctx.userId).eq('provider','manual').eq('session_id',sessionId).not('consumed_at','is',null).limit(1);
  databaseError(error);
  if(done.length) return {result:done[0].result,undo:undoOf(done[0].event_id,done[0].expected_override),replayed:true};
  const {request_id:_,...change}=args;
  const proposal=await propose(ctx,change,'manual',sessionId);
  const {data:stored,error:readError}=await ctx.db.from('schedule_change_proposals').select('expected_override').eq('id',proposal.id).single();
  databaseError(readError);
  const result=await confirm(ctx,{proposal_id:proposal.id,provider:'manual',session_id:sessionId});
  return {result,before:proposal.before,after:proposal.after,undo:undoOf(proposal.event_id,stored.expected_override)};
}
async function getEvents(ctx,args,find=false) {
  keys(args,find?['faculty','date_from','date_to','query','limit','offset']:['faculty','date_from','date_to','limit','offset']);
  text(args.faculty,256,true);
  for(const value of [args.date_from,args.date_to]) {
    if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value))||new Date(value).toISOString().slice(0,10)!==value) fail(422,'INVALID_DATE','Podaj zakres dat ISO.');
  }
  const span=(Date.parse(args.date_to)-Date.parse(args.date_from))/86400000;
  if(span<0||span>30) fail(422,'INVALID_RANGE','Jedno zapytanie może obejmować do 31 dni.');
  const limit=args.limit??100, offset=args.offset??0;
  if(!Number.isInteger(limit)||limit<1||limit>100||!Number.isInteger(offset)||offset<0||offset>100000) fail(422,'INVALID_PAGE','Nieprawidłowa strona wyników.');
  if(find) text(args.query,256,true);
  // Include source rows moved INTO the window and exclude rows moved OUT of it.
  const overrides=await listOverrides(ctx), byId=new Map(overrides.map(o=>[o.event_id,o]));
  const addedIds=new Set();
  for(let from=0;;from+=1000){
    const {data,error}=await ctx.db.from('user_added_events').select('event_id').eq('user_id',ctx.userId)
      .eq('status','active').eq('schedule_name',args.faculty).order('id').range(from,from+999);
    databaseError(error);data.forEach(row=>addedIds.add(row.event_id));if(data.length<1000)break;
  }
  let query=ctx.db.from('events').select(FIELDS).in('faculty',[args.faculty,'all'])
    .or('status.is.null,status.eq.aktywne,status.eq.wolne').gte('date',args.date_from).lte('date',args.date_to).order('id');
  const rows=[];
  for(let from=0;;from+=1000) {
    const {data,error}=await query.range(from,from+999);databaseError(error);rows.push(...data);
    if(data.length<1000)break;
  }
  const merged=new Map(rows.map(row=>[row.id,row]));
  for(const o of overrides) if(o.events&&[args.faculty,'all'].includes(o.events.faculty)) merged.set(o.event_id,o.events);
  const events=[...merged.values()].flatMap(row=>{
    const o=byId.get(row.id);
    if(o?.action==='cancel'||!['aktywne','wolne'].includes(row.status??'aktywne'))return [];
    const effective={...row,...(o?.patch||{})};
    if(effective.date<args.date_from||effective.date>args.date_to)return [];
    if(find&&!effective.subject.toLocaleLowerCase('pl').includes(args.query.toLocaleLowerCase('pl')))return [];
    return [{...effective,override_revision:o?.revision||0,is_added:addedIds.has(row.id)}];
  }).sort((a,b)=>a.date.localeCompare(b.date)||a.start_time.localeCompare(b.start_time)||a.id.localeCompare(b.id));
  return {events:events.slice(offset,offset+limit),next_offset:events.length>offset+limit?offset+limit:null};
}
module.exports={fail,keys,uuid,text,databaseError,context,listOverrides,propose,confirm,apply,reject,undoOf,getEvents,validateChange};
