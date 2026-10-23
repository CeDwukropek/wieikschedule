const {endpoint}=require('../../_lib/scheduleHttp');
const {redeemInvite}=require('../../_lib/planItems');
// Takes the role of an invite code.
module.exports=endpoint('POST',async(req,ctx)=>redeemInvite(ctx,req.body||{}));
