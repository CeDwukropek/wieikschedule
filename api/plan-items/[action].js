const {route}=require('../_lib/router');
module.exports=route({
  'confirm-agent':require('../_routes/plan-items/confirm-agent'),
  'history':require('../_routes/plan-items/history'),
  'invite':require('../_routes/plan-items/invite'),
  'list':require('../_routes/plan-items/list'),
  'redeem':require('../_routes/plan-items/redeem'),
  'remove':require('../_routes/plan-items/remove'),
  'revoke':require('../_routes/plan-items/revoke'),
  'roles':require('../_routes/plan-items/roles'),
  'save':require('../_routes/plan-items/save'),
  'state':require('../_routes/plan-items/state'),
});
