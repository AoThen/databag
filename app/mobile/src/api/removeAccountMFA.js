import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function removeAccountMFA(server, token) {
  const insecure = false;
  const protocol = 'https';

  const mfa = await fetchWithTimeout(`${protocol}://${server}/account/mfauth?agent=${token}`, { method: 'DELETE' });
  checkResponse(mfa);
}

