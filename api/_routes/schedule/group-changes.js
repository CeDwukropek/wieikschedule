const {endpoint}=require('../../_lib/scheduleHttp');
const {listGroupChanges}=require('../../_lib/groupSchedule');
// Starostas' changes of classes for the whole group, for everyone who sees these plans (guests too).
module.exports=endpoint('GET',async(req,ctx)=>listGroupChanges(ctx,req.query||{}),{guest:true});
