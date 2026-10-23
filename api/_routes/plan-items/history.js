const {endpoint}=require('../../_lib/scheduleHttp');
const {listHistory}=require('../../_lib/planItems');
// Latest changes of group entries in one plan, for its starostas and admins; authors are told by role only.
module.exports=endpoint('GET',async(req,ctx)=>listHistory(ctx,req.query||{}));
