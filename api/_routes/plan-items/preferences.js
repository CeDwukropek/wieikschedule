const {endpoint}=require('../../_lib/scheduleHttp');
const {getPreferences}=require('../../_lib/planReminders');
// The signed-in person's reminders of entries by kind, with the defaults.
module.exports=endpoint('GET',async(req,ctx)=>getPreferences(ctx));
