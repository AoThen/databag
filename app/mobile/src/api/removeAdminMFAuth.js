import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function removeAdminMFAuth(server, token) {
  const insecure = false;
  const protocol = 'https';

  const mfa = await fetchWithTimeout(`${protocol}://${server}/admin/mfauth?token=${token}`, { method: 'DELETE' })
  checkResponse(mfa);
}

