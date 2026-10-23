const {endpoint}=require('../../_lib/scheduleHttp');
const {saveItems}=require('../../_lib/planItems');
// Creates or updates up to 20 entries; several new ones form a series.
module.exports=endpoint('POST',async(req,ctx)=>saveItems(ctx,req.body||{}));
