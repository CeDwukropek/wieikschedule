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
module.exports={LINK_DAYS,newCode,codeHash,newToken,tokenHash,linkError,readUserSettings,linkSelection,feedRange,buildFeed,occurrence,linkEndpoint};
