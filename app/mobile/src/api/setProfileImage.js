import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function setProfileImage(server, token, image) {
  const insecure = false;
  const protocol = 'https';

  let profile = await fetchWithTimeout(`${protocol}://${server}/profile/image?agent=${token}`, { method: 'PUT', body: JSON.stringify(image) });
  checkResponse(profile)
  return await profile.json()
}

