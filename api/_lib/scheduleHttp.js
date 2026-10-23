const {verifyRequestUser}=require('./requestAuth');
const schedule=require('./schedule');
// Bearer-only authentication; same-origin browser requests need no cookie/CORS grant.
function endpoint(method,handle) {
  return async(req,res)=>{
    res.setHeader('Cache-Control','no-store');
    if(!(Array.isArray(method)?method:[method]).includes(req.method))return res.status(405).json({ok:false,error:'METHOD_NOT_ALLOWED'});
    try {
      const {uid}=await verifyRequestUser(req);
      const ctx=await schedule.context(uid);
      return res.status(200).json({ok:true,...await handle(req,ctx,uid)});
    }catch(error){return res.status(error.statusCode||503).json({ok:false,error:error.code||'SCHEDULE_UNAVAILABLE',
      message:error.statusCode?error.message:'Prywatny plan jest chwilowo niedostępny.'});}
  };
}
module.exports={endpoint};
