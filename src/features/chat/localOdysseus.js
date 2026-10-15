// Native access token is kept only in memory, per Firebase account.
const tokens=new Map();
export function setLocalToken(uid,token){tokens.clear();if(uid&&token.trim())tokens.set(uid,token.trim());}
export function clearLocalTokens(){tokens.clear();}
export function localToken(uid){return tokens.get(uid)||'';}
export function nativeUrl(endpoint,path){
  const base=new URL(endpoint);base.pathname=base.pathname.replace(/\/$/,'')+'/';
  return new URL(path.replace(/^\//,''),base);
}
export async function nativeCapabilities(endpoint,uid,token=localToken(uid),signal){
  const response=await fetch(nativeUrl(endpoint,'api/schedule/capabilities'),{signal,redirect:'error',credentials:'include',headers:token?{Authorization:`Bearer ${token}`}:{}});
  const data=await response.json();
  if(!response.ok)throw new Error(response.status===401?'Zaloguj się do Odysseusa lub wpisz jego token z uprawnieniem chat.':data.detail||'Nie udało się połączyć z Odysseusem.');
  if(data.protocol!=='wieik-schedule-native-v1')throw new Error('Ten Odysseus nie ma jeszcze natywnej integracji planu.');
  return data;
}
