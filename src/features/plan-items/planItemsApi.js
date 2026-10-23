import { auth } from '../../lib/firebaseClient';
// Group entries are public: guests read them without a token. Writes need a signed-in user.
export async function planItemsRequest(action,{method='GET',body,query}={}) {
  const user=auth?.currentUser;
  if(!user&&method!=='GET')throw new Error('Zaloguj się, aby zapisać.');
  const headers={'Content-Type':'application/json'};
  if(user)headers.Authorization=`Bearer ${await user.getIdToken()}`;
  const search=query?`?${new URLSearchParams(query)}`:'';
  const response=await fetch(`${process.env.REACT_APP_API_BASE_URL||''}/api/plan-items/${action}${search}`,{
    method,headers,...(body?{body:JSON.stringify(body)}:{})});
  const data=await response.json().catch(()=>({}));
  if((auth?.currentUser?.uid||null)!==(user?.uid||null))throw new Error('Konto zmieniło się. Spróbuj ponownie.');
  if(!response.ok||!data.ok)throw Object.assign(new Error(data.message||'Terminy są chwilowo niedostępne.'),{code:data.error});
  return data;
}
