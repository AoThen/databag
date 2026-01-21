import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function setAccountNotifications(server, token, flag) {
  const insecure = false;
  const protocol = 'https';

  let res = await fetchWithTimeout(`${protocol}://${server}/account/notification?agent=${token}`, { method: 'PUT', body: JSON.stringify(flag) })
  checkResponse(res);
}

