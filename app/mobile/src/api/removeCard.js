import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function removeCard(server, token, cardId) {
  const insecure = false;
  const protocol = 'https';

  let card = await fetchWithTimeout(`${protocol}://${server}/contact/cards/${cardId}?agent=${token}`, { method: 'DELETE' } );
  checkResponse(card);
  return await card.json();
}

