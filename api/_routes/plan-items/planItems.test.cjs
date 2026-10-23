const test=require('node:test'),assert=require('node:assert/strict');
const crypto=require('node:crypto');
const path=require('node:path');
const items=require('../../_lib/planItems');
const sync=require('../../_lib/calendarSync');
function chainDb(handlers){
  const calls=[];
  return {calls,rpc:async(name,args)=>{calls.push(['rpc',name,args]);return handlers.rpc(name,args);},
    from(table){
      const query={table,ops:[]};calls.push(query);
      const chain=new Proxy({},{get(_,key){
        if(key==='then'){const result=handlers[table](query);return (resolve,reject)=>Promise.resolve(result).then(resolve,reject);}
        return (...args)=>{query.ops.push([key,...args]);return chain;};
      }});
      return chain;
    }};
}
const ID='00000000-0000-0000-0000-0000000000aa';
const has=(query,...op)=>query.ops.some(item=>JSON.stringify(item)===JSON.stringify(op));
const entry=(id,extra={})=>({id,scope:'group',faculty:'EiAs3',subject:'MUD',class_type:'Laboratorium',group:'L1',kind:'kolokwium',
  timing:'class',date:'2026-11-02',revision:1,...extra});
const range={faculties:'EiAs3',from:'2026-10-01',to:'2026-11-30'};

test('entries are checked for shape and normalised before they reach the database',()=>{
  const created=items.validateItem({scope:'group',faculty:'EiAs3',subject:'MUD',kind:'kolokwium',timing:'slot',date:'2026-11-07',
    start_time:'09:15',duration_min:90,title:'Kolokwium'});
  assert.equal(created.start_time,'09:15:00');
  assert.equal(items.validateItem({id:ID,revision:3,due_time:null}).due_time,null);
  for(const [bad,code] of [[{scope:'personal',faculty:'F',kind:'inne',timing:'due',date:'2026-11-07',title:'T',owner_id:ID},'INVALID_ARGUMENTS'],
    [{scope:'everyone',faculty:'F',kind:'inne',timing:'due',title:'T'},'INVALID_SCOPE'],
    [{scope:'personal',faculty:'F',kind:'quiz',timing:'due',title:'T'},'INVALID_KIND'],
    [{scope:'personal',faculty:'F',kind:'inne',timing:'due',date:'2026-02-30',title:'T'},'INVALID_DATE'],
    [{scope:'personal',faculty:'F',kind:'inne',timing:'slot',date:'2026-11-07',start_time:'24:00',title:'T'},'INVALID_TIME'],
    [{scope:'personal',faculty:'F',kind:'inne',timing:'slot',date:'2026-11-07',start_time:'09:00',duration_min:2,title:'T'},'INVALID_DURATION'],
    [{scope:'personal',faculty:'F',kind:'inne',timing:'due',date:'2026-11-07',title:' '},'INVALID_TEXT'],
    [{id:ID,title:'Bez wersji'},'INVALID_REVISION'],[{id:'1',revision:1},'INVALID_ID']])
    assert.throws(()=>items.validateItem(bad),{code},JSON.stringify(bad));
});

test('database refusals become specific messages',()=>{
  for(const [error,status,code] of [[{code:'42501',message:'PLAN_ITEM_FORBIDDEN'},403,'FORBIDDEN'],
    [{code:'P0002',message:'INVITE_INVALID'},404,'INVITE_INVALID'],[{code:'23505',message:'duplicate key'},409,'DUPLICATE'],
    [{code:'PT409',message:'PLAN_ITEM_CHANGED'},409,'CHANGED'],[{code:'PT409',message:'other conflict'},409,'CHANGED'],[{code:'22023',message:'OUTSIDE_SCHEDULE_HOURS'},422,'OUTSIDE_HOURS'],
    [{code:'22007',message:'invalid input syntax'},422,'INVALID_ITEM'],[{code:'XX000',message:'boom'},503,'SCHEDULE_UNAVAILABLE']])
    assert.throws(()=>items.itemError(error),{statusCode:status,code});
  assert.doesNotThrow(()=>items.itemError(null));
});

