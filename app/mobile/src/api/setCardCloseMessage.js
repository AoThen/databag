import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function setCardCloseMessage(server, message) {
  const insecure = false;
  const protocol = 'https';

  let status = await fetchWithTimeout(`${protocol}://${server}/contact/closeMessage`, { method: 'PUT', body: JSON.stringify(message) });
  checkResponse(status);
  return await status.json();
}

