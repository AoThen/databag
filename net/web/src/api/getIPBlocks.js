import { fetchWithTimeout, checkResponse } from './fetchUtil';

export async function getIPBlocks(token) {
  const response = await fetchWithTimeout(`/admin/blocks?token=${token}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  checkResponse(response);
  return response.json();
}
