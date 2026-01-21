import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function getListingMessage(server, guid) {
  const insecure = false;
  const protocol = 'https';

  let listing = await fetchWithTimeout(`${protocol}://${server}/account/listing/${guid}/message`, { method: 'GET' });
  checkResponse(listing);
  return await listing.json();
}

