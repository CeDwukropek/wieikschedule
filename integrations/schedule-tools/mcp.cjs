"use strict";
// stdio MCP wrapper. The per-conversation token expires after five minutes.
const readline=require('node:readline');
const {tools}=require('../../api/_lib/scheduleToolSchemas');
async function handle(request){
  if(request.method==='initialize')return {protocolVersion:'2024-11-05',capabilities:{tools:{}},serverInfo:{name:'wieik-schedule',version:'1.0.0'}};
  if(request.method==='tools/list')return {tools};
  if(request.method==='ping')return {};
  if(request.method==='tools/call'){
    const response=await fetch(new URL('/api/schedule/tools',process.env.SCHEDULE_API_URL),{method:'POST',redirect:'error',signal:AbortSignal.timeout(20000),headers:{'Content-Type':'application/json',Authorization:`Bearer ${process.env.SCHEDULE_CONTEXT_TOKEN||''}`},body:JSON.stringify({tool:request.params.name,arguments:request.params.arguments||{}})});
    const data=await response.json();return {content:[{type:'text',text:JSON.stringify(data.result||{error:data.error,message:data.message})}],isError:!response.ok||!data.ok};
  }
  throw new Error('Unsupported method');
}
if(require.main===module){
  const input=readline.createInterface({input:process.stdin,crlfDelay:Infinity});
  input.on('line',async line=>{
    let request;try{request=JSON.parse(line);if(request.id===undefined)return;const result=await handle(request);process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:request.id,result})+'\n');}
    catch{process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:request?.id??null,error:{code:-32603,message:'Schedule tool request failed'}})+'\n');}
  });
}
module.exports={handle};
