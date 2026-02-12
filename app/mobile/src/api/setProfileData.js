import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function setProfileData(server, token, name, location, description) {
  const insecure = false;
  const protocol = 'https';

  let data = { name: name, location: location, description: description };
  let profile = await fetchWithTimeout(`${protocol}://${server}/profile/data?agent=${token}`, { method: 'PUT', body: JSON.stringify(data) });
  checkResponse(profile)
  return await profile.json()
}

