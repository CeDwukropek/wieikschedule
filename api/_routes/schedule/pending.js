const {endpoint}=require('../../_lib/scheduleHttp');
const {databaseError,text}=require('../../_lib/schedule');
module.exports=endpoint('GET',async(req,ctx)=>{
  const session=text(req.query.session_id,128,true);
  const {data,error}=await ctx.db.from('schedule_change_proposals').select('id,event_id,operation,action,patch,reason,provider,session_id,expires_at,expected_event,expected_override')
    .eq('user_id',ctx.userId).eq('session_id',session).is('consumed_at',null).gt('expires_at',new Date().toISOString()).order('created_at').limit(50);
  databaseError(error);
  return {proposals:data.map(row=>({id:row.id,event_id:row.event_id,operation:row.operation,action:row.action,patch:row.patch,reason:row.reason,
    provider:row.provider,session_id:row.session_id,expires_at:row.expires_at,source:row.expected_event,
    before:row.expected_override?.action==='cancel'?null:{...row.expected_event,...(row.expected_override?.patch||{})},
    after:row.operation==='delete'?row.expected_event:row.action==='cancel'?null:{...row.expected_event,...row.patch},requires_confirmation:true}))};
});
