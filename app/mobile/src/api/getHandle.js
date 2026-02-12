import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function getHandle(server, token, name) {
  const insecure = false;
  const protocol = 'https';

  let available = await fetchWithTimeout(`${protocol}://${server}/account/username?agent=${token}&name=${encodeURIComponent(name)}`, { method: 'GET' })
  checkResponse(available)
  return await available.json()
}

