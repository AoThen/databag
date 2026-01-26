import { fetchWithTimeout, checkResponse } from './fetchUtil';

export async function addIPBlock(token, ip, reason, duration) {
  const params = new URLSearchParams({ token, reason, duration: duration.toString() });
  const response = await fetchWithTimeout(`/admin/blocks/${ip}?${params}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  checkResponse(response);
}
