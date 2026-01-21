import { Logger } from '../utils/logger';
import { getSecureProtocol, getSecureWebSocketProtocol, isPrivateIP } from '../utils/networkUtil';

const TIMEOUT = 15000;

export function createAPIUrl(server, path, token, params) {
  const protocol = getSecureProtocol(server);
  const separator = server.includes('?') ? '&' : '?';
  let url = `${protocol}://${server}${path}`;

  const queryParams = [];
  if (token) queryParams.push(`token=${token}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.push(`${key}=${encodeURIComponent(value)}`);
      }
    });
  }

  if (queryParams.length > 0) {
    url += `${separator}${queryParams.join('&')}`;
  }

  return url;
}

export function createWebsocketUrl(server, path, token, params) {
  const protocol = getSecureWebSocketProtocol(server);
  const separator = path.includes('?') ? '&' : '?';
  let url = `${protocol}://${server}${path}`;

  const queryParams = [];
  if (token) queryParams.push(`token=${token}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.push(`${key}=${encodeURIComponent(value)}`);
      }
    });
  }

  if (queryParams.length > 0) {
    url += `${separator}${queryParams.join('&')}`;
  }

  return url;
}

export function createWebsocket(url) {
  if (url.startsWith('ws://')) {
    Logger.warn('Insecure WebSocket connection detected, upgrading to wss://');
    url = 'wss://' + url.substring(5);
  }
  return new WebSocket(url);
}

export function checkResponse(response) {
  if(response.status >= 400 && response.status < 600) {
    Logger.warn(`Request failed [${response?.status}]`);
    throw new Error(response.status);
  }
}

export async function fetchWithTimeout(url, options) {
  return Promise.race([
    fetch(url, options).catch(err => { throw new Error(url + ' failed'); }),
    new Promise((_, reject) => setTimeout(() => reject(new Error(url + ' timeout')), TIMEOUT))
  ]);
}

export async function fetchWithCustomTimeout(url, options, timeout) {
  return Promise.race([
    fetch(url, options).catch(err => { throw new Error(url + ' failed'); }),
    new Promise((_, reject) => setTimeout(() => reject(new Error(url + ' timeout')), timeout))
  ]);
}

