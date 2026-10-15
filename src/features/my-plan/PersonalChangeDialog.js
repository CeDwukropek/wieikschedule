import {useEffect,useRef,useState} from 'react';
import {personalRequest} from './personalScheduleApi';
const labels={date:'Data',start_time:'Godzina',duration_min:'Czas trwania (min)',room:'Sala',instructor:'Prowadzący'};
function Summary({row}) {
  if(!row)return <p>Odwołane tylko dla Ciebie</p>;
  return <dl>{Object.entries(labels).map(([key,label])=><div key={key}><dt className="inline text-neutral-400">{label}: </dt><dd className="inline">{row[key]??'—'}</dd></div>)}</dl>;
}
export default function PersonalChangeDialog({source,override,initialProposal,onClose,onSaved}) {
  const dialog=useRef(null),close=useRef(onClose);close.current=onClose;
  const initial={...source,...(override?.patch||{})};
  const [values,setValues]=useState(initial);
  const [fields,setFields]=useState(new Set(Object.keys(override?.patch||{})));
  const [reason,setReason]=useState(override?.reason||'');
  const [proposal,setProposal]=useState(initialProposal||null);
  const [error,setError]=useState(''),[busy,setBusy]=useState(false);
  useEffect(()=>{
    const previous=document.activeElement;
    dialog.current?.focus();
    const listener=event=>{
      if(event.key==='Escape'){event.preventDefault();close.current();}
      if(event.key==='Tab'){
        const nodes=[...dialog.current.querySelectorAll('button:not(:disabled),input:not(:disabled),textarea:not(:disabled)')];
        const first=nodes[0],last=nodes[nodes.length-1];
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
      }
    };
    document.addEventListener('keydown',listener);return ()=>{document.removeEventListener('keydown',listener);previous?.focus();};
  },[]);
  const preview=async(operation,action)=>{
    setBusy(true);setError('');
    try{
      const patch={};
      if(action==='modify')fields.forEach(key=>{
        const value=values[key];
        patch[key]=key==='duration_min'?Number(value):key==='start_time'?`${String(value).slice(0,5)}:00`:
          ['room','instructor'].includes(key)&&!String(value??'').trim()?null:value;
      });
      const data=await personalRequest('propose',{event_id:source.id,operation,...(operation==='delete'?{}:{action,patch,reason:reason||null})});
      setProposal(data.proposal);
    }catch(err){setError(err.message);}finally{setBusy(false);}
  };
  const confirm=async()=>{
    setBusy(true);setError('');
    try{await personalRequest('confirm',{proposal_id:proposal.id,provider:proposal.provider,session_id:proposal.session_id});onSaved();}
    catch(err){setError(err.message);if(err.code==='PLAN_CHANGED')setProposal(null);}finally{setBusy(false);}
  };
  return <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/80 p-4" onClick={event=>{if(event.target===event.currentTarget&&!busy)onClose();}}>
    <section ref={dialog} role="dialog" aria-modal="true" aria-label="Zmiana mojego planu" tabIndex={-1} className="w-full max-w-lg max-h-[90dvh] overflow-auto rounded-2xl border border-neutral-700 bg-neutral-950 p-6 space-y-4">
      <h2 className="text-xl font-semibold">{source.subject}</h2>
      <p className="text-sm text-neutral-400">Zmiana dotyczy tylko Twojego planu.</p>
      {proposal?<>
        <div className="grid grid-cols-2 gap-4 text-sm"><div><h3 className="font-semibold mb-2">Przed</h3><Summary row={proposal.before}/></div><div><h3 className="font-semibold mb-2">Po zatwierdzeniu</h3><Summary row={proposal.after}/></div></div>
        {proposal.reason&&<p className="text-sm">Powód: {proposal.reason}</p>}
        <p className="text-xs text-neutral-400">Podgląd jest ważny 10 minut. Zmiana nie została jeszcze zapisana.</p>
        <button type="button" disabled={busy} className="rounded bg-sky-600 px-4 py-2" onClick={confirm}>{busy?'Zapisywanie…':'Zatwierdź zmianę'}</button>
        {!initialProposal&&<button type="button" disabled={busy} className="ml-3" onClick={()=>setProposal(null)}>Wróć do edycji</button>}
      </>:<>
        <p className="text-sm">Zaznacz pola, które chcesz zastąpić. Puste pole sali lub prowadzącego usuwa tę informację.</p>
        {Object.entries(labels).map(([key,label])=><div key={key} className="flex gap-3 items-center">
          <input aria-label={`Zmień: ${label}`} type="checkbox" checked={fields.has(key)} onChange={event=>setFields(previous=>{const next=new Set(previous);event.target.checked?next.add(key):next.delete(key);return next;})}/>
          <label className="flex-1 text-sm">{label}<input className="block w-full rounded bg-neutral-800 p-2 mt-1" type={key==='date'?'date':key==='start_time'?'time':key==='duration_min'?'number':'text'}
            min={key==='duration_min'?1:undefined} max={key==='duration_min'?900:undefined} maxLength={256}
            value={key==='start_time'?String(values[key]||'').slice(0,5):values[key]??''}
            onChange={event=>{setValues(previous=>({...previous,[key]:event.target.value}));setFields(previous=>new Set([...previous,key]));}}/></label>
        </div>)}
        <label className="block text-sm">Powód (opcjonalnie)<textarea className="block w-full rounded bg-neutral-800 p-2" maxLength={1000} value={reason} onChange={event=>setReason(event.target.value)}/></label>
        <div className="flex flex-wrap gap-3">
          <button disabled={busy||!fields.size} className="rounded bg-sky-600 px-3 py-2 disabled:opacity-40" onClick={()=>preview('upsert','modify')}>Podgląd zmiany</button>
          <button disabled={busy} className="rounded bg-rose-950 px-3 py-2" onClick={()=>preview('upsert','cancel')}>Odwołaj tylko dla mnie</button>
          {override&&<button disabled={busy} className="rounded bg-neutral-800 px-3 py-2" onClick={()=>preview('delete')}>Przywróć plan uczelni</button>}
        </div>
      </>}
      {error&&<p role="alert" className="text-rose-300">{error}</p>}
      <button type="button" disabled={busy} className="block text-neutral-400" onClick={onClose}>Zamknij</button>
    </section>
  </div>;
}
