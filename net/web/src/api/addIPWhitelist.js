import { fetchWithTimeout, checkResponse } from './fetchUtil';

export async function addIPWhitelist(token, ip, note) {
  const params = new URLSearchParams({ token, note });
  const response = await fetchWithTimeout(`/admin/whitelist/${ip}?${params}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  checkResponse(response);
}
