const {endpoint}=require('../../_lib/scheduleHttp');
const {confirm}=require('../../_lib/schedule');
// Delegated agent tokens are never accepted here: full Firebase verification is mandatory.
module.exports=endpoint('POST',async(req,ctx)=>({result:await confirm(ctx,req.body)}));
