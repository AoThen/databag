import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function setCardOpenMessage(server, message) {
  const insecure = false;
  const protocol = 'https';

  let status = await fetchWithTimeout(`${protocol}://${server}/contact/openMessage`, { method: 'PUT', body: JSON.stringify(message) });
  checkResponse(status);
  return await status.json();
}

