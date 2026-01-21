import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function getNodeAccounts(server, token) {
  const insecure = false;
  const protocol = 'https';

  let accounts = await fetchWithTimeout(`${protocol}://${server}/admin/accounts?token=${token}`, { method: 'GET' });
  checkResponse(accounts);
  return await accounts.json();
}

