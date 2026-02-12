import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function getChannels(server, token, revision) {
  const insecure = false;
  const protocol = 'https';
  let param = "?agent=" + token
  if (revision != null) {
    param += `&channelRevision=${revision}`
  }
  param += `&types=${encodeURIComponent(JSON.stringify(['sealed','superbasic']))}`;
  let channels = await fetchWithTimeout(`${protocol}://${server}/content/channels${param}`, { method: 'GET' });
  checkResponse(channels)
  let ret = await channels.json()
  return ret;
}

