import {useEffect,useRef,useState} from 'react';
import {useFirebaseAuth} from '../auth/useFirebaseAuth';
import {personalRequest} from '../my-plan/personalScheduleApi';
import {nativeCapabilities,setLocalToken,localToken,isTokenRemembered} from '../chat/localOdysseus';
import IntegrationCard from './IntegrationCard';
import CalendarSyncSettings from './CalendarSyncSettings';

// The chat with an own OpenAI key does not work yet; its settings are shown only with this flag.
export const openAiAvailable=()=>process.env.REACT_APP_OPENAI_ASSISTANT==='true';

const input='block w-full rounded border border-neutral-700 bg-neutral-800 p-2 text-sm';
const step='space-y-2 rounded-lg border border-neutral-800 p-3';

// Odysseus in one card: the connection (address and a token remembered on this device), the assistant's model
// (saved as soon as it is chosen) and the calendar links. The card's header says how things stand.
export default function AiSettings({calendar,onStatus}){
  const {user}=useFirebaseAuth();
  const activeUid=useRef(user?.uid);activeUid.current=user?.uid;
  const [state,setState]=useState(null),[apiKey,setApiKey]=useState(''),[notice,setNotice]=useState(null),[busy,setBusy]=useState(false);
  const [catalog,setCatalog]=useState({uid:'',models:[],loading:false,error:''});
  const [catalogVersion,setCatalogVersion]=useState(0);
  const [localAccess,setLocalAccess]=useState(''),[native,setNative]=useState(null),[remember,setRemember]=useState(true);
  const [checking,setChecking]=useState(false),[links,setLinks]=useState(null);
  const ready=Boolean(user&&state?.uid===user.uid);
  const uid=user?.uid,hasKey=Boolean(state?.has_api_key);
  // Without the OpenAI flag a saved "n8n" choice is shown and saved as Odysseus.
  const provider=state&&(openAiAvailable()?state.provider:'odysseus');
  useEffect(()=>{
    setState(null);setApiKey('');setNotice(null);setBusy(false);setNative(null);setLinks(null);setLocalAccess(localToken(user?.uid));
    setRemember(user?isTokenRemembered(user.uid)||!localToken(user.uid):true);
    if(!user)return undefined;
    let active=true;
    personalRequest('ai-settings').then(data=>{if(active)setState({...data.settings,uid:user.uid});}).catch(err=>{if(active)setNotice({area:'load',tone:'error',text:err.message});});
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
  // With a saved address and a known token the models are listed at once, without "Sprawdź połączenie".
  const endpoint=state?.local_endpoint;
  useEffect(()=>{
    if(!ready||provider!=='odysseus'||!endpoint||!localToken(uid))return undefined;
    const controller=new AbortController();
    setChecking(true);
    nativeCapabilities(endpoint,uid,localToken(uid),controller.signal).then(result=>{
      if(activeUid.current===uid)setNative(previous=>previous||result);
    },err=>{if(err?.name!=='AbortError'&&activeUid.current===uid)setNotice({area:'connect',tone:'error',text:err.message});})
      .finally(()=>{if(!controller.signal.aborted)setChecking(false);});
    return ()=>controller.abort();
  },[ready,provider,endpoint,uid]);
  const connectionError=notice?.area==='connect'&&notice.tone==='error';
  const status=!user?{text:'Zaloguj się',tone:'idle'}:!ready?{text:'Wczytywanie…',tone:'idle'}
    :checking?{text:'Sprawdzanie połączenia…',tone:'idle'}
    :connectionError?{text:'Połączenie nie działa',tone:'error'}
    :native?{text:[`Połączony${state.local_model?` · ${state.local_model}`:''}`,links?.length?`kalendarz: ${links.length}`:''].filter(Boolean).join(' · '),tone:'ok'}
    :state.local_endpoint?{text:'Wpisz token, aby połączyć',tone:'idle'}:{text:'Niepołączony',tone:'idle'};
  const statusTone=status.tone;
  useEffect(()=>{onStatus?.(statusTone);},[onStatus,statusTone]);

  const save=async(next=state,{remove=false,area='save'}={})=>{
    setBusy(true);setNotice(null);
    try{
      const data=await personalRequest('ai-settings',{provider:openAiAvailable()?next.provider:'odysseus',model:next.model,local_endpoint:next.local_endpoint,
        local_endpoint_id:next.local_endpoint_id||'',local_model:next.local_model||'',local_memory:next.local_memory||false,api_key:apiKey,remove_api_key:remove});
      if(activeUid.current!==user.uid)return;
      setState({...data.settings,uid:user.uid});setApiKey('');
      setNotice({area:remove?'key':area,tone:'ok',text:remove?'Usunięto zapisany klucz.':area==='connect'?'Połączenie działa i zostało zapisane.':'Zapisano.'});
      setCatalogVersion(value=>value+1);
    }catch(err){if(activeUid.current===user.uid)setNotice({area:remove?'key':area,tone:'error',text:err.message});}finally{if(activeUid.current===user.uid)setBusy(false);}
  };
  // A choice in the assistant step is saved at once.
  const choose=patch=>{const next={...state,...patch};setState(next);save(next,{area:'model'});};
  const connect=async()=>{
    setBusy(true);setNotice(null);setNative(null);
    try{
      const result=await nativeCapabilities(state.local_endpoint,user.uid,localAccess);
      if(activeUid.current!==user.uid)return;
      setNative(result);setLocalToken(user.uid,localAccess,{remember});
      if(!result.endpoints.length)throw new Error('Odysseus nie ma dopuszczonego połączenia z modelem dla planu.');
      // A local model is chosen by itself; a cloud provider only by the person (it receives the conversation).
      const found=result.endpoints.find(row=>row.id===state.local_endpoint_id)||result.endpoints.find(row=>row.execution!=='cloud');
      const next={...state,local_endpoint_id:found?.id||'',
        local_model:found?(found.models.includes(state.local_model)?state.local_model:found.models[0]||''):''};
      setState(next);
      setBusy(false);
      await save(next,{area:'connect'});
    }catch(err){if(activeUid.current===user.uid)setNotice({area:'connect',tone:'error',text:err.message});}finally{if(activeUid.current===user.uid)setBusy(false);}
  };
  const message=area=>notice?.area===area&&<p role="status" className={`text-sm ${notice.tone==='ok'?'text-emerald-300':'text-rose-300'}`}>{notice.text}</p>;
  const selectedEndpoint=native?.endpoints.find(row=>row.id===state?.local_endpoint_id);
  const models=catalog.uid===user?.uid?catalog.models:[];

  const odysseus=ready&&<div className="space-y-3">
    <div className={step}>
      <p className="text-xs font-medium text-gray-300">1. Połączenie</p>
      <label className="block text-sm">Adres Odysseusa<input type="url" className={input} placeholder="https://twoj-serwer:port" value={state.local_endpoint} maxLength={2048} onChange={event=>{setState({...state,local_endpoint:event.target.value});setNative(null);}}/></label>
      <label className="block text-sm">Token dostępu Odysseusa (chat)<input type="password" autoComplete="off" className={input} value={localAccess} onChange={event=>setLocalAccess(event.target.value)} placeholder="ody_… lub aktywne logowanie w Odysseusie"/></label>
      <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={remember} onChange={event=>{
        setRemember(event.target.checked);if(!event.target.checked)setLocalToken(user.uid,localAccess,{remember:false});}}/>
        <span>Zapamiętaj token na tym urządzeniu<span className="block text-xs text-neutral-500">{remember
          ?'Zostaje w tej przeglądarce dla Twojego konta; nie trafia na nasz serwer. Odznacz na wspólnym komputerze.'
          :'Token zostaje tylko do zamknięcia karty; nie zapisujemy go.'}</span></span></label>
      <button type="button" className="rounded bg-neutral-800 px-3 py-1.5 text-sm" disabled={busy||!state.local_endpoint} onClick={connect}>Sprawdź połączenie z Odysseusem</button>
      {native&&<p className="text-xs text-emerald-300">Połączono · dostępnych połączeń z modelem: {native.endpoints.length}</p>}
      {message('connect')}
    </div>
    <div className={step}>
      <p className="text-xs font-medium text-gray-300">2. Asystent</p>
      {native?<>
        <label className="block text-sm">Połączenie z modelem<select className={input} disabled={busy} value={state.local_endpoint_id||''} onChange={event=>{const row=native.endpoints.find(item=>item.id===event.target.value);choose({local_endpoint_id:row?.id||'',local_model:row?.models[0]||''});}}>
          <option value="">Wybierz połączenie</option>
          {native.endpoints.map(row=><option key={row.id} value={row.id}>{row.name}{row.execution==='cloud'?` — API: ${row.destination}`:' — lokalnie'}</option>)}
        </select></label>
        {selectedEndpoint?.execution==='cloud'&&<p role="note" className="text-xs text-amber-200">Wybrany dostawca: {selectedEndpoint.destination}. Wiadomości, historia rozmowy i wyniki narzędzi planu będą wysyłane do tego dostawcy. Włączona pamięć udostępni mu także pobrany kontekst pamięci i dokumentów Odysseusa. Obowiązują opłaty Twojego konta API.</p>}
        <label className="block text-sm">Model Odysseusa<select className={input} disabled={busy} value={state.local_model||''} onChange={event=>choose({local_model:event.target.value})}>
          {(selectedEndpoint?.models||[]).map(model=><option key={model} value={model}>{model}</option>)}
        </select></label>
      </>:<p className="text-xs text-neutral-400">{state.local_model?`Zapisany model: ${state.local_model}. Połącz się, aby go zmienić.`:'Połącz się, aby wybrać model.'}</p>}
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" disabled={busy} checked={state.local_memory||false} onChange={event=>choose({local_memory:event.target.checked})}/>Używaj pamięci i dokumentów mojego konta Odysseusa</label>
      {message('model')}
      <details className="text-xs text-neutral-400">
        <summary className="cursor-pointer">Prywatność i koszty</summary>
        <div className="mt-2 space-y-2">
          <p>Własny Odysseus musi mieć włączoną integrację planu. Agent korzysta z narzędzi planu zajęć; klucze dostawców nie trafiają do tej aplikacji.</p>
          <p>Dostępność modelu zależy też od uprawnień i limitów konta API dostawcy wybranego w Odysseusie.</p>
        </div>
      </details>
    </div>
    {calendar&&<div className={step}>
      <p className="text-xs font-medium text-gray-300">3. Kalendarz</p>
      <CalendarSyncSettings {...calendar} onLinks={setLinks}/>
    </div>}
  </div>;

  const openAi=ready&&openAiAvailable()&&<div className="space-y-3">
    <fieldset className="space-y-1">
      <legend className="mb-1 text-xs text-gray-400">Gdzie działa asystent</legend>
      {[['odysseus','Mój Odysseus'],['n8n','OpenAI z moim kluczem']].map(([value,label])=><label key={value} className="flex items-center gap-2 text-sm">
        <input type="radio" name="ai-provider" value={value} checked={state.provider===value} onChange={()=>setState({...state,provider:value})}/>{label}</label>)}
    </fieldset>
    {state.provider==='n8n'&&<>
      <label className="block text-sm">Klucz API<input type="password" autoComplete="new-password" className={input} value={apiKey} maxLength={4096} placeholder={state.has_api_key?'Klucz zapisany — wpisz nowy, aby zastąpić':'Wpisz swój klucz API'} onChange={event=>setApiKey(event.target.value)}/></label>
      {state.has_api_key&&<button type="button" className="text-xs text-rose-300" disabled={busy} onClick={()=>save(state,{remove:true})}>Usuń zapisany klucz</button>}
      {message('key')}
      <label className="block text-sm">Model OpenAI<select className={input} disabled={!state.has_api_key||catalog.loading} value={state.model} onChange={event=>setState({...state,model:event.target.value})}>
        <option value="">{catalog.loading?'Pobieranie modeli…':state.has_api_key?'Wybierz model':'Najpierw zapisz klucz API'}</option>
        {state.model&&!models.some(model=>model.id===state.model)&&<option value={state.model}>{state.model} (zapisany)</option>}
        {models.map(model=><option key={model.id} value={model.id}>{model.id}</option>)}
      </select></label>
      {state.has_api_key&&<button type="button" className="text-xs underline" disabled={catalog.loading||busy} onClick={()=>setCatalogVersion(value=>value+1)}>Odśwież listę modeli</button>}
      {catalog.uid===user.uid&&catalog.error&&<p role="status" className="text-sm text-amber-200">{catalog.error}</p>}
      <details><summary className="cursor-pointer text-xs text-neutral-400">Wpisz nazwę modelu ręcznie</summary><label className="mt-2 block text-sm">Nazwa modelu<input className={input} value={state.model} maxLength={128} onChange={event=>setState({...state,model:event.target.value})}/></label></details>
      <p className="text-xs text-neutral-400">Klucz przechowujemy zaszyfrowany w Firebase. Wysłana wiadomość, historia rozmowy i wyniki narzędzi planu trafiają do OpenAI; opłaty są rozliczane na Twoim kluczu.</p>
    </>}
    <button type="button" className="w-full rounded bg-sky-700 px-3 py-2 text-sm font-medium" disabled={busy} onClick={()=>save()}>{busy?'Zapisywanie…':'Zapisz ustawienia AI'}</button>
    {message('save')}
  </div>;

  return <>
    <IntegrationCard title="Odysseus" status={status}>
      {!user?<p className="text-sm text-neutral-400">Zaloguj się, aby połączyć asystenta i kalendarz z Odysseusem.</p>
        :ready?odysseus:!notice&&<p className="text-sm">Ładowanie ustawień AI…</p>}
      {message('load')}
    </IntegrationCard>
    {openAi&&<IntegrationCard title="OpenAI z własnym kluczem" status={{text:state.provider==='n8n'?'Wybrany':'Nieużywany',tone:'idle'}}>{openAi}</IntegrationCard>}
  </>;
}
