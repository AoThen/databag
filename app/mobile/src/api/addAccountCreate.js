import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function addAccountCreate(server, token) {
  const insecure = false;
  const protocol = 'https';
  let access = await fetchWithTimeout(`${protocol}://${server}/admin/accounts?token=${token}`, { method: 'POST' })
  checkResponse(access);
  return await access.json()
}

