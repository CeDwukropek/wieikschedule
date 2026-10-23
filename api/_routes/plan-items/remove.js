const {endpoint}=require('../../_lib/scheduleHttp');
const {removeItems}=require('../../_lib/planItems');
// Deletes entries (kept 90 days) or, with restore, brings them back.
module.exports=endpoint('POST',async(req,ctx)=>removeItems(ctx,req.body||{}));
