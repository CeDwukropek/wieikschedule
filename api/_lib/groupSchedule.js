"use strict";
// A starosta's change of a class for everyone who has it (DB 20261031_group_schedule_changes). Public to read, like
// the plan itself (guests too, never the author); written only through apply_group_schedule_changes, which checks the
// role and the revision the person saw.
const schedule=require('./schedule');
const {pages}=require('./scheduleQueries');
const {fail,keys,text}=schedule;
const FIELDS='event_id,faculty,group,action,patch,reason,revision,updated_at';
const MAX_FACULTIES=9,MAX_CHANGES=40;
const ERRORS={
  GROUP_CHANGE_FORBIDDEN:[403,'FORBIDDEN','Nie możesz zmieniać tych zajęć dla grupy.'],
  INACTIVE_SOURCE:[422,'CLASS_INACTIVE','Te zajęcia są odwołane przez uczelnię albo są dniem wolnym.'],
  OVERRIDE_NOT_FOUND:[404,'NOT_FOUND','Tych zajęć nikt już nie zmienił dla grupy.'],
  EVENT_NOT_FOUND:[404,'NOT_FOUND','Nie znaleziono tych zajęć w planie.'],
  PLAN_CHANGED:[409,'CHANGED','Ktoś zmienił te zajęcia w międzyczasie. Odśwież plan i spróbuj ponownie.'],
};
function groupError(error){
  if(!error)return;
  const known=ERRORS[error.message];
  if(known)fail(...known);
  if(error.code==='42501')fail(...ERRORS.GROUP_CHANGE_FORBIDDEN);
  schedule.databaseError(error);
}
const view=row=>row?Object.fromEntries(FIELDS.split(',').map(key=>[key,row[key]??null])):null;

// Changes of the given plans (the shown one and those of groups from other plans).
async function listGroupChanges(ctx,query){
  keys(query,['faculties']);
  const faculties=[...new Set(String(text(query.faculties,MAX_FACULTIES*257,true)).split(',').map(value=>value.trim()).filter(Boolean))];
  if(!faculties.length||faculties.length>MAX_FACULTIES||faculties.some(value=>value.length>256))fail(422,'INVALID_FACULTY','Podaj od 1 do 9 planów.');
  return {changes:await pages(ctx.db.from('group_schedule_overrides').select(FIELDS).in('faculty',faculties).order('event_id'))};
}
// One or more classes (a series) at once, all or nothing. Each change names the revision it was made on (null: no
// change yet). Returns the new state and the changes that undo it.
async function applyGroupChanges(ctx,body){
  keys(body,['changes']);
  if(!Array.isArray(body.changes)||!body.changes.length||body.changes.length>MAX_CHANGES)fail(422,'INVALID_CHANGES',`Zmień od 1 do ${MAX_CHANGES} zajęć naraz.`);
  const changes=body.changes.map(change=>{
    keys(change,['event_id','operation','action','patch','reason','revision']);
    const {revision,...rest}=change;
    if(revision!==null&&(!Number.isInteger(revision)||revision<1))fail(422,'INVALID_REVISION','Brak wersji zmiany.');
    return {...schedule.validateChange(rest),revision};
  });
  if(new Set(changes.map(change=>change.event_id)).size!==changes.length)fail(422,'INVALID_CHANGES','Te same zajęcia pojawiają się dwa razy.');
  const {data,error}=await ctx.db.rpc('apply_group_schedule_changes',{p_user:ctx.userId,p_changes:changes});
  groupError(error);
  return {results:data.map(row=>({event_id:row.event_id,previous:view(row.previous),current:view(row.current)})),
    undo:data.map(({event_id,previous,current})=>previous
      ?{event_id,operation:'upsert',action:previous.action,patch:previous.patch||{},reason:previous.reason??null,revision:current?.revision??null}
      :{event_id,operation:'delete',revision:current.revision})};
}
module.exports={listGroupChanges,applyGroupChanges};
