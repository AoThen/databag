import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function setContactChannelNotifications(server, token, channelId, flag) {
  const insecure = false;
  const protocol = 'https';

  const notify = await fetchWithTimeout(`${protocol}://${server}/content/channels/${channelId}/notification?contact=${token}`, { method: 'PUT', body: JSON.stringify(flag) });
  checkResponse(notify)
}

