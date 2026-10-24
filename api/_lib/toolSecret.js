"use strict";
const crypto=require('node:crypto');
const {fail}=require('./schedule');
// The secret shared by the app's tool endpoint and the previews it signs (agent contexts, entry previews).
function secret() { const value=process.env.SCHEDULE_TOOL_SECRET; if(!value||value.length<32)fail(503,'TOOLS_UNAVAILABLE','Narzędzia agenta nie są skonfigurowane.');return value; }
function sign(value) {return crypto.createHmac('sha256',secret()).update(value).digest('base64url');}
function verify(value,signature) {
  const expected=Buffer.from(sign(value)),actual=Buffer.from(String(signature||''));
  return expected.length===actual.length&&crypto.timingSafeEqual(expected,actual);
}
module.exports={sign,verify};
