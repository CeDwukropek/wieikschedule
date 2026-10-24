"use strict";
// Entries proposed by the schedule agent (E6.7). The agent never writes: plan_items.prepare_entries turns the
// terms it read from the conversation (e.g. a pasted message from the instructor) into a preview, resolved
// against the university plan of the verified groups; the person confirms all or some of them in the app.
// The preview is signed, so the app can only save what this tool prepared, for the same person.
const crypto=require('node:crypto');
const schedule=require('./schedule');
const {sign,verify}=require('./toolSecret');
const {loadPlan,pages}=require('./scheduleQueries');
const {normalize,eventKind,resolveSubject,belongsToUser,KINDS:CLASS_KINDS}=require('./scheduleSearch');
const planItems=require('./planItems');
const {fail,keys,text}=schedule;

const MAX_TERMS=20,PREVIEW_HOURS=2;
const LABELS={kolokwium:'Kolokwium',wejsciowka:'Wejściówka',sprawozdanie:'Sprawozdanie',egzamin:'Egzamin',poprawa:'Poprawa',projekt:'Projekt',inne:'Inne'};
const HAND_IN=['sprawozdanie','projekt'];
const isDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;
const isTime=value=>typeof value==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(value);
const hhmm=value=>String(value||'').slice(0,5);
const end=(start,minutes)=>{const total=Number(start.slice(0,2))*60+Number(start.slice(3,5))+minutes;
  return `${String(Math.floor(total/60)%24).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;};
const terms=count=>`${count} ${count===1?'termin':[2,3,4].includes(count%10)&&![12,13,14].includes(count%100)?'terminy':'terminów'}`;
const day=date=>new Date(date+'T12:00:00Z').toLocaleDateString('pl-PL',{weekday:'short',day:'numeric',month:'numeric',timeZone:'UTC'});

function readTerm(term){
  keys(term,['date','time','duration_min','hand_in','due_time']);
  if(!isDate(term.date))fail(422,'INVALID_DATE','Podaj daty w formacie RRRR-MM-DD.');
  for(const key of ['time','due_time'])if(term[key]!=null&&!isTime(term[key]))fail(422,'INVALID_TIME','Podaj godziny w formacie GG:MM.');
  if(term.duration_min!=null&&(!Number.isInteger(term.duration_min)||term.duration_min<5||term.duration_min>900))
    fail(422,'INVALID_DURATION','Czas trwania musi wynosić od 5 do 900 minut.');
  if(term.hand_in!=null&&typeof term.hand_in!=='boolean')fail(422,'INVALID_ARGUMENTS','Nieprawidłowe pola terminu.');
  return term;
}
function readArgs(args){
  keys(args,['kind','subject','class_kind','scope','title','details','terms']);
  if(!planItems.KINDS.includes(args.kind))fail(422,'INVALID_KIND','Nieznany rodzaj wpisu.');
  text(args.subject,256,true);
  if(args.class_kind!=null&&!CLASS_KINDS.includes(args.class_kind))fail(422,'INVALID_KIND','Wybierz poprawny rodzaj zajęć.');
  if(args.scope!=null&&!['group','personal'].includes(args.scope))fail(422,'INVALID_SCOPE','Wybierz: dla grupy albo tylko dla mnie.');
  text(args.title,200);text(args.details,4000);
  if(!Array.isArray(args.terms)||!args.terms.length||args.terms.length>MAX_TERMS)fail(422,'INVALID_TERMS',`Podaj od 1 do ${MAX_TERMS} terminów.`);
  return {...args,terms:args.terms.map(readTerm)};
}
// Entries that already exist would be refused by the database; they are shown, but not offered.
function duplicateOf(existing,item,userId){
  return existing.find(row=>row.kind===item.kind&&row.scope===item.scope&&(row.scope==='group'||row.owner_id===userId)&&(item.timing==='class'
    ?row.timing==='class'&&row.event_id===item.event_id
    :row.timing!=='class'&&normalize(row.subject||'')===normalize(item.subject||'')&&(row.group||'')===(item.group||'')
      &&row.date===item.date&&hhmm(row.start_time||row.due_time)===hhmm(item.start_time||item.due_time)));
}

async function prepareEntries(ctx,selection,rawArgs,now=new Date(),load=loadPlan){
  const args=readArgs(rawArgs);
  const data=await load(ctx,selection);
  const rows=data.source.filter(row=>row.faculty===selection.faculty);
  if(!rows.length)return {status:'data_unavailable',message:'Brak danych wybranego planu.'};
  const subject=resolveSubject(rows,args.subject,args.class_kind);
  if(subject.status!=='resolved')return subject;
  if(subject.kind&&!subject.kinds.includes(subject.kind))return {...subject,status:'kind_not_found',
    message:`${subject.subject}: w planie nie ma tego rodzaju zajęć.`};
  // The group's own classes of the subject in the university plan; private changes do not move the group's term.
  const own=rows.filter(row=>normalize(row.subject)===normalize(subject.subject)&&(row.status??'aktywne')==='aktywne'
    &&belongsToUser(row,selection.groups)&&(!subject.kind||eventKind(row.type)===subject.kind))
    .sort((a,b)=>(eventKind(a.type)==='lecture')-(eventKind(b.type)==='lecture')||a.date.localeCompare(b.date)||a.start_time.localeCompare(b.start_time));
  if(!own.length)return {status:'no_classes',subject:subject.subject,
    message:`Nie znalazłem zajęć z przedmiotu ${subject.subject} dla Twoich grup. Sprawdź wybrane grupy w aplikacji.`};
  const groupOf=row=>String(row.group||'').trim()||null;
  const ownGroup=groupOf(own.find(row=>eventKind(row.type)!=='lecture')||own[0]);
  const roles=await planItems.myRoles(ctx);
  const dates=args.terms.map(term=>term.date).sort();
  const existing=await pages(ctx.db.from('plan_items').select('id,scope,owner_id,kind,timing,event_id,subject,group,date,start_time,due_time')
    .eq('faculty',selection.faculty).is('deleted_at',null).gte('date',dates[0]).lte('date',dates.at(-1)).order('id'));
  const title=(args.title||'').trim()||LABELS[args.kind],details=(args.details||'').trim()||null;
  const items=args.terms.map((term,index)=>{
    const warnings=[];
    let item={scope:args.scope||'group',faculty:selection.faculty,kind:args.kind,title,details},needsTime=false,label,when;
    const handIn=term.hand_in===true||(term.hand_in==null&&HAND_IN.includes(args.kind)&&!term.time);
    if(handIn){
      item={...item,subject:subject.subject,group:ownGroup,timing:'due',date:term.date,due_time:term.due_time?term.due_time+':00':null};
      label=`${day(term.date)}, ${term.due_time?'do '+term.due_time:'cały dzień'}`;
      when={date:term.date,due_time:item.due_time};
    }else{
      const sameDay=own.filter(row=>row.date===term.date);
      const atTime=term.time?sameDay.filter(row=>hhmm(row.start_time)===term.time):sameDay;
      const host=atTime[0];
      if(host){
        item={...item,timing:'class',event_id:host.id,group:groupOf(host)};
        label=`${day(host.date)}, ${hhmm(host.start_time)}–${end(hhmm(host.start_time),host.duration_min)} · ${host.type||'zajęcia'}${host.room?' · '+host.room:''}`;
        when={date:host.date,start_time:host.start_time,duration_min:host.duration_min};
        if(sameDay.length>1)warnings.push('Tego dnia są też inne zajęcia z tego przedmiotu: '+
          sameDay.filter(row=>row!==host).map(row=>`${row.type||'zajęcia'} ${hhmm(row.start_time)}`).join(', ')+'.');
      }else{
        warnings.push(sameDay.length?'O tej godzinie Twoja grupa nie ma tych zajęć.':'W tym dniu Twoja grupa nie ma zajęć z tego przedmiotu.');
        item={...item,subject:subject.subject,group:ownGroup,timing:'slot',date:term.date,
          start_time:term.time?term.time+':00':null,duration_min:term.duration_min||90,due_time:null};
        needsTime=!term.time;
        when={date:term.date,start_time:item.start_time,duration_min:item.duration_min};
        label=`${day(term.date)}, ${term.time?`${term.time}–${end(term.time,item.duration_min)}`:'godzina do podania'}`;
        if(needsTime)warnings.push('Podaj godzinę — nie zgaduję jej.');
      }
    }
    if(item.scope==='group'&&!planItems.canEdit({scope:'group',faculty:item.faculty,group:item.group},roles,ctx.userId)){
      item={...item,scope:'personal'};
      warnings.push('Nie możesz dodawać wpisów dla tej grupy — wpis będzie tylko dla Ciebie.');
    }
    if(item.scope==='personal'&&item.timing!=='class')item.group=null;
    const duplicate=duplicateOf(existing,item,ctx.userId);
    if(duplicate)warnings.push('Taki wpis już istnieje.');
    // `when` places the entry as a draft in the grid; it is not part of what gets saved.
    return {index,item,when,label,needs_time:needsTime,warnings,selectable:!duplicate,
      audience:item.scope==='personal'?'Tylko Ty':item.group?`Grupa ${item.group}`:'Wszystkie grupy'};
  });
  const proposal={type:'plan_items',id:crypto.randomUUID(),faculty:selection.faculty,subject:subject.subject,kind:args.kind,
    expires_at:new Date(now.getTime()+PREVIEW_HOURS*3600000).toISOString(),items};
  const offered=items.filter(entry=>entry.selectable).length;
  return {status:'prepared',subject:subject.subject,
    message:`Przygotowałem podgląd: ${terms(items.length)}, w tym ${offered} do dodania. `+
      'Sprawdź go w aplikacji i zatwierdź zaznaczone. Nic nie zostało zapisane.',
    proposal:{...proposal,signature:sign(signed(ctx.userId,proposal))}};
}
const signed=(userId,proposal)=>JSON.stringify(['plan-items-preview-v1',userId,proposal.id,proposal.expires_at,
  proposal.items.map(entry=>[entry.index,entry.item,entry.needs_time,entry.selectable])]);

// Saves the chosen entries of a preview exactly as prepared; only a missing hour may be filled in.
async function confirmEntries(ctx,body,now=new Date()){
  keys(body,['proposal','indexes','times']);
  const proposal=body.proposal;
  if(!proposal||proposal.type!=='plan_items'||!Array.isArray(proposal.items)||!verify(signed(ctx.userId,proposal),proposal.signature))
    fail(422,'INVALID_PREVIEW','Ten podgląd nie pochodzi z narzędzi planu albo należy do innego konta.');
  if(!(Date.parse(proposal.expires_at)>now.getTime()))fail(409,'PREVIEW_EXPIRED','Podgląd wygasł. Poproś agenta o nowy.');
  const indexes=body.indexes,times=body.times||{};
  if(!Array.isArray(indexes)||!indexes.length||new Set(indexes).size!==indexes.length)fail(422,'INVALID_ITEMS','Zaznacz terminy do dodania.');
  if(typeof times!=='object'||Array.isArray(times))fail(422,'INVALID_ARGUMENTS','Nieprawidłowe godziny.');
  const chosen=indexes.map(index=>{
    const entry=proposal.items.find(row=>row.index===index);
    if(!entry||!entry.selectable)fail(422,'INVALID_ITEMS','Tego terminu nie można dodać.');
    if(!entry.needs_time)return entry.item;
    if(!isTime(times[index]))fail(422,'TIME_REQUIRED','Podaj godzinę dla terminów, w które grupa nie ma zajęć.');
    return {...entry.item,start_time:times[index]+':00'};
  });
  for(const key of Object.keys(times))if(!proposal.items.find(row=>String(row.index)===key)?.needs_time)
    fail(422,'INVALID_ARGUMENTS','Godzinę można podać tylko dla terminu bez zajęć.');
  return planItems.saveItems(ctx,{items:chosen});
}
module.exports={prepareEntries,confirmEntries};
