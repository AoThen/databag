import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function setAccountSeal(server, token, seal) {
  const insecure = false;
  const protocol = 'https';

  let res = await fetchWithTimeout(`${protocol}://${server}/account/seal?agent=${token}`, { method: 'PUT', body: JSON.stringify(seal) })
  checkResponse(res);
}

