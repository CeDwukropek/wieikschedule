"use strict";
const crypto=require('node:crypto');
const {getSupabaseAdminClient}=require('./supabaseAdmin');
const {getFirebaseAdminAuth}=require('./firebaseAdmin');
const schedule=require('./schedule');
const {validateSelection}=require('./scheduleSelection');
const {loadPlan,clock}=require('./scheduleQueries');
const {belongsToPlan,eventKind}=require('./scheduleSearch');
const {fail}=schedule;
// Unambiguous alphabet: the pairing code is typed by hand into Odysseus.
const CODE_ALPHABET='ABCDEFGHJKMNPQRSTVWXYZ23456789';
const LINK_DAYS=180,MAX_RANGE_DAYS=200;
const sha256=value=>crypto.createHash('sha256').update(value).digest('hex');
function newCode(){
  const raw=Array.from({length:12},()=>CODE_ALPHABET[crypto.randomInt(CODE_ALPHABET.length)]).join('');
  return raw.match(/.{4}/g).join('-');
}
function codeHash(code){
  const raw=String(code||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
  if(raw.length!==12||[...raw].some(char=>!CODE_ALPHABET.includes(char)))fail(422,'INVALID_CODE','Nieprawidłowy kod połączenia.');
  return sha256('code:'+raw);
}
function newToken(){return 'wkc_'+crypto.randomBytes(32).toString('base64url');}
function tokenHash(token){
  if(typeof token!=='string'||!/^wkc_[A-Za-z0-9_-]{43}$/.test(token))fail(401,'LINK_INVALID','Połączenie kalendarza jest nieważne. Połącz ponownie.');
  return sha256('token:'+token);
}
function linkError(error){
  if(!error)return;
  if(error.code==='P0002')fail(401,'LINK_INVALID','Połączenie kalendarza jest nieważne, wygasło lub zostało odwołane. Połącz ponownie.');
  if(error.code==='54000')fail(429,'TOO_MANY_LINKS','Masz zbyt wiele połączeń lub kodów. Odwołaj nieużywane połączenie albo poczekaj 10 minut.');
  schedule.databaseError(error);
}
async function readUserSettings(firebaseUid){
  getFirebaseAdminAuth();
  const {getFirestore}=require('firebase-admin/firestore');
  const snapshot=await getFirestore().collection('userSettings').doc(firebaseUid).get();
  return snapshot.exists?snapshot.data()?.settings||{}:{};
}
// The link follows the named group set, so group changes in the app reach the mirror.
async function linkSelection(link,read=readUserSettings){
  const settings=await read(link.firebase_uid);
  const set=settings?.scheduleGroupSets?.[link.faculty]?.sets?.find(item=>item?.id===link.group_set_id);
  if(!set)fail(409,'GROUP_SET_MISSING','Zestaw grup wybrany dla kalendarza nie istnieje. Połącz kalendarz ponownie.');
  const external=(Array.isArray(set.externalSelections)?set.externalSelections:[])
    .filter(item=>item?.scheduleId&&item.groupType&&item.groupValue).map(item=>{
      if(item.subjectKey&&!item.subjectName)
        fail(409,'SELECTION_NEEDS_REFRESH','Otwórz wieikschedule i wybierz ponownie przedmiot w dodatkowych grupach zestawu.');
      return {faculty:item.scheduleId,groups:{[item.groupType]:item.groupValue},subject:item.subjectName||''};
    });
  return {name:String(set.name||''),selection:validateSelection({faculty:link.faculty,groups:set.groups||{},...(external.length?{external}:{})})};
}
function plusDays(date,days){const value=new Date(date+'T12:00:00Z');value.setUTCDate(value.getUTCDate()+days);return value.toISOString().slice(0,10);}
function feedRange(query,now=new Date()){
  const today=clock(now).date;
  const valid=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
  const from=query.from??plusDays(today,-14),to=query.to??plusDays(today,150);
  if(!valid(from)||!valid(to))fail(422,'INVALID_DATE','Podaj zakres dat YYYY-MM-DD.');
  if(to<from||(Date.parse(to)-Date.parse(from))/86400000>MAX_RANGE_DAYS)fail(422,'INVALID_RANGE',`Zakres obejmuje maksymalnie ${MAX_RANGE_DAYS} dni.`);
  return {date_from:from,date_to:to};
}
function occurrence(row){
  const item={event_id:row.id,date:row.date,start_time:row.start_time,duration_min:row.duration_min,subject:row.subject,
    type:row.type??null,kind:eventKind(row.type),group:row.group??null,room:row.room??null,instructor:row.instructor??null,
    status:row.override_action==='cancel'?'cancelled':row.status==='wolne'?'day_off':'scheduled',
    added:Boolean(row.is_added),modified:row.override_action==='modify',override_revision:row.override_revision||0};
  return {...item,version:sha256(JSON.stringify(item)).slice(0,16)};
}
async function buildFeed(ctx,selection,window,load=loadPlan){
  const data=await load(ctx,selection,{includeCancelled:true});
  if(!data.source.some(row=>row.faculty===selection.faculty))fail(503,'DATA_UNAVAILABLE','Brak danych wybranego planu. Lustro pozostaje bez zmian.');
  const events=data.events.filter(row=>row.date>=window.date_from&&row.date<=window.date_to&&belongsToPlan(row,selection)).map(occurrence);
  return {events,version:sha256(JSON.stringify([selection,window,events.map(item=>item.event_id+item.version)])).slice(0,32)};
}
const PROVIDER='odysseus-calendar';
const CHANGE_FIELDS=['date','start_time','duration_min','room'];
function validateCalendarChange(body){
  schedule.keys(body,['event_id','operation','values','expected_version','request_id','mode']);
  schedule.uuid(body.event_id);
  if(!['modify','cancel','restore','remove','remove_added'].includes(body.operation))fail(422,'INVALID_OPERATION','Nieprawidłowa operacja.');
  if(typeof body.expected_version!=='string'||!/^[0-9a-f]{16}$/.test(body.expected_version))fail(422,'INVALID_VERSION','Brak wersji zajęć z kalendarza.');
  if(typeof body.request_id!=='string'||!/^[A-Za-z0-9_-]{8,64}$/.test(body.request_id))fail(422,'INVALID_REQUEST','Nieprawidłowy identyfikator żądania.');
  const mode=body.mode??'apply';
  if(!['apply','propose'].includes(mode))fail(422,'INVALID_MODE','Nieprawidłowy tryb zmiany.');
  if(body.operation==='modify'){
    schedule.keys(body.values,CHANGE_FIELDS);
    if(!Object.keys(body.values).length)fail(422,'INVALID_PATCH','Wybierz przynajmniej jedno pole do zmiany.');
  }else if(body.values!==undefined)fail(422,'INVALID_PATCH','Ta operacja nie przyjmuje zmian pól.');
  if(body.operation==='remove_added'&&mode!=='apply')fail(422,'INVALID_MODE','Usunięcie dopisku wykonuje się bez podglądu.');
  return {...body,mode};
}
async function previousOverride(ctx,eventId){
  const {data,error}=await ctx.db.from('schedule_overrides').select('action,patch').eq('user_id',ctx.userId).eq('event_id',eventId).maybeSingle();
  schedule.databaseError(error);return data;
}
// A change from the calendar is checked against the occurrence version the calendar last saw.
async function calendarChange(ctx,link,body,{load=loadPlan,selectionOf=linkSelection}={}){
  const change=validateCalendarChange(body);
  const sessionId=`cal:${link.id}:${change.request_id}`;
  const {data:done,error}=await ctx.db.from('schedule_change_proposals').select('id,result,consumed_at')
    .eq('user_id',ctx.userId).eq('provider',PROVIDER).eq('session_id',sessionId).not('consumed_at','is',null).limit(1);
  schedule.databaseError(error);
  if(done.length)return {status:'applied',replayed:true,result:done[0].result};
  const {selection}=await selectionOf(link);
  const data=await load(ctx,selection,{includeCancelled:true});
  const row=data.events.find(item=>item.id===change.event_id&&belongsToPlan(item,selection));
  if(!row)fail(404,'NOT_IN_PLAN','Tych zajęć nie ma już w Twoim planie. Odśwież kalendarz.');
  if(occurrence(row).version!==change.expected_version)
    fail(409,'PLAN_CHANGED','Plan zmienił się w międzyczasie. Kalendarz zostanie odświeżony — spróbuj ponownie.');
  if(row.status==='wolne')fail(422,'DAY_OFF','Dni wolnych nie można zmieniać.');
  // "remove" is what deleting in a calendar means: drop a makeup class, otherwise cancel privately.
  if(change.operation==='remove')change.operation=row.is_added?'remove_added':'cancel';
  if(change.operation==='remove_added'&&change.mode!=='apply')fail(422,'INVALID_MODE','Usunięcie dopisku wykonuje się bez podglądu.');
  if(change.operation==='remove_added'){
    if(!row.is_added)fail(422,'NOT_ADDED','To nie są dopisane zajęcia. Użyj odwołania.');
    const {data:removed,error:removeError}=await ctx.db.from('user_added_events').update({status:'removed',removed_at:new Date().toISOString()})
      .eq('user_id',ctx.userId).eq('event_id',row.id).eq('schedule_name',link.faculty).eq('status','active').select('id');
    schedule.databaseError(removeError);
    if(!removed.length)fail(409,'PLAN_CHANGED','Plan zmienił się w międzyczasie. Kalendarz zostanie odświeżony — spróbuj ponownie.');
    return {status:'applied',result:{event_id:row.id,operation:'remove_added'}};
  }
  const previous=await previousOverride(ctx,row.id);
  let args;
  if(change.operation==='restore'){
    if(!previous)fail(422,'NOTHING_TO_RESTORE','Te zajęcia nie mają prywatnej zmiany.');
    args={event_id:row.id,operation:'delete'};
  }else if(change.operation==='cancel'){
    if(row.is_added)fail(422,'ADDED_EVENT','To są dopisane zajęcia. Usuń dopisek zamiast odwoływać.');
    args={event_id:row.id,operation:'upsert',action:'cancel',patch:{}};
  }else{
    // An override replaces the whole patch: keep earlier private changes of other fields.
    const values={...change.values};
    if(values.room==='')values.room=null;
    args={event_id:row.id,operation:'upsert',action:'modify',patch:{...(previous?.action==='modify'?previous.patch:{}),...values}};
  }
  const proposal=await schedule.propose(ctx,args,PROVIDER,sessionId);
  if(change.mode==='propose')return {status:'proposed',proposal};
  return {status:'applied',result:await schedule.confirm(ctx,{proposal_id:proposal.id,provider:PROVIDER,session_id:sessionId})};
}
// Confirms a preview created earlier through this same link (agent suggestions accepted in the calendar).
async function confirmCalendarProposal(ctx,link,body){
  schedule.keys(body,['proposal_id']);schedule.uuid(body.proposal_id);
  const {data,error}=await ctx.db.from('schedule_change_proposals').select('session_id').eq('id',body.proposal_id)
    .eq('user_id',ctx.userId).eq('provider',PROVIDER).maybeSingle();
  schedule.databaseError(error);
  if(!data||!data.session_id.startsWith(`cal:${link.id}:`))fail(404,'NOT_FOUND','Nie znaleziono podglądu zmiany.');
  return {status:'applied',result:await schedule.confirm(ctx,{proposal_id:body.proposal_id,provider:PROVIDER,session_id:data.session_id})};
}
function bearer(req){
  const header=String(req.headers.authorization||'').trim();
  return header.toLowerCase().startsWith('bearer ')?header.slice(7).trim():'';
}
async function useLink(db,hash){
  const {data,error}=await db.rpc('use_calendar_link',{p_token_hash:hash});
  linkError(error);return data;
}
function linkEndpoint(method,handle,client=getSupabaseAdminClient){
  return async(req,res)=>{
    res.setHeader('Cache-Control','no-store');
    if(req.method!==method)return res.status(405).json({ok:false,error:'METHOD_NOT_ALLOWED'});
    try{
      const hash=tokenHash(bearer(req)),db=client();
      const link=await useLink(db,hash);
      const result=await handle(req,{db,userId:link.user_id},link,res);
      if(result!==undefined)return res.status(200).json({ok:true,...result});
    }catch(error){return res.status(error.statusCode||503).json({ok:false,error:error.code||'CALENDAR_SYNC_UNAVAILABLE',
      message:error.statusCode?error.message:'Synchronizacja kalendarza jest chwilowo niedostępna.'});}
  };
}
module.exports={PROVIDER,validateCalendarChange,calendarChange,confirmCalendarProposal,LINK_DAYS,newCode,codeHash,newToken,tokenHash,linkError,readUserSettings,linkSelection,feedRange,buildFeed,occurrence,linkEndpoint};
