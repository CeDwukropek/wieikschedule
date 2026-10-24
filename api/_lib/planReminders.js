"use strict";
// Reminders of kolokwia, deadlines and other entries (E6.8). A reminder is either "N days before at HH:MM" (the
// evening before, the morning of a deadline) or "N minutes before" the start or the hand-in hour. Defaults depend
// on the kind; a person may set their own for each kind. Times are Europe/Warsaw, also across DST changes.
const {fail}=require('./schedule');

const KINDS=['kolokwium','wejsciowka','sprawozdanie','egzamin','poprawa','projekt','inne'];
const DEFAULT_REMINDERS={
  kolokwium:[{days_before:1,at:'18:00'},{minutes_before:60}],
  wejsciowka:[{days_before:1,at:'18:00'}],
  sprawozdanie:[{days_before:1,at:'18:00'},{days_before:0,at:'09:00'}],
  egzamin:[{days_before:3,at:'18:00'},{days_before:1,at:'18:00'}],
  poprawa:[{days_before:1,at:'18:00'},{minutes_before:60}],
  projekt:[{days_before:2,at:'18:00'},{days_before:0,at:'09:00'}],
  inne:[{days_before:1,at:'18:00'}],
};
const MAX_PER_KIND=3;
const isTime=value=>typeof value==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(value);

function readReminder(value){
  if(!value||typeof value!=='object'||Array.isArray(value))fail(422,'INVALID_REMINDERS','Nieprawidłowe przypomnienie.');
  const keys=Object.keys(value).sort().join(',');
  if(keys==='at,days_before'&&Number.isInteger(value.days_before)&&value.days_before>=0&&value.days_before<=14&&isTime(value.at))
    return {days_before:value.days_before,at:value.at};
  if(keys==='minutes_before'&&Number.isInteger(value.minutes_before)&&value.minutes_before>=5&&value.minutes_before<=1440)
    return {minutes_before:value.minutes_before};
  fail(422,'INVALID_REMINDERS','Przypomnienie to „N dni przed o GG:MM” (0–14 dni) albo „N minut przed” (5–1440).');
}
// Own settings by kind; a kind left out keeps the default, an empty list means no reminders.
function validateReminders(value){
  if(!value||typeof value!=='object'||Array.isArray(value))fail(422,'INVALID_REMINDERS','Nieprawidłowe ustawienia przypomnień.');
  return Object.fromEntries(Object.entries(value).map(([kind,list])=>{
    if(!KINDS.includes(kind))fail(422,'INVALID_REMINDERS','Nieznany rodzaj wpisu.');
    if(!Array.isArray(list)||list.length>MAX_PER_KIND)fail(422,'INVALID_REMINDERS',`Najwyżej ${MAX_PER_KIND} przypomnienia na rodzaj.`);
    const unique=new Map(list.map(readReminder).map(reminder=>[JSON.stringify(reminder),reminder]));
    return [kind,[...unique.values()]];
  }));
}
const effectiveReminders=own=>({...DEFAULT_REMINDERS,...(own||{})});

// The UTC instant of a Warsaw wall-clock time: the offset is read at that instant, so DST is right on both sides.
function warsawInstant(date,time){
  const [year,month,day]=date.split('-').map(Number),[hour,minute]=time.split(':').map(Number);
  const guess=Date.UTC(year,month-1,day,hour,minute);
  const offsetAt=instant=>{
    const parts=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Warsaw',hourCycle:'h23',year:'numeric',month:'2-digit',
      day:'2-digit',hour:'2-digit',minute:'2-digit'}).formatToParts(new Date(instant)).map(part=>[part.type,part.value]));
    return Date.UTC(+parts.year,+parts.month-1,+parts.day,+parts.hour,+parts.minute)-instant;
  };
  const first=guess-offsetAt(guess);
  return new Date(guess-offsetAt(first));
}
const shiftDate=(date,days)=>{const value=new Date(date+'T12:00:00Z');value.setUTCDate(value.getUTCDate()-days);return value.toISOString().slice(0,10);};
// Reminder instants (ISO, UTC) of one entry, earliest first. "Minutes before" needs an hour: a deadline without
// one only gets the day-based reminders.
function reminderTimes(item,list){
  const hour=String(item.timing==='due'?item.due_time||'':item.start_time||'').slice(0,5);
  const times=new Set();
  for(const reminder of list||[]){
    if(reminder.minutes_before!==undefined){
      if(!hour)continue;
      times.add(new Date(warsawInstant(item.date,hour).getTime()-reminder.minutes_before*60000).toISOString());
    }else times.add(warsawInstant(shiftDate(item.date,reminder.days_before),reminder.at).toISOString());
  }
  return [...times].sort();
}

async function readPreferences(ctx){
  const {data,error}=await ctx.db.from('plan_item_preferences').select('reminders,updated_at').eq('user_id',ctx.userId).maybeSingle();
  if(error)fail(503,'PREFERENCES_UNAVAILABLE','Ustawienia przypomnień są chwilowo niedostępne.');
  return data;
}
async function getPreferences(ctx){
  const own=await readPreferences(ctx);
  return {reminders:effectiveReminders(own?.reminders),defaults:DEFAULT_REMINDERS,custom:Boolean(own)};
}
// null restores the defaults.
async function savePreferences(ctx,body){
  const allowed=['reminders'];
  if(!body||typeof body!=='object'||Object.keys(body).some(key=>!allowed.includes(key)))fail(422,'INVALID_ARGUMENTS','Nieprawidłowe pola żądania.');
  if(body.reminders===null){
    const {error}=await ctx.db.from('plan_item_preferences').delete().eq('user_id',ctx.userId);
    if(error)fail(503,'PREFERENCES_UNAVAILABLE','Nie udało się zapisać przypomnień.');
  }else{
    const reminders=validateReminders(body.reminders);
    const {error}=await ctx.db.from('plan_item_preferences').upsert({user_id:ctx.userId,reminders,updated_at:new Date().toISOString()});
    if(error)fail(503,'PREFERENCES_UNAVAILABLE','Nie udało się zapisać przypomnień.');
  }
  return getPreferences(ctx);
}
module.exports={DEFAULT_REMINDERS,validateReminders,effectiveReminders,warsawInstant,reminderTimes,readPreferences,getPreferences,savePreferences};
