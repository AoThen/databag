import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function removeContactCall(server, token, callId) {
  const insecure = false;
  const protocol = 'https';

  const call = await fetchWithTimeout(`${protocol}://${server}/talk/calls/${callId}?contact=${token}`, { method: 'DELETE' });
  checkResponse(call);
}
