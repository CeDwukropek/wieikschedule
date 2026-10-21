import {useEffect,useRef,useState} from 'react';
import {useFirebaseAuth} from '../auth/useFirebaseAuth';
import {personalRequest} from '../my-plan/personalScheduleApi';
import {nativeCapabilities,setLocalToken,localToken} from '../chat/localOdysseus';
export default function AiSettings(){
  const {user}=useFirebaseAuth();
  const activeUid=useRef(user?.uid);activeUid.current=user?.uid;
  const [state,setState]=useState(null),[apiKey,setApiKey]=useState(''),[notice,setNotice]=useState(null),[busy,setBusy]=useState(false);
  const [catalog,setCatalog]=useState({uid:'',models:[],loading:false,error:''});
  const [catalogVersion,setCatalogVersion]=useState(0);
  const [localAccess,setLocalAccess]=useState(''),[native,setNative]=useState(null);
  const ready=Boolean(user&&state?.uid===user.uid);
  const uid=user?.uid,provider=state?.provider,hasKey=Boolean(state?.has_api_key);
  useEffect(()=>{
    setState(null);setApiKey('');setNotice(null);setBusy(false);setNative(null);setLocalAccess(localToken(user?.uid));
    if(!user)return undefined;
    let active=true;
    personalRequest('ai-settings').then(data=>{if(active)setState({...data.settings,uid:user.uid});}).catch(err=>{if(active)setNotice({tone:'error',text:err.message});});
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
  if(!user)return <p className="text-sm text-neutral-400">Zaloguj się, aby skonfigurować asystenta AI.</p>;
  const models=catalog.uid===user.uid?catalog.models:[];
  const save=async(remove=false)=>{
    setBusy(true);setNotice(null);
    try{
      const data=await personalRequest('ai-settings',{provider:state.provider,model:state.model,local_endpoint:state.local_endpoint,
        local_endpoint_id:state.local_endpoint_id||'',local_model:state.local_model||'',local_memory:state.local_memory||false,api_key:apiKey,remove_api_key:remove});
      if(activeUid.current!==user.uid)return;
      setLocalToken(user.uid,localAccess);
      setState({...data.settings,uid:user.uid});setApiKey('');setNotice({tone:'ok',text:'Zapisano ustawienia AI.'});
      setCatalogVersion(value=>value+1);
    }catch(err){if(activeUid.current===user.uid)setNotice({tone:'error',text:err.message});}finally{if(activeUid.current===user.uid)setBusy(false);}
  };
  const connect=async()=>{
    setBusy(true);setNotice(null);setNative(null);
    try{
      const result=await nativeCapabilities(state.local_endpoint,user.uid,localAccess);
      if(activeUid.current!==user.uid)return;
      setNative(result);setLocalToken(user.uid,localAccess);
      if(!result.endpoints.length)throw new Error('Odysseus nie ma dopuszczonego połączenia z modelem dla planu.');
      const endpoint=result.endpoints.find(row=>row.id===state.local_endpoint_id)||result.endpoints.find(row=>row.execution!=='cloud');
      setState(previous=>({...previous,local_endpoint_id:endpoint?.id||'',
        local_model:endpoint?(endpoint.models.includes(previous.local_model)?previous.local_model:endpoint.models[0]||''):''}));
      setNotice({tone:'ok',text:'Połączenie z Odysseusem działa. Wybierz model i zapisz ustawienia.'});
    }catch(err){if(activeUid.current===user.uid)setNotice({tone:'error',text:err.message});}finally{if(activeUid.current===user.uid)setBusy(false);}
  };
  const input='block w-full rounded border border-neutral-700 bg-neutral-800 p-2 text-sm';
  const card=selected=>`flex gap-3 rounded-lg border p-3 text-sm cursor-pointer ${selected?'border-sky-500 bg-sky-950/40':'border-neutral-700 hover:border-neutral-500'}`;
  const step='space-y-2 rounded-lg border border-neutral-800 p-3';
  const selectedEndpoint=native?.endpoints.find(row=>row.id===state?.local_endpoint_id);
  return <section className="space-y-4" aria-labelledby="ai-settings-title">
    <h3 id="ai-settings-title" className="text-sm font-semibold text-gray-200">Asystent AI</h3>
    {ready?<>
      <fieldset className="space-y-2">
        <legend className="mb-1 text-xs text-gray-400">Gdzie działa asystent</legend>
        <label className={card(state.provider==='odysseus')}>
          <input type="radio" name="ai-provider" value="odysseus" checked={state.provider==='odysseus'} onChange={()=>setState({...state,provider:'odysseus'})}/>
          <span><span className="block font-medium">Mój Odysseus</span><span className="block text-xs text-neutral-400">Modele lokalne albo skonfigurowane w Odysseusie. Klucze dostawców zostają w Odysseusie.</span></span>
        </label>
        <label className={card(state.provider==='n8n')}>
          <input type="radio" name="ai-provider" value="n8n" checked={state.provider==='n8n'} onChange={()=>setState({...state,provider:'n8n'})}/>
          <span><span className="block font-medium">OpenAI z moim kluczem</span><span className="block text-xs text-amber-300">Rozmowa w tym trybie jest jeszcze niedostępna; możesz zapisać klucz i model.</span></span>
        </label>
      </fieldset>
      {state.provider==='n8n'?<div className="space-y-3">
        <label className="block text-sm">Klucz API<input type="password" autoComplete="new-password" className={input} value={apiKey} maxLength={4096} placeholder={state.has_api_key?'Klucz zapisany — wpisz nowy, aby zastąpić':'Wpisz swój klucz API'} onChange={event=>setApiKey(event.target.value)}/></label>
        {state.has_api_key&&<button type="button" className="text-xs text-rose-300" disabled={busy} onClick={()=>save(true)}>Usuń zapisany klucz</button>}
        <label className="block text-sm">Model OpenAI<select className={input} disabled={!state.has_api_key||catalog.loading} value={state.model} onChange={event=>setState({...state,model:event.target.value})}>
          <option value="">{catalog.loading?'Pobieranie modeli…':state.has_api_key?'Wybierz model':'Najpierw zapisz klucz API'}</option>
          {state.model&&!models.some(model=>model.id===state.model)&&<option value={state.model}>{state.model} (zapisany)</option>}
          {models.map(model=><option key={model.id} value={model.id}>{model.id}</option>)}
        </select></label>
        {state.has_api_key&&<button type="button" className="text-xs underline" disabled={catalog.loading||busy} onClick={()=>setCatalogVersion(value=>value+1)}>Odśwież listę modeli</button>}
        {catalog.uid===user.uid&&catalog.error&&<p role="status" className="text-sm text-amber-200">{catalog.error}</p>}
        <details><summary className="cursor-pointer text-xs text-neutral-400">Wpisz nazwę modelu ręcznie</summary><label className="mt-2 block text-sm">Nazwa modelu<input className={input} value={state.model} maxLength={128} onChange={event=>setState({...state,model:event.target.value})}/></label></details>
      </div>:<div className="space-y-3">
        <div className={step}>
          <p className="text-xs font-medium text-gray-300">1. Połączenie</p>
          <label className="block text-sm">Adres Odysseusa<input type="url" className={input} placeholder="https://twoj-serwer:port" value={state.local_endpoint} maxLength={2048} onChange={event=>{setState({...state,local_endpoint:event.target.value});setNative(null);}}/></label>
          <label className="block text-sm">Token dostępu Odysseusa (chat)<input type="password" autoComplete="off" className={input} value={localAccess} onChange={event=>setLocalAccess(event.target.value)} placeholder="ody_… lub aktywne logowanie w Odysseusie"/></label>
          <p className="text-xs text-neutral-500">Token zostaje tylko w tej karcie przeglądarki; nie zapisujemy go.</p>
          <button type="button" className="rounded bg-neutral-800 px-3 py-1.5 text-sm" disabled={busy||!state.local_endpoint} onClick={connect}>Sprawdź połączenie z Odysseusem</button>
          {native&&<p className="text-xs text-emerald-300">Połączono · dostępnych połączeń z modelem: {native.endpoints.length}</p>}
        </div>
        <div className={step}>
          <p className="text-xs font-medium text-gray-300">2. Model</p>
          {native?<>
            <label className="block text-sm">Połączenie z modelem<select className={input} value={state.local_endpoint_id||''} onChange={event=>{const endpoint=native.endpoints.find(row=>row.id===event.target.value);setState({...state,local_endpoint_id:endpoint?.id||'',local_model:endpoint?.models[0]||''});}}>
              <option value="">Wybierz połączenie</option>
              {native.endpoints.map(row=><option key={row.id} value={row.id}>{row.name}{row.execution==='cloud'?` — API: ${row.destination}`:' — lokalnie'}</option>)}
            </select></label>
            {selectedEndpoint?.execution==='cloud'&&<p role="note" className="text-xs text-amber-200">Wybrany dostawca: {selectedEndpoint.destination}. Wiadomości, historia rozmowy i wyniki narzędzi planu będą wysyłane do tego dostawcy. Włączona pamięć udostępni mu także pobrany kontekst pamięci i dokumentów Odysseusa. Obowiązują opłaty Twojego konta API.</p>}
            <label className="block text-sm">Model Odysseusa<select className={input} value={state.local_model||''} onChange={event=>setState({...state,local_model:event.target.value})}>
              {(selectedEndpoint?.models||[]).map(model=><option key={model} value={model}>{model}</option>)}
            </select></label>
          </>:<p className="text-xs text-neutral-400">{state.local_model?`Zapisany model: ${state.local_model}. Sprawdź połączenie, aby go zmienić.`:'Sprawdź połączenie, aby wybrać model.'}</p>}
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={state.local_memory||false} onChange={event=>setState({...state,local_memory:event.target.checked})}/>Używaj pamięci i dokumentów mojego konta Odysseusa</label>
        </div>
      </div>}
      <details className="text-xs text-neutral-400">
        <summary className="cursor-pointer">Prywatność i koszty</summary>
        <div className="mt-2 space-y-2">
          {state.provider==='n8n'?<>
            <p>Klucz przechowujemy zaszyfrowany w Firebase. Wysłana wiadomość, historia rozmowy i wyniki narzędzi planu trafiają do OpenAI; opłaty są rozliczane na Twoim kluczu.</p>
            <p>Lista modeli pochodzi z OpenAI i obejmuje różne rodzaje modeli. Wybierz model tekstowy obsługujący narzędzia; obecność na liście nie potwierdza zgodności.</p>
          </>:<>
            <p>Własny Odysseus musi mieć włączoną integrację planu. Agent korzysta z narzędzi planu zajęć; klucze dostawców nie trafiają do tej aplikacji.</p>
            <p>Dostępność modelu zależy też od uprawnień i limitów konta API dostawcy wybranego w Odysseusie.</p>
          </>}
        </div>
      </details>
      <button type="button" className="w-full rounded bg-sky-700 px-3 py-2 text-sm font-medium" disabled={busy} onClick={()=>save()}>{busy?'Zapisywanie…':'Zapisz ustawienia AI'}</button>
    </>:!notice&&<p className="text-sm">Ładowanie ustawień AI…</p>}
    {notice&&<p role="status" className={`text-sm ${notice.tone==='ok'?'text-emerald-300':'text-rose-300'}`}>{notice.text}</p>}
  </section>;
}
