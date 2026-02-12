import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function setNodeAccess(server, token, code) {
  const insecure = false;
  const protocol = 'https';
  const mfa = code ? `&code=${code}` : '';

  const access = await fetchWithTimeout(`${protocol}://${server}/admin/access?token=${encodeURIComponent(token)}${mfa}`, { method: 'PUT' });
  checkResponse(access);
  return access.json()
}

