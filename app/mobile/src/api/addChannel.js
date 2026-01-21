import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function addChannel(server, token, type, data, cards ) {
  const insecure = false;
  const protocol = 'https';
  let params = { dataType: type, data: JSON.stringify(data), groups: [], cards };
  let channel = await fetchWithTimeout(`${protocol}://${server}/content/channels?agent=${token}`, { method: 'POST', body: JSON.stringify(params)} );
  checkResponse(channel);
  return await channel.json();
}

