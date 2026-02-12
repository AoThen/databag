import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function getChannelNotifications(server, token, channelId) {
  const insecure = false;
  const protocol = 'https';
  const notify = await fetchWithTimeout(`${protocol}://${server}/content/channels/${channelId}/notification?agent=${token}`, { method: 'GET' });
  checkResponse(notify)
  return await notify.json()
}

