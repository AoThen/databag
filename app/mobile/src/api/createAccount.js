import { checkResponse, fetchWithTimeout } from './fetchUtil';
import base64 from 'react-native-base64'

export async function createAccount(username, password) {
  const insecure = false;
  const protocol = 'https';
  let headers = new Headers()
  headers.append('Credentials', 'Basic ' + base64.encode(username + ":" + password));
  let profile = await fetchWithTimeout("/account/profile", { method: 'POST', headers: headers })
  checkResponse(profile);
  return await profile.json()
}

