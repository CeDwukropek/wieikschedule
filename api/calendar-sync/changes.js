const {linkEndpoint,calendarChange}=require('../_lib/calendarSync');
// Private change from the linked calendar: applied at once for a user's own edit, or kept as a preview.
module.exports=linkEndpoint('POST',async(req,ctx,link)=>calendarChange(ctx,link,req.body));
