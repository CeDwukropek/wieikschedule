"use strict";
const crypto=require('node:crypto');
const schedule=require('./schedule');
const { getSupabaseAdminClient }=require('./supabaseAdmin');
const {validateSelection}=require('./scheduleSelection');
const {SEMANTIC_TOOLS,queryPlan}=require('./scheduleQueries');
function secret() { const value=process.env.SCHEDULE_TOOL_SECRET; if(!value||value.length<32)schedule.fail(503,'TOOLS_UNAVAILABLE','Narzędzia agenta nie są skonfigurowane.');return value; }
function sign(value) {return crypto.createHmac('sha256',secret()).update(value).digest('base64url');}
function issueContext(userId,provider,sessionId,now=Date.now(),intent='query',selection) {
  if(!['n8n','odysseus'].includes(provider))schedule.fail(422,'INVALID_PROVIDER','Nieprawidłowy agent.');
  schedule.text(sessionId,128,true);
  if(!['query','makeup','reschedule','cancel','restore'].includes(intent))schedule.fail(422,'INVALID_INTENT','Wybierz rodzaj pomocy w czacie.');
  const payload=Buffer.from(JSON.stringify({purpose:'schedule-tools-v1',sub:userId,provider,session_id:sessionId,
    intent,...(selection?{selection:validateSelection(selection)}:{}),exp:Math.floor(now/1000)+300,nonce:crypto.randomUUID()})).toString('base64url');
  return 'wks1.'+payload+'.'+sign('wks1.'+payload);
}
function readContext(token,now=Date.now()) {
  const parts=String(token||'').split('.');
  if(parts.length!==3||parts[0]!=='wks1'||token.length>2048)schedule.fail(401,'UNAUTHORIZED','Nieprawidłowy kontekst narzędzi.');
  const expected=Buffer.from(sign(parts.slice(0,2).join('.'))), actual=Buffer.from(parts[2]);
  if(expected.length!==actual.length||!crypto.timingSafeEqual(expected,actual))schedule.fail(401,'UNAUTHORIZED','Nieprawidłowy kontekst narzędzi.');
  let claims;try{claims=JSON.parse(Buffer.from(parts[1],'base64url').toString());}catch{schedule.fail(401,'UNAUTHORIZED','Nieprawidłowy kontekst narzędzi.');}
  if(claims.purpose!=='schedule-tools-v1'||!Number.isInteger(claims.exp)||claims.exp<=now/1000||claims.exp>now/1000+301||!['n8n','odysseus'].includes(claims.provider))schedule.fail(401,'UNAUTHORIZED','Kontekst narzędzi wygasł.');
  if(!['query','makeup','reschedule','cancel','restore'].includes(claims.intent))schedule.fail(401,'UNAUTHORIZED','Nieprawidłowa intencja kontekstu.');
  schedule.uuid(claims.sub);schedule.text(claims.session_id,128,true);
  if(claims.selection)claims.selection=validateSelection(claims.selection);
  return claims;
}
async function dispatch(claims,name,args) {
  const context=()=>({db:getSupabaseAdminClient(),userId:claims.sub});
  if(SEMANTIC_TOOLS.includes(name)){
    if(!claims.selection)schedule.fail(422,'SELECTION_REQUIRED','Odśwież aplikację i wybierz plan oraz grupy przed rozmową.');
    if(name==='schedule.find_makeup_options'&&claims.intent!=='makeup')schedule.fail(403,'INTENT_REQUIRED','Wybierz tryb odrabiania zajęć.');
    return queryPlan(context(),claims.selection,name,args);
  }
  if(claims.selection&&['schedule.get_events','schedule.find_event'].includes(name)&&args?.faculty!==claims.selection.faculty)
    schedule.fail(403,'SELECTION_MISMATCH','Wybierz ten plan w aplikacji przed wyszukiwaniem.');
  if(name==='schedule.get_events')return schedule.getEvents(context(),args);
  if(name==='schedule.find_event')return schedule.getEvents(context(),args,true);
  if(name==='schedule.create_override') {
    if(!((claims.intent==='reschedule'&&args?.action==='modify')||(claims.intent==='cancel'&&args?.action==='cancel')))
      schedule.fail(403,'INTENT_REQUIRED','Przełożenie lub odwołanie wymaga wybrania takiej operacji w aplikacji. Odrabianie nie przesuwa zajęć.');
    schedule.keys(args,['event_id','action','patch','reason']);
    return {proposal:await schedule.propose(context(),{...args,operation:'upsert'},claims.provider,claims.session_id)};
  }
  if(name==='schedule.delete_override') {
    if(claims.intent!=='restore')schedule.fail(403,'INTENT_REQUIRED','Przywrócenie wymaga wybrania takiej operacji w aplikacji.');
    schedule.keys(args,['event_id']);return {proposal:await schedule.propose(context(),{event_id:args.event_id,operation:'delete'},claims.provider,claims.session_id)};
  }
  schedule.fail(422,'UNKNOWN_TOOL','Nieznane narzędzie.');
}
function availableTools(claims){
  const {tools}=require('./scheduleToolSchemas');
  return tools.filter(tool=>SEMANTIC_TOOLS.includes(tool.name)?Boolean(claims.selection)&&
    (tool.name!=='schedule.find_makeup_options'||claims.intent==='makeup'):
    ['schedule.get_events','schedule.find_event'].includes(tool.name)?!claims.selection:
    tool.name==='schedule.create_override'?['reschedule','cancel'].includes(claims.intent):
    tool.name==='schedule.delete_override'&&claims.intent==='restore');
}
module.exports={issueContext,readContext,dispatch,availableTools};
