import { checkResponse, fetchWithTimeout, createAPIUrl } from './fetchUtil';

export async function getAvailable(server) {
  const url = createAPIUrl(server, '/account/available', null);
  let available = await fetchWithTimeout(url, { method: 'GET' })
  checkResponse(available)
  return await available.json()
}

