import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function addAccountMFA(server, token) {
  const insecure = false;
  const protocol = 'https';

  const mfa = await fetchWithTimeout(`${protocol}://${server}/account/mfauth?agent=${token}`, { method: 'POST' })
  checkResponse(mfa);
  return mfa.json();
}

