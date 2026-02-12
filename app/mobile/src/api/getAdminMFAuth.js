import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function getAdminMFAuth(server, token) {
  const insecure = false;
  const protocol = 'https';

  const mfa = await fetchWithTimeout(`${protocol}://${server}/admin/mfauth?token=${encodeURIComponent(token)}`, { method: 'GET' });
  checkResponse(mfa);
  return await mfa.json();
}