test('guests get the group entries of their plans and nothing private',async()=>{
  const db=chainDb({plan_items:query=>{
    assert.ok(has(query,'eq','scope','group'));assert.ok(has(query,'in','faculty',['EiAs3','EiAs1']));
    assert.ok(has(query,'is','deleted_at',null));assert.ok(has(query,'gte','date','2026-10-01'));
    assert.ok(!/owner_id|author_id|updated_by/.test(query.ops.find(op=>op[0]==='select')[1]));
    return {data:[entry('g1')],error:null};
  }});
  const result=await items.listItems({db,userId:null},{...range,faculties:' EiAs3,EiAs1,EiAs3 '});
  assert.deepEqual(result,{items:[{...entry('g1'),my_state:null,can_edit:false}],roles:[]});
  assert.deepEqual(db.calls.map(call=>call.table),['plan_items']);
  for(const [query,code] of [[{...range,faculties:Array.from({length:10},(_,i)=>'F'+i).join(',')},'INVALID_FACULTY'],
    [{...range,to:'2027-06-01'},'INVALID_RANGE'],[{...range,from:'2026-12-01'},'INVALID_RANGE'],[{...range,extra:1},'INVALID_ARGUMENTS']])
    await assert.rejects(items.listItems({db,userId:null},query),{code});
});

test('signed-in users also get their own entries, their state and what they may edit',async()=>{
  const group=[entry('g1'),entry('g2',{group:'L2'}),entry('g3',{group:null,timing:'slot'}),entry('g4',{faculty:'EiAs1'})];
  const roles=[{id:'r1',role:'group_starosta',faculty:'EiAs3',group:'L1'},{id:'r2',role:'starosta',faculty:'EiAs1',group:null}];
  const db=chainDb({
    plan_items:query=>({data:has(query,'eq','owner_id','u')?[entry('p1',{scope:'personal',group:null})]:group,error:null}),
    plan_roles:query=>{assert.ok(has(query,'eq','user_id','u'));return {data:roles,error:null};},
    plan_item_state:query=>{assert.ok(has(query,'eq','user_id','u'));return {data:[{item_id:'g2',hidden:true,progress:'ready',note:null}],error:null};}});
  const result=await items.listItems({db,userId:'u'},{...range,faculties:'EiAs3,EiAs1'});
  const byId=Object.fromEntries(result.items.map(item=>[item.id,item]));
  assert.deepEqual(Object.fromEntries(Object.entries(byId).map(([id,item])=>[id,item.can_edit])),{g1:true,g2:false,g3:false,g4:true,p1:true});
  assert.deepEqual(byId.g2.my_state,{hidden:true,progress:'ready',note:null});
  assert.deepEqual(result.roles,roles);
  assert.ok(items.canEdit(entry('x',{faculty:'Other',group:'L9'}),[{role:'admin'}],'u'));
  assert.ok(!items.canEdit(entry('x'),[{role:'admin'}],null));
});

test('writes pass the verified user and normalised entries to the database functions',async()=>{
  const db=chainDb({rpc:(name,args)=>({data:name==='save_plan_items'?args.p_items.map((item,index)=>({...item,id:'n'+index,revision:1})):args.p_items,error:null})});
  const ctx={db,userId:'u'};
  const saved=await items.saveItems(ctx,{items:[{scope:'personal',faculty:'EiAs3',kind:'inne',timing:'slot',date:'2026-11-07',
    start_time:'08:00',duration_min:60,title:'Konsultacje'}]});
  assert.deepEqual(db.calls[0].slice(0,2),['rpc','save_plan_items']);
  assert.equal(db.calls[0][2].p_user,'u');assert.equal(db.calls[0][2].p_items[0].start_time,'08:00:00');
  assert.equal(saved.items[0].can_edit,true);
  await assert.rejects(items.saveItems(ctx,{items:Array.from({length:21},()=>({}))}),{code:'INVALID_ITEMS'});
  await assert.rejects(items.saveItems(ctx,{items:[],extra:1}),{code:'INVALID_ARGUMENTS'});
  await items.removeItems(ctx,{items:[{id:ID,revision:2}],restore:true});
  assert.deepEqual(db.calls[1],['rpc','remove_plan_items',{p_user:'u',p_items:[{id:ID,revision:2}],p_restore:true}]);
  await assert.rejects(items.removeItems(ctx,{items:[{id:ID}]}),{code:'INVALID_REVISION'});
  await assert.rejects(items.setState(ctx,{item_id:ID,progress:'submitted'}),{code:'INVALID_PROGRESS'});
  await assert.rejects(items.setState(ctx,{item_id:ID}),{code:'INVALID_ARGUMENTS'});
});

