const {linkEndpoint,linkSelection,feedRange,feedFingerprint,buildFeed}=require('../../_lib/calendarSync');
// Effective plan of the linked user for an external calendar mirror. The ETag is checked before the
// plan is loaded, so polling an unchanged plan costs a few small queries.
module.exports=linkEndpoint('GET',async(req,ctx,link,res)=>{
  const {name,selection}=await linkSelection(link);
  const window=feedRange(req.query||{});
  const etag=`"${await feedFingerprint(ctx,selection,window)}"`;
  res.setHeader('ETag',etag);
  if(String(req.headers['if-none-match']||'')===etag){res.statusCode=304;res.end();return undefined;}
  const feed=await buildFeed(ctx,selection,window);
  return {link:{id:link.id,label:link.label,faculty:link.faculty,group_set_id:link.group_set_id,group_set_name:name},
    timezone:'Europe/Warsaw',...window,version:feed.version,events:feed.events};
});
