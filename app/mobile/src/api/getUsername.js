import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function getUsername(name, server, token) {
  const insecure = false;
  const protocol = 'https';

  let query = "";
  if (token && name) {
    query = `?name=${encodeURIComponent(name)}&token=${token}`;
  }
  else if (!token && name) {
    query = `?name=${encodeURIComponent(name)}`
  }
  else if (token && !name) {
    query = `?token=${token}`;
  }
    
  let available = await fetchWithTimeout(`${protocol}://${server}/account/username${query}`, { method: 'GET' })
  checkResponse(available)
  return await available.json()
}

