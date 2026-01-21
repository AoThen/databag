export function getChannelTopicAssetUrl(server, token, channelId, topicId, assetId) {
  const insecure = false;
  const protocol = 'https';
  return `${protocol}://${server}/content/channels/${channelId}/topics/${topicId}/assets/${assetId}?agent=${token}`
}

