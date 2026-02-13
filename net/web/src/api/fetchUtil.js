const TIMEOUT = 15000;

//await new Promise(r => setTimeout(r, 2000));

export function createWebsocket(url) {
  return new WebSocket(url);
}

export function checkResponse(response) {
  if(response.status >= 400 && response.status < 600) {
    throw new Error(response.status);
  }
}

export async function fetchWithTimeout(url, options) {
  const fullUrl = url.startsWith('http') ? url : window.location.origin + url;
  return Promise.race([
    fetch(fullUrl, options).catch(err => { throw new Error(fullUrl + ' failed'); }),
    new Promise((_, reject) => setTimeout(() => reject(new Error(url + ' timeout')), TIMEOUT))
  ]);
}

export async function fetchWithCustomTimeout(url, options, timeout) {
  const fullUrl = url.startsWith('http') ? url : window.location.origin + url;
  return Promise.race([
    fetch(fullUrl, options).catch(err => { throw new Error(fullUrl + ' failed'); }),
    new Promise((_, reject) => setTimeout(() => reject(new Error(url + ' timeout')), timeout))
  ]);
}

