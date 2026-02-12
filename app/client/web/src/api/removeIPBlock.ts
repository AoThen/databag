import { fetchWithTimeout } from './fetchUtil.js';

export async function removeIPBlock(token: string, ip: string): Promise<void> {
  const response = await fetchWithTimeout(`/admin/blocks/${ip}?token=${token}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
}
