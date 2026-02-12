import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function addCard(server, token, message) {
  const insecure = false;
  const protocol = 'https';
  let card = await fetchWithTimeout(`${protocol}://${server}/contact/cards?agent=${token}`, { method: 'POST', body: JSON.stringify(message)} );
  checkResponse(card);
  return await card.json();
}

