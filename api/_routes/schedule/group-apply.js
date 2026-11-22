const {endpoint}=require('../../_lib/scheduleHttp');
const {applyGroupChanges}=require('../../_lib/groupSchedule');
// A starosta changes classes for the whole group; the database checks the role and the revision.
module.exports=endpoint('POST',async(req,ctx)=>applyGroupChanges(ctx,req.body));
