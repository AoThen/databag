import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function getContactChannels(server, token, viewRevision, channelRevision) {
  const insecure = false;
  const protocol = 'https';

  let param = "?contact=" + token
  if (viewRevision != null) {
    param += `&viewRevision=${viewRevision}`;
  }
  if (channelRevision != null) {
    param += `&channelRevision=${channelRevision}`;
  }
  param += `&types=${encodeURIComponent(JSON.stringify(['sealed','superbasic']))}`;
  let channels = await fetchWithTimeout(`${protocol}://${server}/content/channels${param}`, { method: 'GET' });
  checkResponse(channels)
  return await channels.json()
}

