import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function setNodeConfig(server, token, config) {
  const insecure = false;
  const protocol = 'https';

  let body = JSON.stringify(config);
  let settings = await fetchWithTimeout(`${protocol}://${server}/admin/config?token=${token}`, { method: 'PUT', body });
  checkResponse(settings);
}

