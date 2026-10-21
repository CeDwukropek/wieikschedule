const test=require('node:test'),assert=require('node:assert/strict');
const schedule=require('../_lib/schedule');
const {personalPlan}=require('../_lib/personalPlan');
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
const EVENT='00000000-0000-0000-0000-0000000000aa';
const source={id:EVENT,faculty:'EiAs3',date:'2026-10-19',start_time:'07:30:00',duration_min:90,subject:'MUD',instructor:'T',room:'A2',group:'L1',type:'Laboratorium',status:'aktywne'};
function applyDb({previous=null,replay=[]}={}){
  return chainDb({
    schedule_change_proposals:query=>query.ops.some(op=>op[0]==='single')?{data:{expected_override:previous},error:null}:{data:replay,error:null},
    rpc:(name,args)=>name==='propose_schedule_change'
      ?{data:{id:'22222222-2222-2222-2222-222222222222',event_id:args.p_event_id,operation:args.p_operation,action:args.p_action,
        patch:args.p_patch,provider:args.p_provider,session_id:args.p_session_id,expected_event:source,expected_override:previous},error:null}
      :{data:{event_id:EVENT,operation:args.p_session_id},error:null},
  });
}
const edit={event_id:EVENT,operation:'upsert',action:'modify',patch:{start_time:'12:00:00'},request_id:'req-12345678'};
test('an own edit is applied in one request and returns how to undo it',async()=>{
  const db=applyDb();
  const result=await schedule.apply({db,userId:'u'},edit);
  const rpc=db.calls.filter(call=>call[0]==='rpc');
  assert.deepEqual(rpc.map(call=>[call[1],call[2].p_provider,call[2].p_session_id]),
    [['propose_schedule_change','manual','manual:req-12345678'],['confirm_schedule_change','manual','manual:req-12345678']]);
  assert.deepEqual(result.undo,{event_id:EVENT,operation:'delete'});
  assert.equal(result.after.start_time,'12:00:00');
  const earlier={action:'modify',patch:{room:'B1'},reason:'sala'};
  assert.deepEqual((await schedule.apply({db:applyDb({previous:earlier}),userId:'u'},edit)).undo,
    {event_id:EVENT,operation:'upsert',action:'modify',patch:{room:'B1'},reason:'sala'});
});
test('a retried edit is not applied twice and keeps its undo',async()=>{
  const db=applyDb({replay:[{event_id:EVENT,result:{ok:1},expected_override:null}]});
  const result=await schedule.apply({db,userId:'u'},edit);
  assert.deepEqual(result,{result:{ok:1},undo:{event_id:EVENT,operation:'delete'},replayed:true});
  assert.equal(db.calls.filter(call=>call[0]==='rpc').length,0);
  await assert.rejects(schedule.apply({db,userId:'u'},{...edit,request_id:'x'}),{code:'INVALID_REQUEST'});
  await assert.rejects(schedule.apply({db,userId:'u'},{...edit,provider:'odysseus'}),{code:'INVALID_ARGUMENTS'});
});
test('my plan lists changes, cancellations, makeup classes and open agent previews with before and after',async()=>{
  const moved={...source,id:'00000000-0000-0000-0000-0000000000bb'};
  const makeup={...source,id:'00000000-0000-0000-0000-0000000000cc',date:'2026-10-21',group:'L3'};
  const db=chainDb({
    schedule_overrides:()=>({data:[
      {id:'o1',event_id:EVENT,action:'cancel',patch:{},revision:1,updated_at:'t',events:source},
      {id:'o2',event_id:moved.id,action:'modify',patch:{start_time:'12:00:00'},reason:'prowadzący',revision:2,updated_at:'t',events:moved},
      {id:'o3',event_id:makeup.id,action:'modify',patch:{room:'C3'},revision:1,updated_at:'t',events:makeup}],error:null}),
    user_added_events:()=>({data:[{id:'a1',schedule_name:'EiAs3',reason:'makeup',created_at:'t',events:makeup}],error:null}),
    schedule_change_proposals:query=>{
      assert.ok(query.ops.some(op=>op[0]==='in'&&op[2].includes('odysseus')&&!op[2].includes('manual')));
      return {data:[{id:'p1',event_id:EVENT,operation:'upsert',action:'modify',patch:{room:'D4'},provider:'odysseus',session_id:'s',
        expires_at:'later',expected_event:source,expected_override:{action:'cancel',patch:{}}}],error:null};
    },
  });
  const plan=await personalPlan({db,userId:'u'});
  const byKind=Object.groupBy(plan.items,item=>item.kind);
  assert.equal(byKind.cancelled[0].current,null);
  assert.deepEqual([byKind.modified.find(item=>item.event_id===moved.id).original.start_time,byKind.modified.find(item=>item.event_id===moved.id).current.start_time],['07:30:00','12:00:00']);
  assert.equal(byKind.added[0].added_event_id,'a1');
  assert.equal(byKind.added[0].current.room,'C3');
  assert.equal(plan.items.filter(item=>item.event_id===makeup.id).length,1);
  assert.deepEqual([plan.proposals[0].before,plan.proposals[0].after.room],[null,'D4']);
});
