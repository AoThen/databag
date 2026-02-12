import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function getAccountStatus(server, token) {
  const insecure = false;
  const protocol = 'https';
  let status = await fetchWithTimeout(`${protocol}://${server}/account/status?agent=${token}`, { method: 'GET' });
  checkResponse(status);
  return await status.json()
}

