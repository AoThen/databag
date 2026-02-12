import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function setNodeStatus(server, token) {
  const insecure = false;
  const protocol = 'https';

  let status = await fetchWithTimeout(`${protocol}://${server}/admin/status?token=${token}`, { method: 'PUT' });
  checkResponse(status);
}

