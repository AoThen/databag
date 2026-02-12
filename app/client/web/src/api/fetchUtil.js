const TIMEOUT = 15000;

export function createWebsocket(url) {
  return new WebSocket(url);
}

export function checkResponse(response) {
  if (response.status >= 400 && response.status < 600) {
    throw new Error(String(response.status));
  }
}

export async function fetchWithTimeout(url, options) {
  try {
    const response = await fetch(url, options);
    return response;
  } catch (err) {
    throw new Error(String(url) + ' failed');
  }
}

export async function fetchWithCustomTimeout(url, options, timeout) {
  try {
    const response = await fetch(url, options);
    return response;
  } catch (err) {
    throw new Error(String(url) + ' failed');
  }
}
