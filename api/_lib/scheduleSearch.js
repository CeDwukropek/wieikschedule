"use strict";
// Deterministic subject resolution. No model, embeddings, or invented catalogue entries.
function normalize(value) {
  return String(value??'').toLocaleLowerCase('pl').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/ł/g,'l').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
}
function stem(word) {
  for(const ending of ['ami','ach','ego','emu','ych','ich','iem','ow','ie','ia','em','om','ym','im','a','i','y','u','e']) {
    if(word.endsWith(ending)&&word.length-ending.length>=4)return word.slice(0,-ending.length);
  }
  return word;
}
const KINDS=['laboratory','lecture','exercise','project','language','other'];
function eventKind(type) {
  const value=normalize(type);
  if(/lab|labor|labol/.test(value))return 'laboratory';
  if(/wyk|lecture/.test(value))return 'lecture';
  if(/cwicz|exercise/.test(value))return 'exercise';
  if(/projekt|project/.test(value))return 'project';
  if(/lekt|language/.test(value))return 'language';
  return 'other';
}
const STOP=new Set('kiedy mam mamy moje moich najblizsze najblizszy najblizsza z ze na sprawdz pokaz termin terminy zajecia zajec przedmiot przedmiotu chce odrobic moge'.split(' '));
function parseQuery(query) {
  const words=normalize(query).split(' ').filter(Boolean),subject=[],kinds=new Set();
  let laboratory=false;
  for(const word of words){
    if(/^(lab|laby|labow|labach|laba|laboratori\w*|labolatori\w*)$/.test(word)){kinds.add('laboratory');laboratory=true;continue;}
    if(/^wyklad\w*$/.test(word)){kinds.add('lecture');continue;}
    if(/^cwiczen\w*$|^cwiczeni\w*$|^cw$/.test(word)){kinds.add('exercise');continue;}
    if(/^lektorat\w*$/.test(word)){kinds.add('language');continue;}
    if(!STOP.has(word))subject.push(word);
  }
  const cleaned=laboratory?subject.filter(word=>!/^komputerow\w*$/.test(word)):subject;
  return {text:cleaned.join(' '),kinds:[...kinds]};
}
function editDistance(a,b){
  let previous=Array.from({length:b.length+1},(_,i)=>i);
  for(let i=0;i<a.length;i++){
    const row=[i+1];for(let j=0;j<b.length;j++)row.push(Math.min(row[j]+1,previous[j+1]+1,previous[j]+(a[i]===b[j]?0:1)));
    previous=row;
  }
  return previous[b.length];
}
function catalogue(rows){
  const map=new Map();
  for(const row of rows){
    if(row.faculty==='all'||row.status==='wolne'||!row.subject)continue;
    const key=normalize(row.subject);
    if(!map.has(key))map.set(key,{name:row.subject,kinds:new Set()});
    map.get(key).kinds.add(eventKind(row.type));
  }
  return [...map.values()].map(row=>({...row,kinds:[...row.kinds].sort()}));
}
function resolveSubject(rows,query,requestedKind){
  const parsed=parseQuery(query),entries=catalogue(rows),raw=normalize(query);
  if(requestedKind&&!KINDS.includes(requestedKind))return {status:'invalid_kind',message:'Wybierz poprawny rodzaj zajęć.'};
  if(parsed.kinds.length>1||(requestedKind&&parsed.kinds.length&&parsed.kinds[0]!==requestedKind))
    return {status:'ambiguous_kind',message:'Doprecyzuj rodzaj zajęć: np. laboratorium albo wykład.'};
  const kind=requestedKind||parsed.kinds[0]||null;
  const exact=entries.filter(entry=>normalize(entry.name)===raw||normalize(entry.name)===parsed.text);
  const words=parsed.text.split(' ').filter(Boolean),stems=words.map(stem);
  const scored=entries.map(entry=>{
    const name=normalize(entry.name),tokens=name.split(' ').map(stem);
    const acronym=name.split(' ').filter(word=>!['i','z','w','na'].includes(word)).map(word=>word[0]).join('');
    if(exact.includes(entry))return {...entry,score:100};
    if(words.length===1&&words[0].length>=2&&words[0]===acronym)return {...entry,score:95};
    if(stems.length&&stems.every(word=>tokens.includes(word)))return {...entry,score:90};
    // Typos are suggestions requiring confirmation, never proof of identity.
    if(stems.length&&stems.every(word=>tokens.some(token=>word===token||
       (word.length>=5&&Math.abs(word.length-token.length)<=2&&editDistance(word,token)<=(word.length>=9?2:1)))))return {...entry,score:50};
    return {...entry,score:0};
  }).filter(entry=>entry.score).sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name,'pl'));
  const best=scored[0]?.score||0,top=scored.filter(entry=>entry.score===best);
  if(best>=90&&top.length===1)return {status:'resolved',subject:top[0].name,kind,kinds:top[0].kinds,candidates:top.map(({name,kinds})=>({name,kinds}))};
  if(scored.length)return {status:'ambiguous_subject',kind,candidates:top.slice(0,10).map(({name,kinds})=>({name,kinds})),total_candidates:top.length,
    message:'Który przedmiot masz na myśli? '+top.slice(0,10).map(entry=>entry.name).join('; ')};
  return {status:'subject_not_found',kind,candidates:[],message:'Nie rozpoznano przedmiotu w katalogu wybranego planu. Podaj jego nazwę lub fragment nazwy.'};
}
function isCommon(row){return row.faculty==='all'||row.status==='wolne'||eventKind(row.type)==='lecture'||['w','wszystkie grupy'].includes(normalize(row.group));}
function belongsToUser(row,groups){
  if(row.is_added||isCommon(row))return true;
  const labels=String(row.group||'').split(/[,/]/).map(value=>value.trim()).filter(Boolean);
  const values=Object.values(groups).filter(Boolean);
  const lek=String(groups.Lek||'').toUpperCase().replace(/\s/g,'').replace(/^LEK/,'');
  if(lek&&(eventKind(row.type)==='language'||labels.some(label=>/^lek/i.test(label)))){
    const language=lek==='N'?'niemiecki':lek==='F'?'francuski':'angielski';
    if(!normalize(row.subject).includes(language))return false;
    if(['N','F'].includes(lek))return true;
  }
  return labels.some(label=>values.includes(label)||(!/\d/.test(label)&&values.some(value=>value.startsWith(label))));
}
function missingGroups(rows,groups){
  const values=Object.values(groups).filter(Boolean),missing=new Set();
  for(const row of rows){
    if(row.is_added||isCommon(row))continue;
    for(const label of String(row.group||'').split(/[,/]/).map(value=>value.trim()).filter(Boolean)){
      const prefix=label.match(/^[^\d\s]+/)?.[0];
      if(prefix&&!values.some(value=>normalize(value.match(/^[^\d\s]+/)?.[0])===normalize(prefix)||
          (normalize(prefix)==='lek'&&/^lek/i.test(value))))missing.add(prefix);
    }
  }
  return [...missing].sort();
}
function externalEvent(row,selection){
  return (selection.external||[]).some(item=>row.faculty===item.faculty&&(!item.subject||normalize(item.subject)===normalize(row.subject))&&belongsToUser(row,item.groups));
}
function belongsToPlan(row,selection){
  return ((row.faculty===selection.faculty||row.faculty==='all')&&belongsToUser(row,selection.groups))||externalEvent(row,selection);
}
module.exports={normalize,eventKind,resolveSubject,belongsToUser,belongsToPlan,externalEvent,missingGroups,KINDS};
