import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function getProfile(server, token) {
  const insecure = false;
  const protocol = 'https';

  let profile = await fetchWithTimeout(`${protocol}://${server}/profile?agent=${token}`, { method: 'GET' });
  checkResponse(profile)
  return await profile.json()
}


