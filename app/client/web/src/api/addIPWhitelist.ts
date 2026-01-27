import { fetchWithTimeout } from './fetchUtil.js';

export async function addIPWhitelist(token: string, ip: string, note: string): Promise<void> {
  const params = new URLSearchParams({ token, note });
  const response = await fetchWithTimeout(`/admin/whitelist/${ip}?${params}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
}
