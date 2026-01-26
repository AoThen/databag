import { fetchWithTimeout, checkResponse } from './fetchUtil';

export async function getIPWhitelist(token) {
  const response = await fetchWithTimeout(`/admin/whitelist?token=${token}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  checkResponse(response);
  return response.json();
}
