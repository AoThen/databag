import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function getContactChannelDetail(server, token, channelId) {
  const insecure = false;
  const protocol = 'https';
  let host = "";
  if (server) {
    host = `${protocol}://${server}`;
  }
  let detail = await fetchWithTimeout(`${host}/content/channels/${channelId}/detail?contact=${token}`, { method: 'GET' });
  checkResponse(detail)
  return await detail.json()
}

