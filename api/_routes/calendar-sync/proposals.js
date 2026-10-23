const {linkEndpoint,listCalendarProposals}=require('../../_lib/calendarSync');
// Open previews prepared by the Odysseus agent through this link.
module.exports=linkEndpoint('GET',async(req,ctx,link)=>listCalendarProposals(ctx,link));
