const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {route}=require('../_lib/router');
const API=path.join(__dirname,'..');
function response(){
  const res={headers:{},statusCode:200,body:undefined};
  res.setHeader=(name,value)=>{res.headers[name]=value;};
  res.status=code=>{res.statusCode=code;return res;};
  res.json=value=>{res.body=value;return res;};
  return res;
}
test('dispatches by the last path segment and hides the routing parameter from handlers',async()=>{
  const seen=[];
  const handler=route({propose:async req=>{seen.push(req.query);return 'handled';}});
  assert.equal(await handler({url:'/api/schedule/propose?from=2026-10-01',query:{action:'propose',from:'2026-10-01'}},response()),'handled');
  assert.deepEqual(seen,[{from:'2026-10-01'}]);
});
test('unknown and inherited action names return 404 without calling a handler',async()=>{
  const handler=route({propose:async()=>assert.fail('must not run')});
  for(const url of ['/api/schedule/missing','/api/schedule/constructor','/api/schedule/__proto__','/api/schedule/']){
    const res=response();await handler({url,query:{}},res);
    assert.equal(res.statusCode,404);assert.deepEqual(res.body,{ok:false,error:'NOT_FOUND'});
    assert.equal(res.headers['Cache-Control'],'no-store');
  }
});
test('every handler in api/_routes is registered in its area router',()=>{
  for(const area of ['schedule','my-plan','calendar-sync','plan-items']){
    const files=fs.readdirSync(path.join(API,'_routes',area)).filter(name=>name.endsWith('.js')).map(name=>name.slice(0,-3)).sort();
    const source=fs.readFileSync(path.join(API,area,'[action].js'),'utf8');
    const registered=[...source.matchAll(/'([a-z-]+)':require\('\.\.\/_routes\/([a-z-]+)\/([a-z-]+)'\)/g)];
    assert.deepEqual(registered.map(match=>match[1]).sort(),files,area);
    for(const match of registered)assert.deepEqual([match[2],match[3]],[area,match[1]]);
  }
});
test('the deployment stays within the Vercel Hobby limit of 12 functions',()=>{
  const functions=[];
  (function walk(dir){
    for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
      if(entry.name.startsWith('_')||entry.name.startsWith('.'))continue;
      const full=path.join(dir,entry.name);
      if(entry.isDirectory())walk(full);else if(/\.(c|m)?(j|t)s$/.test(entry.name))functions.push(path.relative(API,full));
    }
  })(API);
  assert.ok(functions.length<=12,`${functions.length} functions: ${functions.join(', ')}`);
});
