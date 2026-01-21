import { checkResponse, fetchWithTimeout, createAPIUrl } from './fetchUtil';
import base64 from 'react-native-base64'

export async function clearLogin(server, token) {
  const url = createAPIUrl(server, '/account/apps', token);
  let logout = await fetchWithTimeout(url, { method: 'DELETE' })
  checkResponse(logout)
}
