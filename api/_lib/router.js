"use strict";
// Vercel Hobby deploys at most 12 functions, so each API area is one function that dispatches
// /api/<area>/<action> to a handler in api/_routes. Public URLs stay unchanged.
function route(handlers) {
  return async(req,res)=>{
    const segment=String(req.url||'').split('?')[0].split('/').filter(Boolean).pop();
    const action=segment||String(req.query?.action||'');
    if(!Object.hasOwn(handlers,action)){
      res.setHeader('Cache-Control','no-store');
      return res.status(404).json({ok:false,error:'NOT_FOUND'});
    }
    // Vercel adds the path segment to the query; handlers expect only the caller's parameters.
    if(req.query&&req.query.action===action)delete req.query.action;
    return handlers[action](req,res);
  };
}
module.exports={route};
