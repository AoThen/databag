import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function getCards(server, token, revision) {
  const insecure = false;
  const protocol = 'https';
  let param = "agent=" + token
  if (revision != null) {
    param += '&revision=' + revision
  }
  let cards = await fetchWithTimeout(`${protocol}://${server}/contact/cards?${param}`, { method: 'GET' });
  checkResponse(cards)
  return await cards.json()
}

