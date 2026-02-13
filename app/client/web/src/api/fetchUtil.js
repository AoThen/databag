export function createWebsocket(url) {
  return new WebSocket(url)
}

export function checkResponse(response) {
  if (response.status >= 400 && response.status < 600) {
    throw new Error(String(response.status))
  }
}

export async function fetchWithTimeout(url, options) {
  const response = await fetch(url, options)
  return response
}

export async function fetchWithCustomTimeout(url, options, _timeout) {
  const response = await fetch(url, options)
  return response
}
