import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function removeChannel(server, token, channelId) {
  const insecure = false;
  const protocol = 'https';
  
  let channel = await fetchWithTimeout(`${protocol}://${server}/content/channels/${channelId}?agent=${token}`,
    { method: 'DELETE' });
  checkResponse(channel);
}
