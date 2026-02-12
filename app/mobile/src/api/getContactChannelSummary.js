import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function getContactChannelSummary(server, token, channelId) {
  const insecure = false;
  const protocol = 'https';
  let host = "";
  if (server) {
    host = `${protocol}://${server}`;
  }
  let summary = await fetchWithTimeout(`${host}/content/channels/${channelId}/summary?contact=${token}`, { method: 'GET' });
  checkResponse(summary)
  return await summary.json()
}

