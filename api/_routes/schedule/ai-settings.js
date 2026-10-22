const {endpoint}=require('../../_lib/scheduleHttp');
const credentials=require('../../_lib/aiCredentials');
module.exports=endpoint(['GET','POST'],async(req,ctx,uid)=>({settings:req.method==='GET'?
  credentials.publicSettings(await credentials.read(uid)):await credentials.save(uid,req.body)}));
