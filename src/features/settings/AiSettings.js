import {useEffect,useRef,useState} from 'react';
import {useFirebaseAuth} from '../auth/useFirebaseAuth';
import {personalRequest} from '../my-plan/personalScheduleApi';
import {nativeCapabilities,setLocalToken,localToken} from '../chat/localOdysseus';
export default function AiSettings(){
  const {user}=useFirebaseAuth();
  const activeUid=useRef(user?.uid);activeUid.current=user?.uid;
  const [state,setState]=useState(null),[apiKey,setApiKey]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  const [catalog,setCatalog]=useState({uid:'',models:[],loading:false,error:''});
  const [catalogVersion,setCatalogVersion]=useState(0);
  const [localAccess,setLocalAccess]=useState(''),[native,setNative]=useState(null);
  const ready=Boolean(user&&state?.uid===user.uid);
  const uid=user?.uid,provider=state?.provider,hasKey=Boolean(state?.has_api_key);
  useEffect(()=>{
    setState(null);setApiKey('');setError('');setBusy(false);setNative(null);setLocalAccess(localToken(user?.uid));
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
      const data=await personalRequest('ai-settings',{provider:state.provider,model:state.model,local_endpoint:state.local_endpoint,
        local_endpoint_id:state.local_endpoint_id||'',local_model:state.local_model||'',local_memory:state.local_memory||false,api_key:apiKey,remove_api_key:remove});
      if(activeUid.current!==user.uid)return;
      setLocalToken(user.uid,localAccess);
      setState({...data.settings,uid:user.uid});setApiKey('');setError('Zapisano ustawienia AI.');
      setCatalogVersion(value=>value+1);
    }catch(err){if(activeUid.current===user.uid)setError(err.message);}finally{if(activeUid.current===user.uid)setBusy(false);}
  };
  const connect=async()=>{
    setBusy(true);setError('');setNative(null);
    try{
      const result=await nativeCapabilities(state.local_endpoint,user.uid,localAccess);
      if(activeUid.current!==user.uid)return;
      setNative(result);setLocalToken(user.uid,localAccess);
      if(!result.endpoints.length)throw new Error('Odysseus nie ma dopuszczonego połączenia z modelem dla planu.');
      const endpoint=result.endpoints.find(row=>row.id===state.local_endpoint_id)||result.endpoints.find(row=>row.execution!=='cloud');
      setState(previous=>({...previous,local_endpoint_id:endpoint?.id||'',
        local_model:endpoint?(endpoint.models.includes(previous.local_model)?previous.local_model:endpoint.models[0]||''):''}));
      setError('Połączenie z Odysseusem działa. Wybierz model i zapisz ustawienia.');
    }catch(err){if(activeUid.current===user.uid)setError(err.message);}finally{if(activeUid.current===user.uid)setBusy(false);}
  };
  return <section className="space-y-3 border-t border-neutral-800 pt-4">
    <h3 className="font-semibold">Model AI</h3>
    {ready?<>
      <label className="block text-sm">Sposób połączenia<select className="block w-full bg-neutral-800 rounded p-2" value={state.provider} onChange={event=>setState({...state,provider:event.target.value})}>
        <option value="n8n">API OpenAI przez n8n</option><option value="odysseus">Modele skonfigurowane w Odysseusie</option>
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
        <label className="block text-sm">Adres Odysseusa<input type="url" className="block w-full bg-neutral-800 rounded p-2" placeholder="https://twoj-serwer:port" value={state.local_endpoint} maxLength={2048} onChange={event=>{setState({...state,local_endpoint:event.target.value});setNative(null);}}/></label>
        <label className="block text-sm">Token dostępu Odysseusa (chat)<input type="password" autoComplete="off" className="block w-full bg-neutral-800 rounded p-2" value={localAccess} onChange={event=>setLocalAccess(event.target.value)} placeholder="ody_… lub aktywne logowanie w Odysseusie"/></label>
        <p className="text-xs text-neutral-400">Token pozostaje tylko w pamięci tej strony, do odświeżenia lub wylogowania. Nie zapisujemy go w Firebase. Własny Odysseus musi mieć włączoną integrację planu.</p>
        <p className="text-xs text-neutral-400">Klucze dostawców pozostają w Odysseusie — nie trzeba wpisywać ich ponownie w planie. Agent korzysta z narzędzi planu zajęć.</p>
        <button type="button" className="text-sm underline" disabled={busy||!state.local_endpoint} onClick={connect}>Sprawdź połączenie z Odysseusem</button>
        {native&&<>
          <label className="block text-sm">Połączenie z modelem<select className="block w-full bg-neutral-800 rounded p-2" value={state.local_endpoint_id||''} onChange={event=>{const endpoint=native.endpoints.find(row=>row.id===event.target.value);setState({...state,local_endpoint_id:endpoint?.id||'',local_model:endpoint?.models[0]||''});}}>
            <option value="">Wybierz połączenie</option>
            {native.endpoints.map(row=><option key={row.id} value={row.id}>{row.name}{row.execution==='cloud'?` — API: ${row.destination}`:' — lokalnie'}</option>)}
          </select></label>
          {native.endpoints.find(row=>row.id===state.local_endpoint_id)?.execution==='cloud'&&<p role="note" className="text-xs text-amber-200">Wybrany dostawca: {native.endpoints.find(row=>row.id===state.local_endpoint_id).destination}. Wiadomości, historia rozmowy i wyniki narzędzi planu będą wysyłane do tego dostawcy. Włączona pamięć udostępni mu także pobrany kontekst pamięci i dokumentów Odysseusa. Obowiązują opłaty Twojego konta API.</p>}
          <label className="block text-sm">Model Odysseusa<select className="block w-full bg-neutral-800 rounded p-2" value={state.local_model||''} onChange={event=>setState({...state,local_model:event.target.value})}>
            {(native.endpoints.find(row=>row.id===state.local_endpoint_id)?.models||[]).map(model=><option key={model} value={model}>{model}</option>)}
          </select></label>
        </>}
        {!native&&state.local_model&&<p className="text-xs">Zapisany model: {state.local_model}</p>}
        <label className="block text-sm"><input type="checkbox" checked={state.local_memory||false} onChange={event=>setState({...state,local_memory:event.target.checked})}/> Używaj pamięci i dokumentów mojego konta Odysseusa</label>
      </>}
      <button className="rounded bg-sky-700 px-3 py-2 text-sm" disabled={busy} onClick={()=>save()}>{busy?'Zapisywanie…':'Zapisz ustawienia AI'}</button>
    </>:!error&&<p>Ładowanie ustawień AI…</p>}
    {error&&<p role="status" className="text-sm">{error}</p>}
  </section>;
}
