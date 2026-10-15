const {endpoint}=require('../_lib/scheduleHttp');
const {propose}=require('../_lib/schedule');
module.exports=endpoint('POST',async(req,ctx)=>({proposal:await propose(ctx,req.body)}));
