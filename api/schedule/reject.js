const {endpoint}=require('../_lib/scheduleHttp');
const {reject}=require('../_lib/schedule');
// Declining an agent preview in the app expires it everywhere (also in a linked calendar).
module.exports=endpoint('POST',async(req,ctx)=>reject(ctx,req.body));
