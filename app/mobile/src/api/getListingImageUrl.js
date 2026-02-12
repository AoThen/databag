export function getListingImageUrl(server, guid) {
  const insecure = false;
  const protocol = 'https';

  let host = "";
  if (server) {
    host = `${protocol}://${server}`;
  }

  return `${host}/account/listing/${guid}/image`
}


