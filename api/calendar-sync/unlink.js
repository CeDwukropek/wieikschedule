const {linkEndpoint}=require('../_lib/calendarSync');
const {databaseError}=require('../_lib/schedule');
// Lets the external calendar revoke its own token when the user disconnects it there.
module.exports=linkEndpoint('POST',async(req,ctx,link)=>{
  const {error}=await ctx.db.from('calendar_links').update({revoked_at:new Date().toISOString()}).eq('id',link.id).is('revoked_at',null);
  databaseError(error);return {revoked:true};
});
