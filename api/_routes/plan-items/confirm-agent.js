const {endpoint}=require('../../_lib/scheduleHttp');
const {confirmEntries}=require('../../_lib/planItemAgent');
// Saves the entries the person chose from an agent's preview, exactly as the tool prepared them.
module.exports=endpoint('POST',async(req,ctx)=>confirmEntries(ctx,req.body||{}));
