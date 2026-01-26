import { fetchWithTimeout, checkResponse } from './fetchUtil';

export async function removeIPWhitelist(token, ip) {
  const response = await fetchWithTimeout(`/admin/whitelist/${ip}?token=${token}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  checkResponse(response);
}
