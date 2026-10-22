const {route}=require('../_lib/router');
module.exports=route({
  'added-events':require('../_routes/my-plan/added-events'),
  'add-event':require('../_routes/my-plan/add-event'),
  'changes':require('../_routes/my-plan/changes'),
  'remove-event':require('../_routes/my-plan/remove-event'),
});
