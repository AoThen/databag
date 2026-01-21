import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function getContactProfile(server, token) {
  const insecure = false;
  const protocol = 'https';

  let profile = await fetchWithTimeout(`${protocol}://${server}/profile/message?contact=${token}`, { method: 'GET', });
  checkResponse(profile);
  return await profile.json()
}

