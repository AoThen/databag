import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function clearChannelCard(server, token, channelId, cardId ) {
  const insecure = false;
  const protocol = 'https';
  let channel = await fetchWithTimeout(`${protocol}://${server}/content/channels/${channelId}/cards/${cardId}?agent=${token}`, {method: 'DELETE'});
  checkResponse(channel);
  return await channel.json();
}
