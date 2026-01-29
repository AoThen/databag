import { fetchWithTimeout, checkResponse } from './fetchUtil.js';

export async function cleanupData(token, config) {
  let body = JSON.stringify(config);
  let result = await fetchWithTimeout(
    `/admin/cleanup?token=${encodeURIComponent(token)}`,
    { method: 'POST', body }
  );
  checkResponse(result);
  return await result.json();
}

export async function getCleanupStatus(token) {
  let result = await fetchWithTimeout(
    `/admin/cleanup/status?token=${encodeURIComponent(token)}`,
    { method: 'GET' }
  );
  checkResponse(result);
  return await result.json();
}

export async function getCleanupConfig(token) {
  let result = await fetchWithTimeout(
    `/admin/cleanup/config?token=${encodeURIComponent(token)}`,
    { method: 'GET' }
  );
  checkResponse(result);
  return await result.json();
}

export async function setCleanupConfig(token, config) {
  let body = JSON.stringify(config);
  let result = await fetchWithTimeout(
    `/admin/cleanup/config?token=${encodeURIComponent(token)}`,
    { method: 'PUT', body }
  );
  checkResponse(result);
  return await result.json();
}
