import { fetchWithTimeout } from './fetchUtil.js';

export async function addIPBlock(token: string, ip: string, reason: string, duration: number): Promise<void> {
  const params = new URLSearchParams({ token, reason, duration: duration.toString() });
  const response = await fetchWithTimeout(`/admin/blocks/${ip}?${params}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
}
