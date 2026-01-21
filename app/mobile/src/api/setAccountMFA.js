import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function setAccountMFA(server, token, code) {
  const insecure = false;
  const protocol = 'https';

  const mfa = await fetchWithTimeout(`${protocol}://${server}/account/mfauth?agent=${token}&code=${code}`, { method: 'PUT' })
  checkResponse(mfa);
}

