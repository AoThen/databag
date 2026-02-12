import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function setAdminMFAuth(server, token, code) {
  const insecure = false;
  const protocol = 'https';

  const mfa = await fetchWithTimeout(`${protocol}://${server}/admin/mfauth?token=${token}&code=${code}`, { method: 'PUT' })
  checkResponse(mfa);
}

