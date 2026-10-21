import {useCallback,useEffect,useRef,useState} from 'react';
import {useFirebaseAuth} from '../auth/useFirebaseAuth';
import {authorizedRequest} from '../my-plan/personalScheduleApi';
const when=value=>new Date(value).toLocaleString('pl-PL',{dateStyle:'short',timeStyle:'short'});
export default function CalendarSyncSettings({currentSchedule,activeGroupSetId,groupSetOptions=[]}){
  const {user}=useFirebaseAuth();
  const activeUid=useRef(user?.uid);activeUid.current=user?.uid;
  const [links,setLinks]=useState(null),[setId,setSetId]=useState(activeGroupSetId||''),[label,setLabel]=useState('Odysseus');
  const [code,setCode]=useState(null),[revoking,setRevoking]=useState(''),[status,setStatus]=useState(''),[busy,setBusy]=useState(false);
  const load=useCallback(async()=>{
    const uid=user?.uid;
    try{const data=await authorizedRequest('calendar-sync/links','GET');if(activeUid.current===uid)setLinks(data.links);}
    catch(err){if(activeUid.current===uid)setStatus(err.message);}
  },[user]);
  useEffect(()=>{setLinks(null);setCode(null);setStatus('');setRevoking('');if(user)load();},[user,load]);
  useEffect(()=>{setSetId(activeGroupSetId||'');},[activeGroupSetId,currentSchedule]);
  if(!user)return null;
  const run=async action=>{
    const uid=user.uid;setBusy(true);setStatus('');
    try{await action();}catch(err){if(activeUid.current===uid)setStatus(err.message);}finally{if(activeUid.current===uid)setBusy(false);}
  };
  const createCode=()=>run(async()=>{
    const data=await authorizedRequest('calendar-sync/links','POST',{label:label.trim(),faculty:currentSchedule,group_set_id:setId});
    setCode(data);
  });
  const revoke=id=>run(async()=>{
    await authorizedRequest('calendar-sync/links','DELETE',{link_id:id});
    setRevoking('');setStatus('Połączenie odwołane. Kalendarz w Odysseusie przestanie się aktualizować.');await load();
  });
  const setName=(faculty,id)=>faculty===currentSchedule?groupSetOptions.find(option=>option.id===id)?.name||id:id;
  return <section className="space-y-3 border-t border-neutral-800 pt-4">
    <h3 className="font-semibold">Kalendarz w Odysseusie</h3>
    <p className="text-xs text-neutral-400">Odysseus pokaże Twój plan w swoim kalendarzu i będzie go odświeżał. Połączenie daje dostęp tylko do Twojego planu i prywatnych zmian; wygasa po 180 dniach bez użycia.</p>
    <label className="block text-sm">Zestaw grup<select className="block w-full bg-neutral-800 rounded p-2" value={setId} onChange={event=>setSetId(event.target.value)}>
      {groupSetOptions.map(option=><option key={option.id} value={option.id}>{option.name}</option>)}
    </select></label>
    <label className="block text-sm">Nazwa połączenia<input className="block w-full bg-neutral-800 rounded p-2" value={label} maxLength={80} onChange={event=>setLabel(event.target.value)}/></label>
    <button type="button" className="rounded bg-sky-700 px-3 py-2 text-sm" disabled={busy||!currentSchedule||!setId||!label.trim()} onClick={createCode}>Wygeneruj kod połączenia</button>
    {code&&<div role="status" className="rounded border border-sky-800 p-3 text-sm space-y-1">
      <p>Kod: <strong className="font-mono text-base tracking-wider">{code.code}</strong></p>
      <p className="text-xs text-neutral-400">Wpisz go w Odysseusie (Kalendarz → Plan zajęć wieikschedule) razem z adresem <span className="font-mono">{window.location.origin}</span>. Kod jest jednorazowy i ważny do {when(code.expires_at)}.</p>
    </div>}
    {links===null?!status&&<p className="text-sm">Ładowanie połączeń…</p>:links.length>0&&<ul className="space-y-2 text-sm">
      {links.map(link=><li key={link.id} className="rounded bg-neutral-800 p-2">
        <p><strong>{link.label}</strong> — {link.faculty}, {setName(link.faculty,link.group_set_id)}</p>
        <p className="text-xs text-neutral-400">{link.revoked_at?`Odwołane ${when(link.revoked_at)}`:link.active?`Ostatnie użycie ${when(link.last_used_at)}, wygaśnie bez użycia ${when(link.expires_at)}`:`Wygasło ${when(link.expires_at)}`}</p>
        {link.active&&(revoking===link.id?<p className="text-xs">Odwołać dostęp?{' '}
          <button type="button" className="text-rose-300 underline" disabled={busy} onClick={()=>revoke(link.id)}>Tak, odwołaj</button>{' '}
          <button type="button" className="underline" disabled={busy} onClick={()=>setRevoking('')}>Anuluj</button></p>
          :<button type="button" className="text-xs text-rose-300" disabled={busy} onClick={()=>setRevoking(link.id)}>Odwołaj połączenie</button>)}
      </li>)}
    </ul>}
    {status&&<p role="status" className="text-sm">{status}</p>}
  </section>;
}
