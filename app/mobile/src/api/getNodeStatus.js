import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function getNodeStatus(server) {
  const insecure = false;
  const protocol = 'https';

  let status = await fetchWithTimeout(`${protocol}://${server}/admin/status`, { method: 'GET' });
  checkResponse(status);
  return await status.json();
}

