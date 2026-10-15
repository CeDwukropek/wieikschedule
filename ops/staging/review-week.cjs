const fs=require('node:fs');
const assert=require('node:assert/strict');
// Use a fresh, isolated Chromium profile: never run against someone's logged-in browser.
const output=process.env.WEEK_REVIEW_OUTPUT||'/review';
fs.mkdirSync(output,{recursive:true});
const after=process.env.WEEK_REVIEW_AFTER==='1';
async function connect(){
 const page=await fetch('http://127.0.0.1:9223/json/new?about:blank',{method:'PUT'}).then(r=>r.json());
 const socket=new WebSocket(page.webSocketDebuggerUrl),pending=new Map();let id=0;
 await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
 socket.addEventListener('message',event=>{const data=JSON.parse(event.data);if(data.id){const p=pending.get(data.id);pending.delete(data.id);if(data.error)p.reject(new Error(JSON.stringify(data.error)));else p.resolve(data.result);}});
 const send=(method,params={})=>new Promise((resolve,reject)=>{const next=++id;pending.set(next,{resolve,reject});socket.send(JSON.stringify({id:next,method,params}));});
 const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(result.exceptionDetails)throw new Error(result.exceptionDetails.text);return result.result.value;};
 return {send,evaluate,socket,page};
}
async function waitFor(evaluate,expression){
 for(let attempt=0;attempt<100;attempt++){if(await evaluate(expression))return;await new Promise(r=>setTimeout(r,100));}
 throw new Error('UI timeout: '+expression);
}
(async()=>{
 const {send,evaluate,socket,page}=await connect();
 await send('Page.enable');await send('Runtime.enable');
 await send('Emulation.setTimezoneOverride',{timezoneId:'Europe/Warsaw'});
 const seed={currentSchedule:'EiAs3',viewMode:'week',weekOffset:1,showAll:false,
  scheduleGroupSets:{EiAs3:{sets:[{id:'set-1',name:'Zestaw 1',groups:{Lk:'Lk1',C:'C1',L:'L1',Lek:'Lek1'},externalSelections:[]}]}},activeGroupSetBySchedule:{EiAs3:'set-1'}};
 await send('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('wieikschedule.userId','review-guest');localStorage.setItem('wieikschedule.review-guest.settings',${JSON.stringify(JSON.stringify(seed))});`});
 const results=[];
 for(const [name,width,height] of [['mobile',390,844],['small-mobile',320,667],['tablet',768,1024],['desktop',1440,1000]]){
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<641});
  await send('Emulation.setTouchEmulationEnabled',{enabled:width<641,maxTouchPoints:1});
  await send('Page.navigate',{url:'http://127.0.0.1:3100/'});
  await waitFor(evaluate,`document.querySelectorAll('.week-event-item').length > 0`);
  const geometry=await evaluate(`(()=>{const g=document.querySelector('.week-grid'),r=g.getBoundingClientRect();return {width:innerWidth,pageWidth:document.documentElement.scrollWidth,gridWidth:Math.round(r.width),gridRight:Math.round(r.right),events:document.querySelectorAll('.week-event-item').length}})()`);
  results.push({name,...geometry});
  if(after){assert.ok(geometry.gridRight<=width,`${name}: grid overflows viewport`);assert.ok(geometry.pageWidth<=width,`${name}: page overflows horizontally`);}
  const screenshot=await send('Page.captureScreenshot',{format:'png'});
  fs.writeFileSync(`${output}/${after?'after':'before'}-${name}.png`,Buffer.from(screenshot.data,'base64'));
  if(after && (name==='mobile'||name==='desktop')){
   const point=await evaluate(`(()=>{const b=[...document.querySelectorAll('.week-event-card')].find(b=>b.textContent.includes('Modelowanie'))||document.querySelector('.week-event-card');b.focus();b.scrollIntoView({block:'nearest'});const r=b.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);
   if(name==='mobile'){
    await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});
    await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   }else{
    await send('Input.dispatchMouseEvent',{type:'mousePressed',x:point.x,y:point.y,button:'left',clickCount:1});
    await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:point.x,y:point.y,button:'left',clickCount:1});
   }
   await waitFor(evaluate,`!!document.querySelector('dialog[open]')`);
   assert.equal(await evaluate(`document.querySelector('dialog').contains(document.activeElement)`),true,'modal owns keyboard focus');
   assert.equal(await evaluate(`!!document.querySelector('dialog').querySelector('.event-details-edit')`),false,'guest has no edit action');
   const modal=await send('Page.captureScreenshot',{format:'png'});
   fs.writeFileSync(`${output}/details-${name}.png`,Buffer.from(modal.data,'base64'));
   await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
   await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
   await waitFor(evaluate,`!document.querySelector('dialog[open]')`);
   assert.equal(await evaluate(`document.activeElement.classList.contains('week-event-card')`),true,'focus returns to the occurrence');
  }
 }
 fs.writeFileSync(`${output}/${after?'after':'before'}-geometry.json`,JSON.stringify(results,null,2));
 console.log(JSON.stringify(results));
 await send('Page.close');socket.close();
})().catch(error=>{console.error(error.message);process.exit(1);});
