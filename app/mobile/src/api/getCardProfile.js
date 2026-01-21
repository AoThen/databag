import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function getCardProfile(server, token, cardId) {
  const insecure = false;
  const protocol = 'https';
  let profile = await fetchWithTimeout(`${protocol}://${server}/contact/cards/${cardId}/profile?agent=${token}`, { method: 'GET' });
  checkResponse(profile);
  return await profile.json()
}

