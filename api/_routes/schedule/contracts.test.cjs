const test=require('node:test'),assert=require('node:assert/strict');
process.env.SCHEDULE_TOOL_SECRET='synthetic-test-master-secret-'.repeat(3);
const {issueContext,readContext,dispatch,availableTools}=require('../../_lib/scheduleTools');
const {encrypt,decrypt,publicSettings}=require('../../_lib/aiCredentials');
const {validateChange}=require('../../_lib/schedule');
const {runAgent}=require('../../_lib/scheduleAgent');
const id='00000000-0000-0000-0000-000000000001';
test('semantic tools use signed selection and cannot inject faculty or groups',async()=>{
 const selection={faculty:'EiAs3',groups:{Lk:'Lk1'}};
 const claims=readContext(issueContext(id,'odysseus','s',Date.now(),'query',selection));
 assert.deepEqual(claims.selection,selection);
 const tools=availableTools(claims).map(tool=>tool.name);
 assert.ok(tools.includes('schedule.get_next_occurrence'));assert.ok(tools.includes('schedule.find_subjects'));
 assert.ok(!tools.includes('schedule.find_event'));assert.ok(!tools.includes('schedule.create_override'));assert.ok(!tools.includes('schedule.find_makeup_options'));
 await assert.rejects(dispatch({...claims,selection:undefined},'schedule.get_next_occurrence',{query:'MUD'}),{code:'SELECTION_REQUIRED'});
 await assert.rejects(dispatch(claims,'schedule.find_makeup_options',{query:'MUD'}),{code:'INTENT_REQUIRED'});
 await assert.rejects(dispatch(claims,'schedule.find_event',{faculty:'OTHER'}),{code:'SELECTION_MISMATCH'});
});
test('delegated context rejects tampering and expiry and binds owner/provider/session',()=>{
 const token=issueContext(id,'odysseus','session-a',1000000);
 assert.equal(readContext(token,1000000).sub,id);
 assert.equal(readContext(token,1000000).provider,'odysseus');
 assert.equal(readContext(token,1000000).session_id,'session-a');
 assert.throws(()=>readContext(token,1300000),{code:'UNAUTHORIZED'});
 assert.throws(()=>readContext(token.slice(0,-2)+'xx',1000000),{code:'UNAUTHORIZED'});
 assert.throws(()=>readContext('eyJ.fake.firebase'),{code:'UNAUTHORIZED'});
});
test('makeup and query cannot propose moves; operation is signed into delegated context',async()=>{
 for(const intent of ['makeup','query','restore']){
  const claims=readContext(issueContext(id,'odysseus','session',Date.now(),intent));
  assert.equal(claims.intent,intent);
  await assert.rejects(dispatch(claims,'schedule.create_override',{event_id:id,action:'modify',patch:{room:'T'}}),{code:'INTENT_REQUIRED'});
 }
 for(const intent of ['makeup','query','reschedule','cancel']){
  const claims=readContext(issueContext(id,'odysseus','session',Date.now(),intent));
  await assert.rejects(dispatch(claims,'schedule.delete_override',{event_id:id}),{code:'INTENT_REQUIRED'});
 }
 await assert.rejects(dispatch({intent:'reschedule'},'schedule.create_override',{event_id:id,action:'cancel'}),{code:'INTENT_REQUIRED'});
 await assert.rejects(dispatch({intent:'cancel'},'schedule.create_override',{event_id:id,action:'modify'}),{code:'INTENT_REQUIRED'});
 await assert.rejects(dispatch({intent:'reschedule'},'schedule.confirm',{}),{code:'UNKNOWN_TOOL'});
});
test('credential ciphertext is randomized, authenticated, and bound to Firebase UID',()=>{
 const encrypted=encrypt('user-a','synthetic-api-key');
 assert.equal(decrypt('user-a',encrypted),'synthetic-api-key');
 assert.notEqual(encrypted.ciphertext,encrypt('user-a','synthetic-api-key').ciphertext);
 assert.throws(()=>decrypt('user-b',encrypted));
 assert.ok(!JSON.stringify(encrypted).includes('synthetic-api-key'));
 assert.deepEqual(Object.keys(publicSettings({encrypted_key:encrypted})).sort(),['has_api_key','local_endpoint','local_endpoint_id','local_memory','local_model','model','provider']);
});
test('change contract preserves explicit null and rejects identity/scope/invalid scalar values',()=>{
 const change={event_id:id,operation:'upsert',action:'modify',patch:{room:null}};
 assert.deepEqual(validateChange(change).patch,{room:null});
 for(const row of [{...change,user_id:id},{...change,patch:{subject:'x'}},{...change,patch:{duration_min:true}},{...change,patch:{duration_min:1.5}},{...change,patch:{date:null}},{...change,patch:{room:2}},{...change,patch:{}},{...change,action:'cancel'}])assert.throws(()=>validateChange(row));
});
test('agent can prepare a preview but has no confirmation tool, including prompt injection',async()=>{
 let turn=0,executed=[];
 const result=await runAgent({message:'Change room',faculty:'TEST',session_id:'session'}, {model:'synthetic-model',complete:async payload=>{
   assert.ok(payload.tools.every(t=>!t.function.name.includes('confirm')));
   if(turn++===0)return {choices:[{message:{tool_calls:[{id:'a',type:'function',function:{name:'schedule_confirm',arguments:'{}'}}]}}]};
   if(turn===2)return {choices:[{message:{tool_calls:[{id:'b',type:'function',function:{name:'schedule_create_override',arguments:JSON.stringify({event_id:id,action:'modify',patch:{room:null}})}}]}}]};
   return {choices:[{message:{content:'Preview ready'}}]};
 },execute:async(name,args)=>{executed.push(name);return {proposal:{id:'preview',requires_confirmation:true}};}});
 assert.deepEqual(executed,['schedule.create_override']);assert.equal(result.proposals[0].requires_confirmation,true);
});
test('confirmation endpoint rejects delegated tokens before reaching the database',async()=>{
 const authModule=require.resolve('../../_lib/requestAuth');
 require.cache[authModule]={id:authModule,filename:authModule,loaded:true,exports:{verifyRequestUser:async()=>{throw Object.assign(new Error('Firebase required'),{statusCode:401,code:'UNAUTHORIZED'});}}};
 const handler=require('./confirm');
 const res={setHeader(){},status(code){this.code=code;return this;},json(body){this.body=body;return this;}};
 await handler({method:'POST',headers:{authorization:'Bearer '+issueContext(id,'n8n','session')},body:{}},res);
 assert.equal(res.code,401);
});
