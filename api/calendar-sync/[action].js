const {route}=require('../_lib/router');
module.exports=route({
  'changes':require('../_routes/calendar-sync/changes'),
  'confirm':require('../_routes/calendar-sync/confirm'),
  'feed':require('../_routes/calendar-sync/feed'),
  'links':require('../_routes/calendar-sync/links'),
  'pair':require('../_routes/calendar-sync/pair'),
  'proposals':require('../_routes/calendar-sync/proposals'),
  'reject':require('../_routes/calendar-sync/reject'),
  'unlink':require('../_routes/calendar-sync/unlink'),
});
