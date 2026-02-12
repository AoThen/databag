import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function addCall(server, token, cardId) {
  const insecure = false;
  const protocol = 'https';
  let call = await fetchWithTimeout(`${protocol}://${server}/talk/calls?agent=${token}`, { method: 'POST', body: JSON.stringify(cardId)} );
  checkResponse(call);
  return await call.json();
}

