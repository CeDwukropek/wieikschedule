const {getSupabaseAdminClient}=require('../../_lib/supabaseAdmin');
const {keys,fail}=require('../../_lib/schedule');
const {LINK_DAYS,codeHash,newToken,tokenHash}=require('../../_lib/calendarSync');
// The only unauthenticated calendar endpoint: a one-time code becomes a long-lived link token.
module.exports=async(req,res)=>{
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST')return res.status(405).json({ok:false,error:'METHOD_NOT_ALLOWED'});
  try{
    keys(req.body,['code']);
    const hash=codeHash(req.body.code),token=newToken();
    const {data,error}=await getSupabaseAdminClient().rpc('pair_calendar_link',{p_code_hash:hash,p_token_hash:tokenHash(token)});
    if(error?.code==='P0002')fail(401,'CODE_INVALID','Kod jest nieprawidłowy, wygasł lub został już użyty. Wygeneruj nowy w wieikschedule.');
    if(error)fail(503,'CALENDAR_SYNC_UNAVAILABLE','Synchronizacja kalendarza jest chwilowo niedostępna.');
    return res.status(200).json({ok:true,token,link:data,inactive_expiry_days:LINK_DAYS});
  }catch(error){return res.status(error.statusCode||503).json({ok:false,error:error.code||'CALENDAR_SYNC_UNAVAILABLE',
    message:error.statusCode?error.message:'Synchronizacja kalendarza jest chwilowo niedostępna.'});}
};
