import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function setChannelTopicRead(node: string, secure: boolean, token: string, channelId: string, topicId: string): Promise<void> {
  const endpoint = `http${secure ? 's' : '' }://${node}/content/channels/${channelId}/topics/${topicId}/read?agent=${token}`;
  const response = await fetchWithTimeout(endpoint, { method: 'PUT', body: '' });
  checkResponse(response.status);
}

export async function getChannelTopicReads(node: string, secure: boolean, token: string, channelId: string, topicId: string): Promise<{ guid: string; readTime: number; name?: string; handle?: string; imageUrl?: string }[]> {
  const endpoint = `http${secure ? 's' : '' }://${node}/content/channels/${channelId}/topics/${topicId}/reads?agent=${token}`;
  const response = await fetchWithTimeout(endpoint, { method: 'GET' });
  checkResponse(response.status);
  const result = await response.json();
  return result.readBy || [];
}

export async function setContactChannelTopicRead(node: string, secure: boolean, token: string, channelId: string, topicId: string): Promise<void> {
  const endpoint = `http${secure ? 's' : '' }://${node}/content/channels/${channelId}/topics/${topicId}/read?contact=${token}`;
  const response = await fetchWithTimeout(endpoint, { method: 'PUT', body: '' });
  checkResponse(response.status);
}

export async function getContactChannelTopicReads(node: string, secure: boolean, token: string, channelId: string, topicId: string): Promise<{ guid: string; readTime: number; name?: string; handle?: string; imageUrl?: string }[]> {
  const endpoint = `http${secure ? 's' : '' }://${node}/content/channels/${channelId}/topics/${topicId}/reads?contact=${token}`;
  const response = await fetchWithTimeout(endpoint, { method: 'GET' });
  checkResponse(response.status);
  const result = await response.json();
  return result.readBy || [];
}
