import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function getChannelTopic(server, token, channelId, topicId) {
  const insecure = false;
  const protocol = 'https';
  let topic = await fetchWithTimeout(`${protocol}://${server}/content/channels/${channelId}/topics/${topicId}/detail?agent=${token}`, 
    { method: 'GET' });
  checkResponse(topic)
  return await topic.json()
}

