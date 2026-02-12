import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function setAccountStatus(server, token, accountId, disabled) {
  const insecure = false;
  const protocol = 'https';

  let res = await fetchWithTimeout(`${protocol}://${server}/admin/accounts/${accountId}/status?token=${token}`, { method: 'PUT', body: JSON.stringify(disabled) })
  checkResponse(res);
}

