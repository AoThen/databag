import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function getChannelDetail(server, token, channelId) {
  const insecure = false;
  const protocol = 'https';
  let detail = await fetchWithTimeout(`${protocol}://${server}/content/channels/${channelId}/detail?agent=${token}`, { method: 'GET' });
  checkResponse(detail)
  return await detail.json()
}

