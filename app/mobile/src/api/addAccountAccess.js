import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function addAccountAccess(server, token, accountId) {
  const insecure = false;
  const protocol = 'https';
  let access = await fetchWithTimeout(`${protocol}://${server}/admin/accounts/${accountId}/auth?token=${token}`, { method: 'POST' })
  checkResponse(access);
  return await access.json()
}

