const {linkEndpoint,confirmCalendarProposal}=require('../../_lib/calendarSync');
// Confirms a preview created through the same link, after the user accepts it in the calendar.
module.exports=linkEndpoint('POST',async(req,ctx,link)=>confirmCalendarProposal(ctx,link,req.body||{}));
