export function getProfileImageUrl(server, token, revision) {
  const insecure = false;
  const protocol = 'https';

  return `${protocol}://${server}/profile/image?agent=${token}&revision=${revision}`;
}

