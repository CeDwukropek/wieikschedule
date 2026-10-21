import { auth } from '../../lib/firebaseClient';
export async function personalRequest(path,body) {
  return authorizedRequest(`schedule/${path}`,body?'POST':'GET',body);
}
export async function authorizedRequest(path,method,body) {
  const user=auth?.currentUser;
  if(!user)throw new Error('Zaloguj się, aby zmienić prywatny plan.');
  const token=await user.getIdToken();
  if(auth.currentUser?.uid!==user.uid)throw new Error('Konto zmieniło się. Spróbuj ponownie.');
  const response=await fetch(`${process.env.REACT_APP_API_BASE_URL||''}/api/${path}`,{
    method,headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
    ...(body?{body:JSON.stringify(body)}:{})});
  const data=await response.json();
  if(auth.currentUser?.uid!==user.uid)throw new Error('Konto zmieniło się. Spróbuj ponownie.');
  if(!response.ok||!data.ok)throw Object.assign(new Error(data.message||'Nie udało się odczytać prywatnego planu.'),{code:data.error});
  return data;
}
