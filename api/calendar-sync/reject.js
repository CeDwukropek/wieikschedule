const {linkEndpoint,rejectCalendarProposal}=require('../_lib/calendarSync');
// The user declined an agent preview in Odysseus.
module.exports=linkEndpoint('POST',async(req,ctx,link)=>rejectCalendarProposal(ctx,link,req.body||{}));
