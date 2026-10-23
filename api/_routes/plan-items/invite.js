const {endpoint}=require('../../_lib/scheduleHttp');
const {createInvite}=require('../../_lib/planItems');
// A one-time code granting a starosta role; shown only in this response.
module.exports=endpoint('POST',async(req,ctx)=>createInvite(ctx,req.body||{}));
