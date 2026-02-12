export function getCardImageUrl(server, token, cardId, revision) {
  const insecure = false;
  const protocol = 'https';
  return `${protocol}://${server}/contact/cards/${cardId}/profile/image?agent=${token}&revision=${revision}`
}

