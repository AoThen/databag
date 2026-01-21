import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function removeChannelTopic(server, token, channelId, topicId) {
  const insecure = false;
  const protocol = 'https';
  
  let channel = await fetchWithTimeout(`${protocol}://${server}/content/channels/${channelId}/topics/${topicId}?agent=${token}`,
    { method: 'DELETE' });
  checkResponse(channel);
}
