const {endpoint}=require('../../_lib/scheduleHttp');
const {listOverrides}=require('../../_lib/schedule');
module.exports=endpoint('GET',async(req,ctx)=>({overrides:await listOverrides(ctx)}));
