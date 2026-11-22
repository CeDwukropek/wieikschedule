const test=require('node:test'),assert=require('node:assert/strict');
const {listGroupChanges,applyGroupChanges}=require('../../_lib/groupSchedule');
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
const A='00000000-0000-0000-0000-0000000000aa',B='00000000-0000-0000-0000-0000000000bb';
const row=(event_id,extra={})=>({id:'x',event_id,faculty:'EiAs3',group:'Lk1',action:'modify',patch:{date:'2026-11-03'},reason:null,
  revision:1,author_id:'never-shown',updated_at:'2026-11-01T10:00:00Z',...extra});

test('everyone reads the group changes of the shown plans, without authors',async()=>{
  const db=chainDb({group_schedule_overrides:query=>({data:query.ops.some(op=>op[0]==='range'&&op[1]===0)?[row(A)]:[],error:null})});
  const {changes}=await listGroupChanges({db,userId:null},{faculties:'EiAs3, IwIKs3,EiAs3'});
  assert.deepEqual(db.calls[0].ops.find(op=>op[0]==='in'),['in','faculty',['EiAs3','IwIKs3']]);
  assert.equal(changes.length,1);
  assert.ok(!db.calls[0].ops.find(op=>op[0]==='select')[1].includes('author'));
  await assert.rejects(listGroupChanges({db,userId:null},{faculties:''}),{code:'INVALID_TEXT'});
  await assert.rejects(listGroupChanges({db,userId:null},{faculties:'a,b,c,d,e,f,g,h,i,j'}),{code:'INVALID_FACULTY'});
});

test('a series is changed for the group in one call and returns how to undo each class',async()=>{
  const db=chainDb({rpc:(name,args)=>({error:null,data:args.p_changes.map(change=>change.event_id===A
    ?{event_id:A,previous:null,current:row(A,{revision:1})}
    :{event_id:B,previous:row(B,{action:'cancel',patch:{},revision:3}),current:row(B,{revision:4})})})});
  const changes=[{event_id:A,operation:'upsert',action:'modify',patch:{date:'2026-11-03'},revision:null},
    {event_id:B,operation:'upsert',action:'modify',patch:{date:'2026-11-10'},reason:'sala zajęta',revision:3}];
  const result=await applyGroupChanges({db,userId:'u'},{changes});
  const [, name, args]=db.calls[0];
  assert.equal(name,'apply_group_schedule_changes');
  assert.equal(args.p_user,'u');
  assert.deepEqual(args.p_changes.map(change=>[change.event_id,change.revision]),[[A,null],[B,3]]);
  assert.deepEqual(result.undo,[{event_id:A,operation:'delete',revision:1},
    {event_id:B,operation:'upsert',action:'cancel',patch:{},reason:null,revision:4}]);
  assert.ok(!('author_id' in result.results[0].current));
});

test('changes are checked before the database, and refusals are explained',async()=>{
  const db=chainDb({rpc:()=>({data:null,error:{code:'42501',message:'GROUP_CHANGE_FORBIDDEN'}})});
  const one={event_id:A,operation:'upsert',action:'cancel',patch:{},revision:null};
  await assert.rejects(applyGroupChanges({db,userId:'u'},{changes:[one]}),{statusCode:403,code:'FORBIDDEN'});
  const stale=chainDb({rpc:()=>({data:null,error:{code:'PT409',message:'PLAN_CHANGED'}})});
  await assert.rejects(applyGroupChanges({db:stale,userId:'u'},{changes:[one]}),{statusCode:409,code:'CHANGED'});
  await assert.rejects(applyGroupChanges({db,userId:'u'},{changes:[{...one,revision:undefined}]}),{code:'INVALID_REVISION'});
  await assert.rejects(applyGroupChanges({db,userId:'u'},{changes:[{...one,author_id:'x'}]}),{code:'INVALID_ARGUMENTS'});
  await assert.rejects(applyGroupChanges({db,userId:'u'},{changes:[{...one,action:'modify',patch:{owner:'x'}}]}),{code:'INVALID_ARGUMENTS'});
  await assert.rejects(applyGroupChanges({db,userId:'u'},{changes:[one,one]}),{code:'INVALID_CHANGES'});
  await assert.rejects(applyGroupChanges({db,userId:'u'},{changes:[]}),{code:'INVALID_CHANGES'});
  assert.equal(db.calls.length,1);
});
