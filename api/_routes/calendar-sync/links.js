const {endpoint}=require('../../_lib/scheduleHttp');
const {keys,text,uuid,fail,databaseError}=require('../../_lib/schedule');
const {LINK_DAYS,newCode,codeHash,linkError,linkSelection}=require('../../_lib/calendarSync');
// Firebase-only management: list links, issue a one-time pairing code, revoke a link.
const FIELDS='id,label,faculty,group_set_id,created_at,last_used_at,revoked_at';
function view(row){
  const expires=new Date(Date.parse(row.last_used_at)+LINK_DAYS*86400000).toISOString();
  return {...row,expires_at:expires,active:!row.revoked_at&&expires>new Date().toISOString()};
}
module.exports=endpoint(['GET','POST','DELETE'],async(req,ctx,uid)=>{
  if(req.method==='GET'){
    const {data,error}=await ctx.db.from('calendar_links').select(FIELDS).eq('user_id',ctx.userId).order('created_at',{ascending:false}).limit(50);
    databaseError(error);return {links:data.map(view)};
  }
  if(req.method==='DELETE'){
    keys(req.body,['link_id']);uuid(req.body.link_id);
    const {data,error}=await ctx.db.from('calendar_links').update({revoked_at:new Date().toISOString()})
      .eq('id',req.body.link_id).eq('user_id',ctx.userId).is('revoked_at',null).select('id');
    databaseError(error);if(!data.length)fail(404,'NOT_FOUND','Nie znaleziono aktywnego połączenia.');
    return {revoked:true};
  }
  keys(req.body,['label','faculty','group_set_id']);
  const label=text(req.body.label,80,true).trim(),faculty=text(req.body.faculty,256,true).trim(),groupSetId=text(req.body.group_set_id,128,true);
  // Refuse a code for a set the feed could not resolve.
  await linkSelection({firebase_uid:uid,faculty,group_set_id:groupSetId});
  const code=newCode();
  const {data,error}=await ctx.db.rpc('create_calendar_link_code',{p_user_id:ctx.userId,p_code_hash:codeHash(code),
    p_label:label,p_faculty:faculty,p_group_set_id:groupSetId});
  linkError(error);
  return {code,expires_at:data.expires_at};
});
