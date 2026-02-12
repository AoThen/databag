import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function removeAccount(server, token, accountId) {
  const insecure = false;
  const protocol = 'https';

  let res = await fetchWithTimeout(`${protocol}://${server}/admin/accounts/${accountId}?token=${token}`, { method: 'DELETE' })
  checkResponse(res);
}

