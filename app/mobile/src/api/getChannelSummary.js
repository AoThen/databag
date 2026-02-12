import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function getChannelSummary(server, token, channelId) {
  const insecure = false;
  const protocol = 'https';
  let summary = await fetchWithTimeout(`${protocol}://${server}/content/channels/${channelId}/summary?agent=${token}`, { method: 'GET' });
  checkResponse(summary)
  return await summary.json()
}

