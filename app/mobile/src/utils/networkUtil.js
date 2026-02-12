const IPV4_REGEX = /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|:\d+$|$)){4}$/;

const IPV6_REGEX = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^(?:[0-9a-fA-F]{1,4}:){1,7}:$|^(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}$|^(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}$|^(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}$|^(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}$|^(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}$|^[0-9a-fA-F]{1,4}:(?::[0-9a-fA-F]{1,4}){1,6}$|^:(?::[0-9a-fA-F]{1,4}){1,7}$|^::$/;

export function isPrivateIP(host) {
  if (!host || typeof host !== 'string') {
    return false;
  }

  const hostWithoutPort = host.split(':')[0];

  if (IPV4_REGEX.test(hostWithoutPort)) {
    const parts = hostWithoutPort.split('.');
    const first = parseInt(parts[0], 10);
    const second = parseInt(parts[1], 10);

    if (first === 10) return true;
    if (first === 172 && second >= 16 && second <= 31) return true;
    if (first === 192 && second === 168) return true;
    if (first === 127) return true;
    if (first === 0) return true;
  }

  if (IPV6_REGEX.test(hostWithoutPort)) {
    if (hostWithoutPort === '::1' || hostWithoutPort === '::') {
      return true;
    }
    if (hostWithoutPort.startsWith('fe80:') ||
        hostWithoutPort.startsWith('fc00:') ||
        hostWithoutPort.startsWith('fdff:')) {
      return true;
    }
  }

  return false;
}

export function getSecureProtocol(host) {
  return 'https';
}

export function getSecureWebSocketProtocol(host) {
  return 'wss';
}
