"use strict";
const crypto=require('node:crypto');
const schedule=require('./schedule');
const { getSupabaseAdminClient }=require('./supabaseAdmin');
function secret() { const value=process.env.SCHEDULE_TOOL_SECRET; if(!value||value.length<32)schedule.fail(503,'TOOLS_UNAVAILABLE','Narzędzia agenta nie są skonfigurowane.');return value; }
function sign(value) {return crypto.createHmac('sha256',secret()).update(value).digest('base64url');}
function issueContext(userId,provider,sessionId,now=Date.now()) {
  if(!['n8n','odysseus'].includes(provider))schedule.fail(422,'INVALID_PROVIDER','Nieprawidłowy agent.');
  schedule.text(sessionId,128,true);
  const payload=Buffer.from(JSON.stringify({purpose:'schedule-tools-v1',sub:userId,provider,session_id:sessionId,
    exp:Math.floor(now/1000)+300,nonce:crypto.randomUUID()})).toString('base64url');
  return 'wks1.'+payload+'.'+sign('wks1.'+payload);
}
function readContext(token,now=Date.now()) {
  const parts=String(token||'').split('.');
  if(parts.length!==3||parts[0]!=='wks1'||token.length>2048)schedule.fail(401,'UNAUTHORIZED','Nieprawidłowy kontekst narzędzi.');
  const expected=Buffer.from(sign(parts.slice(0,2).join('.'))), actual=Buffer.from(parts[2]);
  if(expected.length!==actual.length||!crypto.timingSafeEqual(expected,actual))schedule.fail(401,'UNAUTHORIZED','Nieprawidłowy kontekst narzędzi.');
  let claims;try{claims=JSON.parse(Buffer.from(parts[1],'base64url').toString());}catch{schedule.fail(401,'UNAUTHORIZED','Nieprawidłowy kontekst narzędzi.');}
  if(claims.purpose!=='schedule-tools-v1'||!Number.isInteger(claims.exp)||claims.exp<=now/1000||claims.exp>now/1000+301||!['n8n','odysseus'].includes(claims.provider))schedule.fail(401,'UNAUTHORIZED','Kontekst narzędzi wygasł.');
  schedule.uuid(claims.sub);schedule.text(claims.session_id,128,true);return claims;
}
async function dispatch(claims,name,args) {
  const ctx={db:getSupabaseAdminClient(),userId:claims.sub};
  if(name==='schedule.get_events')return schedule.getEvents(ctx,args);
  if(name==='schedule.find_event')return schedule.getEvents(ctx,args,true);
  if(name==='schedule.create_override') {
    schedule.keys(args,['event_id','action','patch','reason']);
    return {proposal:await schedule.propose(ctx,{...args,operation:'upsert'},claims.provider,claims.session_id)};
  }
  if(name==='schedule.delete_override') {
    schedule.keys(args,['event_id']);return {proposal:await schedule.propose(ctx,{event_id:args.event_id,operation:'delete'},claims.provider,claims.session_id)};
  }
  schedule.fail(422,'UNKNOWN_TOOL','Nieznane narzędzie.');
}
module.exports={issueContext,readContext,dispatch};
