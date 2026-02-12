import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function addFlag(server, guid, channel, topic) {
  const insecure = false;
  const protocol = 'https';
  if (channel) {
    const param = topic ? `&topic=${topic}` : '';
    const flag = await fetchWithTimeout(`${protocol}://${server}/account/flag/${guid}?channel=${channel}${param}`, { method: 'POST' } );
    checkResponse(flag);
  }
  else {
    const flag = await fetchWithTimeout(`${protocol}://${server}/account/flag/${guid}`, { method: 'POST' } );
    checkResponse(flag);
  }
}