test('invite codes are shown once, typed by hand and stored only as a hash distinct from pairing codes',async()=>{
  const db=chainDb({rpc:(name,args)=>({data:name==='create_plan_role_invite'?{role:args.p_role,faculty:args.p_faculty,group:args.p_group,expires_at:'later'}
    :{role:'group_starosta'},error:null})});
  const {invite}=await items.createInvite({db,userId:'u'},{role:'group_starosta',faculty:' EiAs3 ',group:'Lk4 '});
  assert.match(invite.code,/^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  const stored=db.calls[0][2];
  assert.deepEqual([stored.p_faculty,stored.p_group],['EiAs3','Lk4']);
  assert.equal(stored.p_code_hash,crypto.createHash('sha256').update('invite:'+invite.code.replace(/-/g,'')).digest('hex'));
  assert.notEqual(stored.p_code_hash,sync.codeHash(invite.code));
  await items.redeemInvite({db,userId:'v'},{code:invite.code.toLowerCase().replace(/-/g,' ')});
  assert.equal(db.calls[1][2].p_code_hash,stored.p_code_hash);
  assert.throws(()=>items.inviteHash('ABCD-EFGH-IJKL'),{code:'INVALID_CODE'});
  await assert.rejects(items.createInvite({db,userId:'u'},{role:'starosta',faculty:'EiAs3',group:'L1'}),{code:'INVALID_ROLE'});
  await assert.rejects(items.createInvite({db,userId:'u'},{role:'admin',faculty:'EiAs3'}),{code:'INVALID_ROLE'});
});

test('managed roles never identify their holders',async()=>{
  const db=chainDb({plan_roles:query=>has(query,'eq','user_id','u')
    ?{data:[{id:'r1',role:'starosta',faculty:'EiAs3',group:null}],error:null}
    :(assert.ok(has(query,'in','faculty',['EiAs3'])),{data:[{id:'r1',role:'starosta',faculty:'EiAs3',group:null,user_id:'u',created_at:'t'},
      {id:'r2',role:'group_starosta',faculty:'EiAs3',group:'L1',user_id:'secret',created_at:'t'}],error:null})});
  const result=await items.listRoles({db,userId:'u'});
  assert.deepEqual(result.managed.map(role=>[role.id,role.mine]),[['r1',true],['r2',false]]);
  assert.ok(!JSON.stringify(result).includes('secret'));
  const student=chainDb({plan_roles:()=>({data:[],error:null})});
  assert.deepEqual(await items.listRoles({db:student,userId:'s'}),{roles:[],managed:[]});
  assert.equal(student.calls.length,1);
});

test('the calendar mirror gets the plan groups entries, own entries and entries for every group of a planned subject',()=>{
  const selection={faculty:'EiAs3',groups:{L:'L1'}};
  const subjects=new Set(['EiAs3\nMUD']);
  assert.ok(items.entryBelongs(entry('a'),selection,subjects));
  assert.ok(!items.entryBelongs(entry('b',{group:'L2'}),selection,subjects));
  assert.ok(items.entryBelongs(entry('c',{group:null}),selection,subjects));
  assert.ok(!items.entryBelongs(entry('d',{group:null,subject:'Inny'}),selection,subjects));
  assert.ok(items.entryBelongs(entry('e',{scope:'personal',group:'L9'}),selection,subjects));
  assert.ok(items.entryBelongs(entry('f',{group:'W',class_type:'Wykład'}),selection,subjects));
});

test('a guest request runs without a user; a token that is sent must be valid',async()=>{
  const lib=path.join(__dirname,'../../_lib');
  const stub=(name,exports)=>{const file=require.resolve(path.join(lib,name));require.cache[file]={id:file,filename:file,loaded:true,exports};};
  stub('supabaseAdmin.js',{getSupabaseAdminClient:()=>'guest-db'});
  stub('requestAuth.js',{verifyRequestUser:async()=>{throw Object.assign(new Error('Nie udalo sie zweryfikowac'),{statusCode:401,code:'UNAUTHORIZED'});}});
  delete require.cache[require.resolve(path.join(lib,'scheduleHttp.js'))];
  const {endpoint}=require('../../_lib/scheduleHttp');
  const seen=[];
  const handler=endpoint('GET',async(req,ctx)=>{seen.push(ctx);return {fine:true};},{guest:true});
  const response=()=>{const res={};res.setHeader=()=>{};res.status=code=>{res.statusCode=code;return res;};res.json=body=>{res.body=body;return res;};return res;};
  const guest=response();await handler({method:'GET',headers:{}},guest);
  assert.deepEqual([guest.statusCode,guest.body,seen],[200,{ok:true,fine:true},[{db:'guest-db',userId:null}]]);
  const forged=response();await handler({method:'GET',headers:{authorization:'Bearer forged'}},forged);
  assert.deepEqual([forged.statusCode,forged.body.error],[401,'UNAUTHORIZED']);
  const signedOnly=response();await endpoint('GET',async()=>assert.fail('must not run'))({method:'GET',headers:{}},signedOnly);
  assert.equal(signedOnly.statusCode,401);
  delete require.cache[require.resolve(path.join(lib,'scheduleHttp.js'))];
});
