const {endpoint}=require('../../_lib/scheduleHttp');
const credentials=require('../../_lib/aiCredentials');
const {listModels}=require('../../_lib/openaiModels');
module.exports=endpoint('GET',async(req,ctx,uid)=>{
  const config=await credentials.read(uid);
  const models=await listModels(credentials.decrypt(uid,config.encrypted_key));
  return {models,capabilities_verified:false};
});
