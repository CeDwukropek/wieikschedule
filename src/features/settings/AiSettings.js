import {useEffect,useState} from 'react';
import {useFirebaseAuth} from '../auth/useFirebaseAuth';
import {personalRequest} from '../my-plan/personalScheduleApi';
export default function AiSettings(){
  const {user}=useFirebaseAuth();
  const [state,setState]=useState(null),[apiKey,setApiKey]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  const [catalog,setCatalog]=useState({uid:'',models:[],loading:false,error:''});
  const [catalogVersion,setCatalogVersion]=useState(0);
  const ready=Boolean(user&&state?.uid===user.uid);
  const uid=user?.uid,provider=state?.provider,hasKey=Boolean(state?.has_api_key);
  useEffect(()=>{
    setState(null);setApiKey('');setError('');
    if(!user)return undefined;
    let active=true;
    personalRequest('ai-settings').then(data=>{if(active)setState({...data.settings,uid:user.uid});}).catch(err=>{if(active)setError(err.message);});
    return ()=>{active=false;};
  },[user]);
  useEffect(()=>{
    if(!ready||provider!=='n8n'||!hasKey){setCatalog({uid:'',models:[],loading:false,error:''});return undefined;}
    let active=true;
    setCatalog({uid,models:[],loading:true,error:''});
    personalRequest('models').then(data=>{
      if(active)setCatalog({uid,models:data.models,loading:false,error:''});
    }).catch(err=>{
      if(active)setCatalog({uid,models:[],loading:false,error:err.message});
    });
    return ()=>{active=false;};
  },[ready,uid,provider,hasKey,catalogVersion]);
  if(!user)return <p className="text-sm text-neutral-400">Zaloguj się, aby wybrać model AI.</p>;
  const models=catalog.uid===user.uid?catalog.models:[];
  const save=async(remove=false)=>{
    setBusy(true);setError('');
    try{
      const data=await personalRequest('ai-settings',{provider:state.provider,model:state.model,local_endpoint:state.local_endpoint,api_key:apiKey,remove_api_key:remove});
      setState({...data.settings,uid:user.uid});setApiKey('');setError('Zapisano ustawienia AI.');
      setCatalogVersion(value=>value+1);
    }catch(err){setError(err.message);}finally{setBusy(false);}
  };
  return <section className="space-y-3 border-t border-neutral-800 pt-4">
    <h3 className="font-semibold">Model AI</h3>
    {ready?<>
      <label className="block text-sm">Sposób połączenia<select className="block w-full bg-neutral-800 rounded p-2" value={state.provider} onChange={event=>setState({...state,provider:event.target.value})}>
        <option value="n8n">API OpenAI przez n8n</option><option value="odysseus">Lokalny agent / Odysseus</option>
      </select></label>
      {state.provider==='n8n'?<>
        <label className="block text-sm">Model OpenAI<select className="block w-full bg-neutral-800 rounded p-2" disabled={!state.has_api_key||catalog.loading} value={state.model} onChange={event=>setState({...state,model:event.target.value})}>
          <option value="">{catalog.loading?'Pobieranie modeli…':'Wybierz model'}</option>
          {state.model&&!models.some(model=>model.id===state.model)&&<option value={state.model}>{state.model} (zapisany)</option>}
          {models.map(model=><option key={model.id} value={model.id}>{model.id}</option>)}
        </select></label>
        {!state.has_api_key?<p className="text-xs text-neutral-400">Zapisz klucz API, aby pobrać dostępne modele.</p>:<>
          <button type="button" className="text-sm underline" disabled={catalog.loading||busy} onClick={()=>setCatalogVersion(value=>value+1)}>Odśwież listę modeli</button>
          <p className="text-xs text-neutral-400">Lista pochodzi z OpenAI i obejmuje różne rodzaje modeli. Do agenta wybierz model tekstowy obsługujący narzędzia; sama obecność na liście nie potwierdza zgodności.</p>
        </>}
        {catalog.uid===user.uid&&catalog.error&&<p role="status" className="text-sm text-amber-200">{catalog.error}</p>}
        <details><summary className="cursor-pointer text-sm text-neutral-400">Wpisz nazwę modelu ręcznie</summary><label className="block text-sm">Nazwa modelu<input className="block w-full bg-neutral-800 rounded p-2" value={state.model} maxLength={128} onChange={event=>setState({...state,model:event.target.value})}/></label></details>
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
