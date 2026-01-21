import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function removeCall(server, token, callId) {
  const insecure = false;
  const protocol = 'https';

  let call = await fetchWithTimeout(`${protocol}://${server}/talk/calls/${callId}?agent=${token}`, { method: 'DELETE' });
  checkResponse(call)
}

