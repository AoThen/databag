import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function getCard(server, token, cardId) {
  const insecure = false;
  const protocol = 'https';
  let param = "?agent=" + token
  let card = await fetchWithTimeout(`${protocol}://${server}/contact/cards/${cardId}${param}`, { method: 'GET' });
  checkResponse(card);
  return await card.json()
}

