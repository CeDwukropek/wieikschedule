const {keys}=require('../_lib/schedule');
const {readContext,dispatch}=require('../_lib/scheduleTools');
module.exports=async(req,res)=>{
  res.setHeader('Cache-Control','no-store');
  if(!['POST','GET'].includes(req.method))return res.status(405).json({ok:false,error:'METHOD_NOT_ALLOWED'});
  try{
    const token=/^Bearer (.+)$/i.exec(String(req.headers.authorization||''))?.[1];
    const claims=readContext(token);
    if(req.method==='GET')return res.status(200).json({ok:true,protocol:'wieik-schedule-v1',provider:claims.provider,session_id:claims.session_id});
    keys(req.body,['tool','arguments']);
    return res.status(200).json({ok:true,result:await dispatch(claims,req.body.tool,req.body.arguments)});
  }catch(error){return res.status(error.statusCode||503).json({ok:false,error:error.code||'TOOLS_UNAVAILABLE',
    message:error.statusCode?error.message:'Narzędzia są chwilowo niedostępne.'});}
};
