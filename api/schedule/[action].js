const {route}=require('../_lib/router');
module.exports=route({
  'ai-settings':require('../_routes/schedule/ai-settings'),
  'apply':require('../_routes/schedule/apply'),
  'apply-batch':require('../_routes/schedule/apply-batch'),
  'chat':require('../_routes/schedule/chat'),
  'confirm':require('../_routes/schedule/confirm'),
  'context':require('../_routes/schedule/context'),
  'models':require('../_routes/schedule/models'),
  'overrides':require('../_routes/schedule/overrides'),
  'pending':require('../_routes/schedule/pending'),
  'propose':require('../_routes/schedule/propose'),
  'reject':require('../_routes/schedule/reject'),
  'tools':require('../_routes/schedule/tools'),
});
