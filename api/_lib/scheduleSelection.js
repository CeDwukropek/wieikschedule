"use strict";
const {keys,text,fail}=require('./schedule');
function groups(value){
  if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).length>20)
    fail(422,'INVALID_SELECTION','Wybierz grupy w aplikacji.');
  for(const [key,group] of Object.entries(value)){
    if(!/^[\p{L}][\p{L}\p{N} _-]{0,31}$/u.test(key))fail(422,'INVALID_SELECTION','Nieprawidłowy rodzaj grupy.');
    text(group,64);
    if(typeof group!=='string')fail(422,'INVALID_SELECTION','Nieprawidłowa grupa.');
  }
  return Object.fromEntries(Object.entries(value).map(([key,group])=>[key,group.trim()]));
}
function validateSelection(value){
  keys(value,['faculty','groups','external']);text(value.faculty,256,true);
  const result={faculty:value.faculty.trim(),groups:groups(value.groups)};
  if(value.external!==undefined){
    if(!Array.isArray(value.external)||value.external.length>8)fail(422,'INVALID_SELECTION','Zbyt dużo dodatkowych grup w kontekście agenta.');
    result.external=value.external.map(item=>{
      keys(item,['faculty','groups','subject']);text(item.faculty,256,true);text(item.subject,256);
      const selected=groups(item.groups);
      if(Object.keys(selected).length!==1||!Object.values(selected)[0])fail(422,'INVALID_SELECTION','Wybierz jedną dodatkową grupę.');
      return {faculty:item.faculty.trim(),groups:selected,subject:(item.subject||'').trim()};
    });
  }
  if(Buffer.byteLength(JSON.stringify(result))>800)fail(422,'INVALID_SELECTION','Kontekst grup jest zbyt długi.');
  return result;
}
module.exports={validateSelection};
