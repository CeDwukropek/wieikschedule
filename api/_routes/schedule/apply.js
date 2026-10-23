const {endpoint}=require('../../_lib/scheduleHttp');
const {apply}=require('../../_lib/schedule');
// The signed-in person's own edit is its own confirmation; agents keep using propose + confirm.
module.exports=endpoint('POST',async(req,ctx)=>apply(ctx,req.body));
