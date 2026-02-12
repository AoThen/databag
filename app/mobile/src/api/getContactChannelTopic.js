import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function getContactChannelTopic(server, token, channelId, topicId) {
  const insecure = false;
  const protocol = 'https';
  let topic = await fetchWithTimeout(`${protocol}://${server}/content/channels/${channelId}/topics/${topicId}/detail?contact=${token}`, 
    { method: 'GET' });
  checkResponse(topic)
  return await topic.json()
}

