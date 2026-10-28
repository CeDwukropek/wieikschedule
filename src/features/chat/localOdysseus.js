// The Odysseus access token is kept in memory per Firebase account and, when the person chooses so,
// also on this device (localStorage, per account), so it survives a reload. It never reaches our API.
const tokens=new Map();
const storageKey=uid=>`wieikschedule.${uid}.odysseusToken`;
function storedToken(uid){try{return uid?localStorage.getItem(storageKey(uid))||'':'';}catch{return '';}}
export function setLocalToken(uid,token,{remember}={}){
  tokens.clear();
  const value=String(token||'').trim();
  if(uid&&value)tokens.set(uid,value);
  if(!uid||remember===undefined)return;
  try{if(remember&&value)localStorage.setItem(storageKey(uid),value);else localStorage.removeItem(storageKey(uid));}catch{/* memory only */}
}
export function clearLocalTokens(){tokens.clear();}
export function localToken(uid){return tokens.get(uid)||storedToken(uid);}
export const isTokenRemembered=uid=>Boolean(storedToken(uid));
export function nativeUrl(endpoint,path){
  const base=new URL(endpoint);base.pathname=base.pathname.replace(/\/$/,'')+'/';
  return new URL(path.replace(/^\//,''),base);
}
export async function nativeCapabilities(endpoint,uid,token=localToken(uid),signal){
  let url;
  try{url=nativeUrl(endpoint,'api/schedule/capabilities');}catch{throw new Error('Wpisz pełny adres Odysseusa, np. https://twoj-serwer:8444.');}
  let response;
  try{response=await fetch(url,{signal,redirect:'error',credentials:'include',headers:token?{Authorization:`Bearer ${token}`}:{}});}
  catch(error){
    if(error?.name==='AbortError')throw error;
    // The browser hides the reason (offline host, certificate, CORS); name the usual causes instead.
    throw new Error('Brak odpowiedzi z tego adresu. Sprawdź adres i HTTPS oraz czy Odysseus zezwala na połączenia z tej strony (ALLOWED_ORIGINS).');
  }
  const data=await response.json().catch(()=>({}));
  if(response.status===401)throw new Error(token
    ?'Odysseus odrzucił token. Sprawdź, czy jest aktualny i ma uprawnienie chat.'
    :'Odysseus wymaga logowania. Wpisz token dostępu albo zaloguj się do Odysseusa w tej przeglądarce.');
  if(!response.ok)throw new Error(data.detail||`Odysseus odpowiedział błędem (${response.status}).`);
  if(data.protocol!=='wieik-schedule-native-v1')throw new Error('Ten Odysseus nie ma jeszcze natywnej integracji planu.');
  return data;
}
