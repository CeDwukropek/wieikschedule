const {linkEndpoint,linkSelection,feedRange,buildFeed}=require('../_lib/calendarSync');
// Effective plan of the linked user for an external calendar mirror; ETag avoids resending unchanged plans.
module.exports=linkEndpoint('GET',async(req,ctx,link,res)=>{
  const {name,selection}=await linkSelection(link);
  const window=feedRange(req.query||{});
  const feed=await buildFeed(ctx,selection,window);
  const etag=`"${feed.version}"`;
  res.setHeader('ETag',etag);
  if(String(req.headers['if-none-match']||'')===etag){res.statusCode=304;res.end();return undefined;}
  return {link:{id:link.id,label:link.label,faculty:link.faculty,group_set_id:link.group_set_id,group_set_name:name},
    timezone:'Europe/Warsaw',...window,version:feed.version,events:feed.events};
});
