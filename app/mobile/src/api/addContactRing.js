import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function addContactRing(server, token, call) {
  const insecure = false;
  const protocol = 'https';
  let ring = await fetchWithTimeout(`${protocol}://${server}/talk/rings?contact=${token}`, { method: 'POST', body: JSON.stringify(call) });
  checkResponse(ring);
}

