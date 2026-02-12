import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function getCardDetail(server, token, cardId) {
  const insecure = false;
  const protocol = 'https';
  let param = "?agent=" + token
  let detail = await fetchWithTimeout(`${protocol}://${server}/contact/cards/${cardId}/detail${param}`, { method: 'GET' });
  checkResponse(detail);
  return await detail.json()
}

