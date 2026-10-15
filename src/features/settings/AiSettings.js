import {useEffect,useState} from 'react';
import {useFirebaseAuth} from '../auth/useFirebaseAuth';
import {personalRequest} from '../my-plan/personalScheduleApi';
export default function AiSettings(){
  const {user}=useFirebaseAuth();
  const [state,setState]=useState(null),[apiKey,setApiKey]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  useEffect(()=>{
    setState(null);setApiKey('');setError('');
    if(!user)return undefined;
    let active=true;
    personalRequest('ai-settings').then(data=>{if(active)setState({...data.settings,uid:user.uid});}).catch(err=>{if(active)setError(err.message);});
    return ()=>{active=false;};
  },[user]);
  if(!user)return <p className="text-sm text-neutral-400">Zaloguj się, aby wybrać model AI.</p>;
  const ready=state?.uid===user.uid;
  const save=async(remove=false)=>{
    setBusy(true);setError('');
    try{
      const data=await personalRequest('ai-settings',{provider:state.provider,model:state.model,local_endpoint:state.local_endpoint,api_key:apiKey,remove_api_key:remove});
      setState({...data.settings,uid:user.uid});setApiKey('');setError('Zapisano ustawienia AI.');
    }catch(err){setError(err.message);}finally{setBusy(false);}
  };
  return <section className="space-y-3 border-t border-neutral-800 pt-4">
    <h3 className="font-semibold">Model AI</h3>
    {ready?<>
      <label className="block text-sm">Sposób połączenia<select className="block w-full bg-neutral-800 rounded p-2" value={state.provider} onChange={event=>setState({...state,provider:event.target.value})}>
        <option value="n8n">API OpenAI przez n8n</option><option value="odysseus">Lokalny agent / Odysseus</option>
      </select></label>
      {state.provider==='n8n'?<>
        <label className="block text-sm">Nazwa modelu<input className="block w-full bg-neutral-800 rounded p-2" value={state.model} maxLength={128} onChange={event=>setState({...state,model:event.target.value})}/></label>
        <label className="block text-sm">Klucz API<input type="password" autoComplete="new-password" className="block w-full bg-neutral-800 rounded p-2" value={apiKey} maxLength={4096} placeholder={state.has_api_key?'Klucz zapisany — wpisz nowy, aby zastąpić':'Wpisz swój klucz API'} onChange={event=>setApiKey(event.target.value)}/></label>
        <p className="text-xs text-neutral-400">Klucz przechowujemy zaszyfrowany w Firebase. W trybie API wysłana wiadomość, historia rozmowy i wyniki narzędzi planu trafiają do OpenAI. Opłaty rozliczane są na Twoim kluczu.</p>
        {state.has_api_key&&<button className="text-sm text-rose-300" disabled={busy} onClick={()=>save(true)}>Usuń zapisany klucz</button>}
      </>:<>
        <label className="block text-sm">Adres lokalnego adaptera<input type="url" className="block w-full bg-neutral-800 rounded p-2" placeholder="https://twoj-serwer:port" value={state.local_endpoint} maxLength={2048} onChange={event=>setState({...state,local_endpoint:event.target.value})}/></label>
        <p className="text-xs text-neutral-400">Przeglądarka łączy się bezpośrednio z adapterem schedule-tools przy Odysseusie. Adapter wymaga lokalnego modelu obsługującego narzędzia i dostępu do tej strony.</p>
      </>}
      <button className="rounded bg-sky-700 px-3 py-2 text-sm" disabled={busy} onClick={()=>save()}>{busy?'Zapisywanie…':'Zapisz ustawienia AI'}</button>
    </>:!error&&<p>Ładowanie ustawień AI…</p>}
    {error&&<p role="status" className="text-sm">{error}</p>}
  </section>;
}
