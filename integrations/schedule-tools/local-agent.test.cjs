const test=require('node:test'),assert=require('node:assert/strict');
process.env.SCHEDULE_LOCAL_MODEL='synthetic-local-model';
process.env.SCHEDULE_ALLOWED_ORIGINS='https://schedule.example.invalid';
const {server}=require('./local-agent.cjs');
test('local HTTP adapter checks Origin/context and returns only an unconfirmed proposal',async()=>{
 const originalFetch=global.fetch;let modelCalls=0,toolCalls=0;
 const response=value=>new Response(JSON.stringify(value),{headers:{'Content-Type':'application/json'}});
 global.fetch=async(url,options)=>{
   if(String(url).includes('/api/schedule/tools')){
     assert.equal(options.headers.Authorization,'Bearer wks1.payload.signature');
     if(options.method==='GET')return response({ok:true,provider:'odysseus',session_id:'session'});
     toolCalls++;assert.equal(JSON.parse(options.body).tool,'schedule.create_override');
     return response({ok:true,result:{proposal:{id:'preview',requires_confirmation:true}}});
   }
   assert.equal(new URL(url).hostname,'127.0.0.1');
   assert.ok(!options.body.includes('wks1.payload.signature'));
   const payload=JSON.parse(options.body);assert.ok(payload.tools.every(tool=>!tool.function.name.includes('confirm')));
   if(modelCalls++===0)return response({choices:[{message:{tool_calls:[{id:'call',type:'function',function:{name:'schedule_create_override',arguments:JSON.stringify({event_id:'00000000-0000-0000-0000-000000000001',action:'cancel',patch:{}})}}]}}]});
   return response({choices:[{message:{content:'Sprawdź podgląd.'}}]});
 };
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 try{
   let res=await originalFetch(base+'/schedule/capabilities',{headers:{Origin:'https://untrusted.invalid'}});assert.equal(res.status,403);
   res=await originalFetch(base+'/schedule/chat',{method:'POST'});assert.equal(res.status,401);
   res=await originalFetch(base+'/schedule/chat',{method:'POST',headers:{Origin:'https://schedule.example.invalid',Authorization:'Bearer wks1.payload.signature','Content-Type':'application/json'},body:JSON.stringify({message:'Odwołaj zajęcia',faculty:'TEST',session_id:'session'})});
   assert.equal(res.status,200);const body=await res.json();assert.equal(body.proposals[0].requires_confirmation,true);assert.equal(toolCalls,1);
 }finally{global.fetch=originalFetch;await new Promise(resolve=>server.close(resolve));}
});
