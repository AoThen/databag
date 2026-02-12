import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function removeContactChannelTopic(server, token, channelId, topicId) {
  const insecure = false;
  const protocol = 'https';

  let channel = await fetchWithTimeout(`${protocol}://${server}/content/channels/${channelId}/topics/${topicId}?contact=${token}`,
    { method: 'DELETE' });
  checkResponse(channel);
}
