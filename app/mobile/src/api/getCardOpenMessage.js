import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function getCardOpenMessage(server, token, cardId) {
  const insecure = false;
  const protocol = 'https';
  let message = await fetchWithTimeout(`${protocol}://${server}/contact/cards/${cardId}/openMessage?agent=${token}`, { method: 'GET' });
  checkResponse(message);
  return await message.json();
}

