const {endpoint}=require('../../_lib/scheduleHttp');
const {listRoles}=require('../../_lib/planItems');
// Own roles and, for an admin or starosta, the places they manage (holders are not identified).
module.exports=endpoint('GET',async(req,ctx)=>listRoles(ctx));
