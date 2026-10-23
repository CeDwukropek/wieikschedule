"use strict";
const schedule=require('./schedule');
const {pages}=require('./scheduleQueries');
const {belongsToPlan}=require('./scheduleSearch');
const {newCode,rawCode,sha256}=require('./codes');
const {fail,keys,text,uuid}=schedule;
// Never includes owner, author or editor: group entries are public, like the plan itself.
const FIELDS='id,scope,faculty,subject,class_type,group,kind,timing,event_id,anchor,date,start_time,duration_min,due_time,title,details,series_id,state,review_reason,revision,updated_at';
const KINDS=['kolokwium','wejsciowka','sprawozdanie','egzamin','poprawa','projekt','inne'];
const ITEM_KEYS=['id','revision','scope','faculty','subject','class_type','group','kind','timing','event_id','date','start_time','duration_min','due_time','title','details','series_id'];
const MAX_FACULTIES=9,MAX_RANGE_DAYS=200;
const ERRORS={
  PLAN_ITEM_FORBIDDEN:[403,'FORBIDDEN','Nie możesz dodawać ani zmieniać wpisów tej grupy.'],
  ROLE_FORBIDDEN:[403,'FORBIDDEN','Nie możesz nadać tej roli.'],
  PLAN_ITEM_NOT_FOUND:[404,'NOT_FOUND','Nie znaleziono wpisu albo nie możesz go zmienić.'],
  SERIES_NOT_FOUND:[404,'NOT_FOUND','Nie znaleziono serii terminów.'],
  EVENT_NOT_FOUND:[404,'NOT_FOUND','Nie znaleziono tych zajęć w planie.'],
  ROLE_NOT_FOUND:[404,'NOT_FOUND','Nie znaleziono roli albo nie możesz jej odebrać.'],
  INVITE_INVALID:[404,'INVITE_INVALID','Kod jest nieważny, wygasł albo został już użyty.'],
  UNKNOWN_SUBJECT_OR_GROUP:[422,'UNKNOWN_SUBJECT','Ten przedmiot lub ta grupa nie występuje w planie.'],
  UNKNOWN_FACULTY_OR_GROUP:[422,'UNKNOWN_GROUP','Ten kierunek lub ta grupa nie występuje w planie.'],
  INACTIVE_SOURCE:[422,'CLASS_INACTIVE','Te zajęcia są odwołane albo są dniem wolnym.'],
  OUTSIDE_SCHEDULE_HOURS:[422,'OUTSIDE_HOURS','Termin musi mieścić się między 07:00 a 22:00.'],
  INVALID_DATE:[422,'INVALID_DATE','Data jest zbyt odległa.'],
  PLAN_ITEM_CHANGED:[409,'CHANGED','Wpis zmienił się w międzyczasie. Odśwież plan i spróbuj ponownie.'],
  SERIES_TOO_LONG:[422,'SERIES_TOO_LONG','Seria może mieć najwyżej 20 terminów.'],
  TOO_MANY_PLAN_ITEMS:[429,'TOO_MANY_ITEMS','Masz zbyt wiele prywatnych wpisów. Usuń stare.'],
  TOO_MANY_INVITES:[429,'TOO_MANY_INVITES','Masz zbyt wiele niewykorzystanych kodów. Poczekaj, aż wygasną.'],
};
function itemError(error){
  if(!error)return;
  const known=ERRORS[error.message];
  if(known)fail(...known);
  if(error.code==='23505')fail(409,'DUPLICATE','Taki wpis już istnieje.');
  if(error.code==='PT409'||error.code==='40001')fail(...ERRORS.PLAN_ITEM_CHANGED);
  if(error.code?.startsWith('22')||error.code==='23514')fail(422,'INVALID_ITEM','Wpis jest nieprawidłowy. Sprawdź datę, godziny i pola.');
  schedule.databaseError(error);
}
const isDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
function time(value){
  if(value==null)return null;
  const match=typeof value==='string'&&/^([01]\d|2[0-3]):([0-5]\d)(:00)?$/.exec(value);
  if(!match)fail(422,'INVALID_TIME','Nieprawidłowa godzina.');
  return `${match[1]}:${match[2]}:00`;
}
// Shape and types only; the database decides permissions and the rules between fields.
function validateItem(item){
  keys(item,ITEM_KEYS);
  const result={...item};
  if(item.id!==undefined){uuid(item.id);if(!Number.isInteger(item.revision)||item.revision<1)fail(422,'INVALID_REVISION','Brak wersji wpisu.');}
  else{
    if(!['group','personal'].includes(item.scope))fail(422,'INVALID_SCOPE','Wybierz, czy wpis jest dla grupy, czy tylko dla Ciebie.');
    if(!['class','slot','due'].includes(item.timing))fail(422,'INVALID_TIMING','Wybierz termin wpisu.');
    text(item.title,200,true);text(item.faculty,256,true);
  }
  if(item.kind!==undefined&&!KINDS.includes(item.kind))fail(422,'INVALID_KIND','Nieznany rodzaj wpisu.');
  if(item.timing!==undefined&&!['class','slot','due'].includes(item.timing))fail(422,'INVALID_TIMING','Wybierz termin wpisu.');
  for(const [key,max] of [['faculty',256],['subject',512],['class_type',256],['group',128],['title',200],['details',4000]])
    if(item[key]!==undefined)text(item[key],max);
  for(const key of ['event_id','series_id'])if(item[key]!=null)uuid(item[key]);
  if(item.date!=null&&!isDate(item.date))fail(422,'INVALID_DATE','Nieprawidłowa data.');
  for(const key of ['start_time','due_time'])if(item[key]!==undefined)result[key]=time(item[key]);
  if(item.duration_min!=null&&(!Number.isInteger(item.duration_min)||item.duration_min<5||item.duration_min>900))
    fail(422,'INVALID_DURATION','Czas trwania musi wynosić od 5 do 900 minut.');
  return result;
}
function canEdit(item,roles,userId){
  if(!userId)return false;
  if(item.scope==='personal')return true;
  return roles.some(role=>role.role==='admin'||(role.faculty===item.faculty&&(role.role==='starosta'||
    (role.role==='group_starosta'&&item.group!=null&&role.group===item.group))));
}
async function myRoles(ctx){
  if(!ctx.userId)return [];
  return pages(ctx.db.from('plan_roles').select('id,role,faculty,group,carried_from,created_at').eq('user_id',ctx.userId).order('id'));
}
function listQuery(query){
  keys(query,['faculties','from','to']);
  const faculties=[...new Set(String(text(query.faculties,MAX_FACULTIES*257,true)).split(',').map(value=>value.trim()).filter(Boolean))];
  if(!faculties.length||faculties.length>MAX_FACULTIES||faculties.some(value=>value.length>256))fail(422,'INVALID_FACULTY','Podaj od 1 do 9 planów.');
  if(!isDate(query.from)||!isDate(query.to))fail(422,'INVALID_DATE','Podaj zakres dat YYYY-MM-DD.');
  if(query.to<query.from||(Date.parse(query.to)-Date.parse(query.from))/86400000>MAX_RANGE_DAYS)
    fail(422,'INVALID_RANGE',`Zakres obejmuje maksymalnie ${MAX_RANGE_DAYS} dni.`);
  return {faculties,from:query.from,to:query.to};
}
// Group entries of the given plans (also for guests) and, when signed in, the user's private ones with their state.
async function listItems(ctx,query){
  const {faculties,from,to}=listQuery(query);
  const ranged=q=>q.in('faculty',faculties).is('deleted_at',null).gte('date',from).lte('date',to).order('date').order('id');
  const [group,personal,roles]=await Promise.all([
    pages(ranged(ctx.db.from('plan_items').select(FIELDS).eq('scope','group'))),
    ctx.userId?pages(ranged(ctx.db.from('plan_items').select(FIELDS).eq('owner_id',ctx.userId))):[],
    myRoles(ctx)]);
  const items=[...group,...personal];
  const states=new Map();
  for(let index=0;ctx.userId&&index<items.length;index+=200){
    const {data,error}=await ctx.db.from('plan_item_state').select('item_id,hidden,progress,note')
      .eq('user_id',ctx.userId).in('item_id',items.slice(index,index+200).map(item=>item.id));
    itemError(error);
    for(const row of data)states.set(row.item_id,{hidden:row.hidden,progress:row.progress,note:row.note??null});
  }
  return {items:items.map(item=>({...item,my_state:states.get(item.id)||null,can_edit:canEdit(item,roles,ctx.userId)})),
    roles:roles.map(({id,role,faculty,group})=>({id,role,faculty,group}))};
}
async function saveItems(ctx,body){
  keys(body,['items']);
  if(!Array.isArray(body.items)||!body.items.length||body.items.length>20)fail(422,'INVALID_ITEMS','Zapisz od 1 do 20 wpisów naraz.');
  const {data,error}=await ctx.db.rpc('save_plan_items',{p_user:ctx.userId,p_items:body.items.map(validateItem)});
  itemError(error);
  return {items:data.map(item=>({...item,can_edit:true}))};
}
// Returns the new revisions, which are exactly what undo (restore: true) needs.
async function removeItems(ctx,body){
  keys(body,['items','restore']);
  if(!Array.isArray(body.items)||!body.items.length||body.items.length>50)fail(422,'INVALID_ITEMS','Usuń od 1 do 50 wpisów naraz.');
  for(const item of body.items){keys(item,['id','revision']);uuid(item.id);
    if(!Number.isInteger(item.revision)||item.revision<1)fail(422,'INVALID_REVISION','Brak wersji wpisu.');}
  if(body.restore!==undefined&&typeof body.restore!=='boolean')fail(422,'INVALID_ARGUMENTS','Nieprawidłowe pola żądania.');
  const {data,error}=await ctx.db.rpc('remove_plan_items',{p_user:ctx.userId,p_items:body.items,p_restore:body.restore===true});
  itemError(error);
  return {items:data};
}
async function setState(ctx,body){
  keys(body,['item_id','hidden','progress','note']);uuid(body.item_id);
  const {item_id:itemId,...state}=body;
  if(!Object.keys(state).length)fail(422,'INVALID_ARGUMENTS','Nieprawidłowe pola żądania.');
  if(state.hidden!==undefined&&typeof state.hidden!=='boolean')fail(422,'INVALID_ARGUMENTS','Nieprawidłowe pola żądania.');
  if(state.progress!==undefined&&!['todo','ready','done'].includes(state.progress))fail(422,'INVALID_PROGRESS','Nieznany stan wpisu.');
  if(state.note!==undefined)text(state.note,2000);
  const {data,error}=await ctx.db.rpc('set_plan_item_state',{p_user:ctx.userId,p_item:itemId,p_state:state});
  itemError(error);
  return {state:data};
}
function inviteHash(code){
  const raw=rawCode(code);
  if(!raw)fail(422,'INVALID_CODE','Nieprawidłowy kod zaproszenia.');
  return sha256('invite:'+raw);
}
// Own roles plus the places this user manages; holders are never identified.
async function listRoles(ctx){
  const roles=await myRoles(ctx);
  const admin=roles.some(role=>role.role==='admin');
  const faculties=roles.filter(role=>role.role==='starosta').map(role=>role.faculty);
  const managed=admin||faculties.length?await pages((admin?ctx.db.from('plan_roles').select('id,role,faculty,group,carried_from,created_at,user_id').neq('role','admin')
    :ctx.db.from('plan_roles').select('id,role,faculty,group,carried_from,created_at,user_id').in('faculty',faculties)).order('faculty').order('group').order('id')):[];
  return {roles:roles.map(({id,role,faculty,group})=>({id,role,faculty,group})),
    managed:managed.map(({user_id:holder,...role})=>({...role,mine:holder===ctx.userId}))};
}
async function createInvite(ctx,body){
  keys(body,['role','faculty','group']);
  if(!['starosta','group_starosta'].includes(body.role))fail(422,'INVALID_ROLE','Nieznana rola.');
  text(body.faculty,256,true);
  if(body.role==='group_starosta')text(body.group,128,true);else if(body.group!=null)fail(422,'INVALID_ROLE','Starosta kierunku nie ma grupy.');
  const code=newCode();
  const {data,error}=await ctx.db.rpc('create_plan_role_invite',{p_user:ctx.userId,p_code_hash:inviteHash(code),
    p_role:body.role,p_faculty:body.faculty.trim(),p_group:body.role==='group_starosta'?body.group.trim():null});
  itemError(error);
  return {invite:{...data,code}};
}
async function redeemInvite(ctx,body){
  keys(body,['code']);
  const {data,error}=await ctx.db.rpc('redeem_plan_role_invite',{p_user:ctx.userId,p_code_hash:inviteHash(body.code)});
  itemError(error);
  return {role:data};
}
async function revokeRole(ctx,body){
  keys(body,['role_id']);uuid(body.role_id);
  const {data,error}=await ctx.db.rpc('revoke_plan_role',{p_user:ctx.userId,p_role_id:body.role_id});
  itemError(error);
  return {role:data};
}
// Calendar mirror: entries of the plan's groups and the owner's own; an entry for every group of a
// subject belongs to the plan when the plan has that subject.
function entryBelongs(item,selection,subjects){
  if(item.scope==='personal')return true;
  if(item.group==null)return subjects.has(item.faculty+'\n'+item.subject);
  return belongsToPlan({faculty:item.faculty,subject:item.subject,group:item.group,type:item.class_type,status:'aktywne'},selection);
}
function planFaculties(selection){return [...new Set([selection.faculty,...(selection.external||[]).map(item=>item.faculty)])].sort();}
async function feedEntries(ctx,selection,window,events){
  const subjects=new Set(events.map(row=>row.faculty+'\n'+row.subject));
  const {items}=await listItems(ctx,{faculties:planFaculties(selection).join(','),from:window.date_from,to:window.date_to});
  return items.filter(item=>entryBelongs(item,selection,subjects)&&!item.my_state?.hidden)
    .map(({my_state:state,can_edit:_,...item})=>({...item,progress:state?.progress||'todo'}));
}
async function entriesFingerprint(ctx,selection){
  const faculties=planFaculties(selection);
  const [group,personal]=await Promise.all([
    pages(ctx.db.from('plan_items').select('id,revision').eq('scope','group').in('faculty',faculties).is('deleted_at',null).order('id')),
    pages(ctx.db.from('plan_items').select('id,revision').eq('owner_id',ctx.userId).is('deleted_at',null).order('id'))]);
  const states=await pages(ctx.db.from('plan_item_state').select('item_id,hidden,progress,updated_at').eq('user_id',ctx.userId).order('item_id'));
  return [group,personal,states];
}
module.exports={KINDS,itemError,validateItem,canEdit,listItems,saveItems,removeItems,setState,inviteHash,listRoles,
  createInvite,redeemInvite,revokeRole,entryBelongs,feedEntries,entriesFingerprint};
