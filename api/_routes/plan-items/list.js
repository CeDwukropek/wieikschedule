const {endpoint}=require('../../_lib/scheduleHttp');
const {listItems}=require('../../_lib/planItems');
// Entries of the given plans in a date range: group entries for everyone, own entries and state when signed in.
module.exports=endpoint('GET',async(req,ctx)=>listItems(ctx,req.query||{}),{guest:true});
