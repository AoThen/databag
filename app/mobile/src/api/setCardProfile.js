import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function setCardProfile(server, token, cardId, message) {
  const insecure = false;
  const protocol = 'https';

  let profile = await fetchWithTimeout(`${protocol}://${server}/contact/cards/${cardId}/profile?agent=${token}`, { method: 'PUT', body: JSON.stringify(message) });
  checkResponse(profile);
  return await profile.json()
}

