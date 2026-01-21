import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function getNodeConfig(server, token) {
  const insecure = false;
  const protocol = 'https';

  let config = await fetchWithTimeout(`${protocol}://${server}/admin/config?token=${token}`, { method: 'GET' });
  checkResponse(config);
  return await config.json();
}

