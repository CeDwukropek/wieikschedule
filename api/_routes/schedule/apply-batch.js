const {endpoint}=require('../../_lib/scheduleHttp');
const {applyBatch}=require('../../_lib/schedule');
// The signed-in person's own edit of several occurrences of a class (a series), all or nothing.
module.exports=endpoint('POST',async(req,ctx)=>applyBatch(ctx,req.body));
