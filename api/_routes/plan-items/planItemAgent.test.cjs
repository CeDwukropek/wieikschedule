const test=require('node:test'),assert=require('node:assert/strict');
process.env.SCHEDULE_TOOL_SECRET='test-secret-test-secret-test-secret-123';
const agent=require('../../_lib/planItemAgent');

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
const E1='00000000-0000-4000-8000-0000000000e1',E2='00000000-0000-4000-8000-0000000000e2';
const lab=(id,date,extra={})=>({id,faculty:'EiAs3',date,start_time:'09:15:00',duration_min:90,subject:'Analiza obwodów elektrycznych',
  instructor:'T',room:'108D',group:'L4',type:'Laboratorium',status:'aktywne',...extra});
const source=[lab(E1,'2026-11-05'),lab(E2,'2026-11-19'),lab('lec','2026-11-05',{id:'lec',group:'W',type:'Wykład',start_time:'12:00:00'}),
  lab('other','2026-11-06',{group:'L2'})];
const load=async()=>({source,events:source});
const selection={faculty:'EiAs3',groups:{L:'L4'}};
const db=({roles=[],existing=[]}={})=>chainDb({plan_roles:()=>({data:roles,error:null}),plan_items:()=>({data:existing,error:null}),
  rpc:(name,args)=>({data:args.p_items.map((item,index)=>({...item,id:'saved-'+index,revision:1})),error:null})});
const now=new Date('2026-10-24T10:00:00Z');
const args={kind:'kolokwium',subject:'analiza obwodów',terms:[{date:'2026-11-05'},{date:'2026-11-12'},{date:'2026-11-26',time:'10:00'}]};

test('terms are matched to the group\'s classes; a day without one needs the user\'s hour, never a guess',async()=>{
  const ctx={db:db({roles:[{role:'group_starosta',faculty:'EiAs3',group:'L4'}]}),userId:'u'};
  const result=await agent.prepareEntries(ctx,selection,args,now,load);
  assert.equal(result.status,'prepared');
  const [onClass,noClass,ownTime]=result.proposal.items;
  // The lab, not the lecture the same day (which is mentioned).
  assert.deepEqual([onClass.item.timing,onClass.item.event_id,onClass.item.scope,onClass.item.group],['class',E1,'group','L4']);
  assert.match(onClass.warnings.join(' '),/inne zajęcia.*Wykład 12:00/);
  assert.deepEqual([noClass.item.timing,noClass.item.start_time,noClass.needs_time],['slot',null,true]);
  assert.match(noClass.warnings.join(' '),/nie ma zajęć.*Podaj godzinę/);
  assert.deepEqual([ownTime.item.start_time,ownTime.item.duration_min,ownTime.needs_time],['10:00:00',90,false]);
  assert.ok(result.proposal.signature);
  assert.match(result.message,/3 terminy.*Nic nie zostało zapisane/);
});

test('without a role the preview is personal; reports are deadlines; existing entries are not offered again',async()=>{
  const ctx={db:db({existing:[{id:'x',scope:'personal',owner_id:'u',kind:'sprawozdanie',timing:'due',subject:'Analiza obwodów elektrycznych',group:null,date:'2026-11-12',due_time:null}]}),userId:'u'};
  const result=await agent.prepareEntries(ctx,selection,{kind:'sprawozdanie',subject:'AOE',terms:[{date:'2026-11-12'},{date:'2026-11-19',due_time:'23:59'}]},now,load);
  const [first,second]=result.proposal.items;
  assert.deepEqual([first.item.scope,first.item.timing,first.item.group,first.selectable],['personal','due',null,false]);
  assert.match(first.warnings.join(' '),/tylko dla Ciebie.*już istnieje/);
  assert.deepEqual([second.item.due_time,second.selectable,second.audience],['23:59:00',true,'Tylko Ty']);
  const unknown=await agent.prepareEntries(ctx,selection,{kind:'kolokwium',subject:'chemia kwantowa',terms:[{date:'2026-11-12'}]},now,load);
  assert.equal(unknown.status,'subject_not_found');assert.equal(unknown.proposal,undefined);
  await assert.rejects(agent.prepareEntries(ctx,selection,{...args,terms:[{date:'12.11.2026'}]},now,load),{code:'INVALID_DATE'});
});

test('only the prepared entries of one\'s own unexpired preview are saved; only a missing hour may be added',async()=>{
  const ctx={db:db({roles:[{role:'admin'}]}),userId:'u'};
  const {proposal}=await agent.prepareEntries(ctx,selection,args,now,load);
  const saved=await agent.confirmEntries(ctx,{proposal,indexes:[0,1],times:{1:'08:00'}},now);
  const rpc=ctx.db.calls.find(call=>call[0]==='rpc');
  assert.deepEqual(rpc[2].p_items.map(item=>[item.timing,item.event_id??null,item.start_time??null]),[['class',E1,null],['slot',null,'08:00:00']]);
  assert.equal(saved.items.length,2);
  const tampered={...proposal,items:proposal.items.map(entry=>entry.index===0?{...entry,item:{...entry.item,title:'Inny'}}:entry)};
  await assert.rejects(agent.confirmEntries(ctx,{proposal:tampered,indexes:[0]},now),{code:'INVALID_PREVIEW'});
  await assert.rejects(agent.confirmEntries({...ctx,userId:'someone-else'},{proposal,indexes:[0]},now),{code:'INVALID_PREVIEW'});
  await assert.rejects(agent.confirmEntries(ctx,{proposal,indexes:[0]},new Date('2026-10-24T13:00:00Z')),{code:'PREVIEW_EXPIRED'});
  await assert.rejects(agent.confirmEntries(ctx,{proposal,indexes:[1]},now),{code:'TIME_REQUIRED'});
  await assert.rejects(agent.confirmEntries(ctx,{proposal,indexes:[0],times:{0:'08:00'}},now),{code:'INVALID_ARGUMENTS'});
});
