const {endpoint}=require('../_lib/scheduleHttp');
const {fail}=require('../_lib/schedule');
// Provider transport remains disabled until the external-data flow is approved.
module.exports=endpoint('POST',async()=>{
  fail(503,'API_PROVIDER_DISABLED','Tryb zewnętrznego API czeka na aktywację. Ręczne zmiany i lokalne narzędzia są dostępne.');
});
