import {personalRequest} from '../my-plan/personalScheduleApi';
export async function sendScheduleAgentMessage({message,scheduleName,sessionId,history=[],signal}) {
  const {settings}=await personalRequest('ai-settings');
  const body={message,faculty:scheduleName,session_id:sessionId,history:history.slice(-16)};
  if(settings.provider==='n8n')return personalRequest('chat',body);
  if(!settings.local_endpoint)throw new Error('W menu zapisz adres lokalnego adaptera AI.');
  const {token}=await personalRequest('context',{provider:'odysseus',session_id:sessionId});
  const base=new URL(settings.local_endpoint);
  const capabilities=await fetch(new URL('/schedule/capabilities',base),{signal,redirect:'error'}).then(response=>response.json());
  if(capabilities.protocol!=='wieik-schedule-v1')throw new Error('Ten endpoint nie obsługuje narzędzi planu. Uruchom adapter schedule-tools.');
  const response=await fetch(new URL('/schedule/chat',base),{method:'POST',signal,redirect:'error',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify(body)});
  const data=await response.json();
  if(!response.ok||!data.ok)throw new Error(data.message||'Lokalny agent nie odpowiedział.');
  return data;
}
