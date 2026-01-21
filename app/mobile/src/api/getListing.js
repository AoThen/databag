import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function getListing(server, filter) {
  const insecure = false;
  const protocol = 'https';

  const param = filter ? `?filter=${filter}` : '';
  let listing = await fetchWithTimeout(`${protocol}://${server}/account/listing${param}`, { method: 'GET' });
  checkResponse(listing);
  return await listing.json();
}

