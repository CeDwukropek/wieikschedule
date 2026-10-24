const {endpoint}=require('../../_lib/scheduleHttp');
const {savePreferences}=require('../../_lib/planReminders');
// Own reminders by kind; reminders: null restores the defaults.
module.exports=endpoint('POST',async(req,ctx)=>savePreferences(ctx,req.body||{}));
