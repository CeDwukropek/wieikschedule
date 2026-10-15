const {endpoint}=require('../_lib/scheduleHttp');
const {keys}=require('../_lib/schedule');
const {issueContext}=require('../_lib/scheduleTools');
module.exports=endpoint('POST',async(req,ctx)=>{
  keys(req.body,['provider','session_id']);
  return {token:issueContext(ctx.userId,req.body.provider,req.body.session_id),expires_in:300};
});
