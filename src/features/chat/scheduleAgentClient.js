import {personalRequest} from '../my-plan/personalScheduleApi';
import {auth} from '../../lib/firebaseClient';
import {nativeUrl,nativeCapabilities,localToken} from './localOdysseus';
export async function sendScheduleAgentMessage({message,scheduleName,sessionId,selectedGroups={},externalSelections=[],intent='query',history=[],signal}) {
  const {settings}=await personalRequest('ai-settings');
  const body={message,faculty:scheduleName,session_id:sessionId,history:history.slice(-16)};
  if(settings.provider==='n8n')return personalRequest('chat',body);
  if(!settings.local_endpoint)throw new Error('W menu zapisz adres swojego Odysseusa.');
  const uid=auth?.currentUser?.uid;
  const capabilities=await nativeCapabilities(settings.local_endpoint,uid,localToken(uid),signal);
  if(!capabilities.endpoints?.length)throw new Error('Odysseus nie ma skonfigurowanego lokalnego endpointu dla planu.');
  if(!settings.local_model)throw new Error('W ustawieniach AI połącz Odysseusa i wybierz jego model.');
  if(externalSelections.some(item=>item.subject===undefined))throw new Error('Poczekaj na wczytanie nazw przedmiotów dodatkowych grup.');
  const {token}=await personalRequest('context',{provider:'odysseus',session_id:sessionId,intent,selection:{faculty:scheduleName,groups:selectedGroups,
    ...(externalSelections.length?{external:externalSelections.map(item=>({...item,subject:item.subject||''}))}:{})}});
  if(auth?.currentUser?.uid!==uid)throw new Error('Konto zmieniło się. Spróbuj ponownie.');
  const odyToken=localToken(uid);
  const response=await fetch(nativeUrl(settings.local_endpoint,'api/schedule/chat'),{method:'POST',signal,redirect:'error',credentials:'include',headers:{'Content-Type':'application/json','X-Schedule-Context':token,...(odyToken?{Authorization:`Bearer ${odyToken}`}:{})},body:JSON.stringify({...body,groups:selectedGroups,intent,endpoint_id:settings.local_endpoint_id||'',model:settings.local_model,use_memory:settings.local_memory||false})});
  const data=await response.json();
  if(!response.ok||!data.ok)throw new Error(data.message||data.detail||'Lokalny agent nie odpowiedział.');
  return data;
}
