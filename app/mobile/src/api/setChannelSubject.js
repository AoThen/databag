import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function setChannelSubject(server, token, channelId, dataType, data ) {
  const insecure = false;
  const protocol = 'https';

  let params = { dataType, data: JSON.stringify(data) };
  let channel = await fetchWithTimeout(`${protocol}://${server}/content/channels/${channelId}/subject?agent=${token}`, { method: 'PUT', body: JSON.stringify(params)} );
  checkResponse(channel);
  return await channel.json();
}
