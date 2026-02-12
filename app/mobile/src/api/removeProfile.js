import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function removeProfile(server, token) {
  const insecure = false;
  const protocol = 'https';

  let profile = await fetchWithTimeout(`${protocol}://${server}/profile?agent=${token}`, { method: 'DELETE' });
  checkResponse(profile)
}

