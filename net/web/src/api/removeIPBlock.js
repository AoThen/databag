import { fetchWithTimeout, checkResponse } from './fetchUtil';

export async function removeIPBlock(token, ip) {
  const response = await fetchWithTimeout(`/admin/blocks/${ip}?token=${token}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  checkResponse(response);
}
