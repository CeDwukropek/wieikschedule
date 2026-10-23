const test=require('node:test'),assert=require('node:assert/strict');
const {listModels}=require('../../_lib/openaiModels');
test('model catalogue uses the stored key only and returns sorted unique IDs',async()=>{
  const models=await listModels('synthetic-key',async(url,options)=>{
    assert.equal(url,'https://api.openai.com/v1/models');assert.equal(options.method,'GET');
    assert.equal(options.headers.Authorization,'Bearer synthetic-key');assert.equal(options.body,undefined);
    assert.equal(options.redirect,'error');
    return {ok:true,status:200,json:async()=>({data:[{id:'model-b',owned_by:'private'},{id:'model-a'},{id:'model-a'},null,{id:22}]})};
  });
  assert.deepEqual(models,[{id:'model-a'},{id:'model-b'}]);
});
test('no key never triggers a provider request',async()=>{
  let called=false;
  await assert.rejects(()=>listModels('',async()=>{called=true;}),{code:'API_KEY_REQUIRED'});
  assert.equal(called,false);
});
test('provider failures never expose raw upstream error details',async()=>{
  for(const status of [401,403,429,500])await assert.rejects(()=>listModels('synthetic-key',async()=>({ok:false,status,json:async()=>{throw new Error('must not parse private provider error');}})),error=>{
    assert.ok(!error.message.includes('synthetic-key'));assert.ok(error.statusCode>=400);return true;
  });
  await assert.rejects(()=>listModels('synthetic-key',async()=>{throw new Error('synthetic-key');}),{code:'MODEL_LIST_UNAVAILABLE'});
  await assert.rejects(()=>listModels('synthetic-key',async()=>({ok:true,json:async()=>({unexpected:true})})),{code:'INVALID_MODEL_LIST'});
});
test('model endpoint resolves credentials from verified UID, never requested UID',async()=>{
  const mocks={
    '../../_lib/requestAuth':{verifyRequestUser:async()=>({uid:'owner-a'})},
    '../../_lib/schedule':{context:async uid=>{assert.equal(uid,'owner-a');return {}; }},
    '../../_lib/aiCredentials':{read:async uid=>{assert.equal(uid,'owner-a');return {encrypted_key:'ciphertext'};},decrypt:(uid,value)=>{assert.equal(uid,'owner-a');assert.equal(value,'ciphertext');return 'synthetic-key';}},
    '../../_lib/openaiModels':{listModels:async key=>{assert.equal(key,'synthetic-key');return [{id:'available-model'}];}},
  };
  for(const [name,exports] of Object.entries(mocks)){
    const id=require.resolve(name);require.cache[id]={id,filename:id,loaded:true,exports};
  }
  const handler=require('./models');
  const res={setHeader(){},status(code){this.code=code;return this;},json(body){this.body=body;}};
  await handler({method:'GET',query:{uid:'victim-b'},headers:{}},res);
  assert.equal(res.code,200);assert.deepEqual(res.body,{ok:true,models:[{id:'available-model'}],capabilities_verified:false});
});
