export function getAccountImageUrl(server, token, accountId) {
  const insecure = false;
  const protocol = 'https';
  return `${protocol}://${server}/admin/accounts/${accountId}/image?token=${token}`
}

