"use strict";
const schedule=require('./schedule');
const {normalize,eventKind,resolveSubject,belongsToPlan,externalEvent,missingGroups}=require('./scheduleSearch');
const FIELDS='id,faculty,date,start_time,duration_min,subject,instructor,room,group,type,status';
const SEMANTIC_TOOLS=['schedule.find_subjects','schedule.get_next_occurrence','schedule.get_my_schedule','schedule.find_makeup_options'];
const KIND_LABELS={laboratory:'laboratorium',lecture:'wykład',exercise:'ćwiczenia',project:'projekt',language:'lektorat',other:'inne'};
function clock(now){
  const parts=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Warsaw',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(now).map(part=>[part.type,part.value]));
  return {date:`${parts.year}-${parts.month}-${parts.day}`,time:`${parts.hour}:${parts.minute}:${parts.second}`};
}
function isoDate(value){
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value))||new Date(value).toISOString().slice(0,10)!==value)
    schedule.fail(422,'INVALID_DATE','Podaj poprawną datę YYYY-MM-DD.');
  return value;
}
function plusDays(date,days){const value=new Date(date+'T12:00:00Z');value.setUTCDate(value.getUTCDate()+days);return value.toISOString().slice(0,10);}
async function pages(query){
  const result=[];
  for(let offset=0;;offset+=1000){
    const {data,error}=await query.range(offset,offset+999);schedule.databaseError(error);
    result.push(...data);
    if(result.length>50000)schedule.fail(503,'SCHEDULE_TOO_LARGE','Plan jest zbyt duży, aby potwierdzić kompletny wynik.');
    if(data.length<1000)return result;
  }
}
async function loadPlan(ctx,selection){
  const faculties=[...new Set([selection.faculty,'all',...(selection.external||[]).map(item=>item.faculty)])];
  const source=await pages(ctx.db.from('events').select(FIELDS).in('faculty',faculties)
    .or('status.is.null,status.eq.aktywne,status.eq.wolne').order('id'));
  const overrides=await schedule.listOverrides(ctx),byId=new Map(overrides.map(row=>[row.event_id,row]));
  const additions=await pages(ctx.db.from('user_added_events').select('event_id').eq('user_id',ctx.userId)
    .eq('schedule_name',selection.faculty).eq('status','active').order('id'));
  const added=new Set(additions.map(row=>row.event_id)),merged=new Map(source.map(row=>[row.id,row]));
  for(const override of overrides)if(override.events&&faculties.includes(override.events.faculty))merged.set(override.event_id,override.events);
  const events=[...merged.values()].flatMap(row=>{
    const override=byId.get(row.id);
    if(override?.action==='cancel'||!['aktywne','wolne'].includes(row.status??'aktywne'))return [];
    return [{...row,...(override?.patch||{}),is_added:added.has(row.id),override_revision:override?.revision||0}];
  }).sort((a,b)=>a.date.localeCompare(b.date)||a.start_time.localeCompare(b.start_time)||a.id.localeCompare(b.id));
  const dates=[...source,...events].filter(row=>row.faculty===selection.faculty||externalEvent(row,selection)).map(row=>row.date).sort();
  const primary=[...source,...events].filter(row=>row.faculty===selection.faculty).map(row=>row.date).sort();
  return {source,events,bounds:{date_from:dates[0]||null,date_to:dates.at(-1)||null},primary_bounds:{date_from:primary[0]||null,date_to:primary.at(-1)||null}};
}
function range(args,now,bounds,{next=false}={}){
  const today=clock(now).date,from=isoDate(args.date_from||today);
  const to=isoDate(args.date_to||(next?(bounds.date_to&&bounds.date_to>from?bounds.date_to:from):from));
  if(to<from)schedule.fail(422,'INVALID_RANGE','Koniec zakresu jest przed początkiem.');
  if(!next&&(Date.parse(to)-Date.parse(from))/86400000>30)schedule.fail(422,'INVALID_RANGE','Zapytanie o plan lub odrobienie obejmuje maksymalnie 31 dni.');
  return {date_from:from,date_to:to};
}
function groupProblem(rows,selection){
  rows=rows.filter(row=>row.faculty===selection.faculty);
  const missing=missingGroups(rows,selection.groups);
  if(missing.length)return {status:'missing_groups',required_groups:missing,
    message:`Wybierz w aplikacji grupę ${missing.join(', ')}. Bez niej nie mogę potwierdzić Twojego terminu.`};
  if(rows.some(row=>!row.is_added&&row.faculty!=='all'&&row.status!=='wolne'&&eventKind(row.type)!=='lecture'&&!String(row.group||'').trim()))
    return {status:'group_information_missing',message:'W danych tych zajęć brakuje informacji o grupie. Nie mogę potwierdzić, który termin jest Twój.'};
  return null;
}
function inRange(row,window){return row.date>=window.date_from&&row.date<=window.date_to;}
function future(row,now){const time=clock(now);return row.date>time.date||(row.date===time.date&&row.start_time>=time.time);}
function describe(row){
  const end=minutes(row.start_time)+row.duration_min;
  const endTime=String(Math.floor(end/60)%24).padStart(2,'0')+':'+String(Math.floor(end%60)).padStart(2,'0');
  const day=new Intl.DateTimeFormat('pl-PL',{weekday:'long',timeZone:'Europe/Warsaw'}).format(new Date(row.date+'T12:00:00Z'));
  return `${row.subject} — ${row.date} (${day}), ${String(row.start_time).slice(0,5)}–${endTime}, ${row.type||'zajęcia'}, grupa ${row.group||'wszystkie'}, sala ${row.room||'nie podano'}${row.instructor?', prowadzący: '+row.instructor:''}`;
}
function minutes(value){const parts=value.split(':').map(Number);return parts[0]*60+parts[1]+(parts[2]||0)/60;}
function conflict(a,b){return a.date===b.date&&a.id!==b.id&&minutes(a.start_time)<minutes(b.start_time)+b.duration_min&&minutes(b.start_time)<minutes(a.start_time)+a.duration_min;}
async function queryPlan(ctx,selection,name,args,now=new Date(),load=loadPlan){
  if(!SEMANTIC_TOOLS.includes(name))schedule.fail(422,'UNKNOWN_TOOL','Nieznane narzędzie.');
  schedule.keys(args,name==='schedule.find_subjects'?['query','kind']:name==='schedule.get_my_schedule'?['date_from','date_to','limit','offset']:['query','kind','date_from','date_to']);
  if(name!=='schedule.get_my_schedule')schedule.text(args.query,256,true);
  if(args.kind!==undefined)schedule.text(args.kind,32,true);
  const data=await load(ctx,selection);
  const bounds=['schedule.get_my_schedule','schedule.find_makeup_options'].includes(name)?data.bounds:(data.primary_bounds||data.bounds);
  const common={faculty:selection.faculty,groups:selection.groups,timezone:'Europe/Warsaw',available_range:bounds};
  if(!data.source.some(row=>row.faculty===selection.faculty))return {...common,status:'data_unavailable',message:'Brak danych wybranego planu. Nie mogę potwierdzić terminu ani braku zajęć.'};
  let subject;
  if(name!=='schedule.get_my_schedule'){
    subject=resolveSubject(data.source.filter(row=>row.faculty===selection.faculty),args.query,args.kind);
    if(name==='schedule.find_subjects'||subject.status!=='resolved')return {...common,...subject};
    if(subject.kind&&!subject.kinds.includes(subject.kind))return {...common,...subject,status:'kind_not_found',message:`${subject.subject}: w dostępnych danych brak tego rodzaju zajęć. Dostępne rodzaje: ${subject.kinds.map(kind=>KIND_LABELS[kind]).join(', ')}.`};
    if(name==='schedule.find_makeup_options'&&!subject.kind&&subject.kinds.length>1)
      return {...common,...subject,status:'ambiguous_kind',message:'Który rodzaj zajęć chcesz odrobić? Dostępne: '+subject.kinds.map(kind=>KIND_LABELS[kind]).join(', ')};
  }
  const argsWithDefault=name==='schedule.find_makeup_options'&&!args.date_to?{...args,date_to:plusDays(args.date_from||clock(now).date,13)}:args;
  const window=range(argsWithDefault,now,bounds,{next:name==='schedule.get_next_occurrence'});
  if(bounds.date_from&&bounds.date_to&&(window.date_to<bounds.date_from||window.date_from>bounds.date_to))
    return {...common,...window,status:'outside_available_range',message:`Ten okres jest poza dostępnym planem (${bounds.date_from}–${bounds.date_to}). Nie mogę potwierdzić zajęć poza zakresem danych.`};
  const matching=data.events.filter(row=>inRange(row,window)&&(!subject||
    (row.faculty===selection.faculty&&normalize(row.subject)===normalize(subject.subject)&&(!subject.kind||eventKind(row.type)===subject.kind))));
  const problem=groupProblem(matching,selection);
  if(problem)return {...common,...window,...problem,subject:subject?.subject};
  const own=matching.filter(row=>belongsToPlan(row,selection));
  if(name==='schedule.get_my_schedule'){
    const limit=args.limit??30,offset=args.offset??0;
    if(!Number.isInteger(limit)||limit<1||limit>100||!Number.isInteger(offset)||offset<0||offset>50000)schedule.fail(422,'INVALID_PAGE','Nieprawidłowa strona wyników.');
    const rows=own.slice(offset,offset+limit);
    return {...common,...window,status:own.length?'found':'no_events_in_available_data',events:rows,total:own.length,
      next_offset:own.length>offset+limit?offset+limit:null,
      message:own.length?'Twój plan:\n'+rows.map(describe).join('\n')+(own.length>offset+limit?'\nWynik ma kolejną stronę.':''):
        'W tym zakresie nie znaleziono Twoich zajęć w dostępnych danych planu.'};
  }
  if(name==='schedule.get_next_occurrence'){
    const row=own.find(row=>future(row,now));
    return {...common,...window,subject:subject.subject,kind:subject.kind,status:row?'found':'no_upcoming_in_available_data',event:row||null,
      message:row?'Najbliższe zajęcia: '+describe(row):`Nie znaleziono przyszłego terminu dla Twoich grup w dostępnych danych (${window.date_from}–${window.date_to}). To nie potwierdza braku zajęć poza tym zakresem.`};
  }
  const allOwn=data.events.filter(row=>belongsToPlan(row,selection));
  const collisionProblem=groupProblem(data.events.filter(row=>inRange(row,window)),selection);
  if(collisionProblem)return {...common,...window,...collisionProblem};
  const choices=matching.filter(row=>future(row,now)&&!belongsToPlan(row,selection));
  const slots=choices.slice(0,8).map(row=>{
    const collisions=allOwn.filter(other=>conflict(row,other));
    return {...row,event_id:row.id,conflict_status:collisions.length?'conflict':'free',conflicts:collisions};
  });
  return {...common,...window,subject:subject.subject,kind:subject.kind,status:slots.length?'found':'no_makeup_options_in_available_data',slots,total:choices.length,
    message:slots.length?`Znaleziono ${choices.length} istniejących terminów innych grup. Wybierz termin z kart poniżej. Brak kolizji nie oznacza zgody prowadzącego.`:
      'Nie znaleziono terminów innych grup do odrobienia w tym zakresie dostępnych danych.'};
}
module.exports={SEMANTIC_TOOLS,queryPlan,loadPlan,clock};
