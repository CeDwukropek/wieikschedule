import { auth } from '../../lib/firebaseClient';
// Starostas' changes of classes for the whole group: read by everyone (guests without a token), written by starostas.
export async function groupChangesRequest(action, { method = 'GET', body, query } = {}) {
  const user = auth?.currentUser;
  if (!user && method !== 'GET') throw new Error('Zaloguj się, aby zmienić zajęcia dla grupy.');
  const headers = { 'Content-Type': 'application/json' };
  if (user) headers.Authorization = `Bearer ${await user.getIdToken()}`;
  const search = query ? `?${new URLSearchParams(query)}` : '';
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || ''}/api/schedule/${action}${search}`, {
    method, headers, ...(body ? { body: JSON.stringify(body) } : {}) });
  const data = await response.json().catch(() => ({}));
  if ((auth?.currentUser?.uid || null) !== (user?.uid || null)) throw new Error('Konto zmieniło się. Spróbuj ponownie.');
  if (!response.ok || !data.ok) throw Object.assign(new Error(data.message || 'Zmiany grupy są chwilowo niedostępne.'), { code: data.error });
  return data;
}
