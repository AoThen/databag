import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function removeContactChannel(server, token, channelId) {
  const insecure = false;
  const protocol = 'https';

  let channel = await fetchWithTimeout(`${protocol}://${server}/content/channels/${channelId}?contact=${token}`,
    { method: 'DELETE' });
  checkResponse(channel);
}
