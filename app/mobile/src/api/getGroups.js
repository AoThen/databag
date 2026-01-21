import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function getGroups(server, token, revision) {
  const insecure = false;
  const protocol = 'https';

  let param = "agent=" + token
  if (revision != null) {
    param += '&revision=' + revision
  }
  let groups = await fetchWithTimeout(`${protocol}://server/alias/groups?${param}`, { method: 'GET' });
  checkResponse(groups)
  return await groups.json()
}


