const {endpoint}=require('../../_lib/scheduleHttp');
const {personalPlan}=require('../../_lib/personalPlan');
// "Mój plan": all personal entries of the signed-in user in one list.
module.exports=endpoint('GET',async(req,ctx)=>personalPlan(ctx));
