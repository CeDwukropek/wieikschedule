"use strict";
// Optional loopback sidecar. No Firebase Admin or service-role credentials.
const http=require('node:http');
const {runAgent,validateChat}=require('../../api/_lib/scheduleAgent');
const {tools}=require('../../api/_lib/scheduleToolSchemas');
const origins=new Set(String(process.env.SCHEDULE_ALLOWED_ORIGINS||'http://localhost:3100').split(',').map(s=>s.trim()));
const gateway=new URL('/api/schedule/tools',process.env.SCHEDULE_API_URL||'http://127.0.0.1:3100');
const modelUrl=new URL(process.env.SCHEDULE_LOCAL_MODEL_URL||'http://127.0.0.1:11434/v1/chat/completions');
if(!['localhost','127.0.0.1','[::1]','host.docker.internal'].includes(modelUrl.hostname))throw new Error('Local model must use loopback or Docker host gateway');
async function toolRequest(token,body){
  const response=await fetch(gateway,{method:body?'POST':'GET',redirect:'error',signal:AbortSignal.timeout(15000),headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
  const data=await response.json();
  if(!response.ok||!data.ok)throw Object.assign(new Error(data.message||'Schedule authorization failed'),{statusCode:response.status>=400?response.status:503,code:data.error});
  return body?data.result:data;
}
function respond(res,status,body){res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(body));}
const server=http.createServer(async(req,res)=>{
  const origin=req.headers.origin;
  if(origin&&!origins.has(origin))return respond(res,403,{ok:false,message:'Origin is not allowed'});
  if(origin){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');}
  if(req.method==='OPTIONS'){
    res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');res.setHeader('Access-Control-Allow-Headers','authorization,content-type');res.writeHead(204);return res.end();
  }
  if(req.method==='GET'&&req.url==='/schedule/capabilities')return respond(res,200,{protocol:'wieik-schedule-v1',tools:tools.map(t=>t.name),confirmation:'browser-only'});
  if(req.method!=='POST'||req.url!=='/schedule/chat')return respond(res,404,{ok:false});
  try{
    const token=/^Bearer (wks1\.[^.]+\.[^.]+)$/.exec(String(req.headers.authorization||''))?.[1];
    if(!token)throw Object.assign(new Error('Schedule context is required'),{statusCode:401});
    const identity=await toolRequest(token);
    if(identity.provider!=='odysseus')throw Object.assign(new Error('Wrong provider'),{statusCode:403});
    let raw='',size=0;for await(const chunk of req){size+=chunk.length;if(size>150000)throw Object.assign(new Error('Request too large'),{statusCode:413});raw+=chunk;}
    const body=validateChat(JSON.parse(raw));
    if(body.session_id!==identity.session_id)throw Object.assign(new Error('Wrong session'),{statusCode:403});
    const result=await runAgent(body,{model:process.env.SCHEDULE_LOCAL_MODEL||'',execute:(tool,args)=>toolRequest(token,{tool,arguments:args}),complete:async payload=>{
      const response=await fetch(modelUrl,{method:'POST',redirect:'error',signal:AbortSignal.timeout(90000),headers:{'Content-Type':'application/json',...(process.env.SCHEDULE_LOCAL_MODEL_KEY?{Authorization:`Bearer ${process.env.SCHEDULE_LOCAL_MODEL_KEY}`}:{})},body:JSON.stringify(payload)});
      if(!response.ok)throw new Error('Local model failed');return response.json();
    }});
    respond(res,200,{ok:true,...result});
  }catch(error){respond(res,error.statusCode||503,{ok:false,error:error.code||'LOCAL_AGENT_UNAVAILABLE',message:error.statusCode?error.message:'Lokalny model jest niedostępny. Sprawdź konfigurację adaptera.'});}
});
if(require.main===module)server.listen(Number(process.env.PORT)||3101,'127.0.0.1',()=>console.log('Local schedule adapter listening on loopback'));
module.exports={server};
