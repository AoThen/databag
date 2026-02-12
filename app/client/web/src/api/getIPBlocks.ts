import { fetchWithTimeout } from './fetchUtil.js';

export interface IPBlock {
  ip: string;
  reason: string;
  blockedAt: number;
  expiresAt: number;
}

export interface GetIPBlocksResponse {
  blocks: IPBlock[];
}

export async function getIPBlocks(token: string): Promise<GetIPBlocksResponse> {
  const response = await fetchWithTimeout(`/admin/blocks?token=${token}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}
