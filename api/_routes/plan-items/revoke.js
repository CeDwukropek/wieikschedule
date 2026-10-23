const {endpoint}=require('../../_lib/scheduleHttp');
const {revokeRole}=require('../../_lib/planItems');
// Gives up an own role or takes one the user may grant.
module.exports=endpoint('POST',async(req,ctx)=>revokeRole(ctx,req.body||{}));
