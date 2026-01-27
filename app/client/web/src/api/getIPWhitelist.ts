import { fetchWithTimeout } from './fetchUtil.js';

export interface IPWhitelist {
  ip: string;
  note: string;
  createdAt: number;
}

export interface GetIPWhitelistResponse {
  whitelist: IPWhitelist[];
}

export async function getIPWhitelist(token: string): Promise<GetIPWhitelistResponse> {
  const response = await fetchWithTimeout(`/admin/whitelist?token=${token}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}
