const {endpoint}=require('../../_lib/scheduleHttp');
const {setState}=require('../../_lib/planItems');
// The signed-in user's progress, note or hiding of one entry.
module.exports=endpoint('POST',async(req,ctx)=>setState(ctx,req.body||{}));
