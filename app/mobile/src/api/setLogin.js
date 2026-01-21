import { checkResponse, fetchWithTimeout, createAPIUrl } from './fetchUtil';
import base64 from 'react-native-base64'
import { validateUsername, validatePassword } from '../utils/validation'

export async function setLogin(username, server, password, code, appName, appVersion, platform, deviceToken, pushType, notifications) {
  const usernameValidation = validateUsername(username);
  if (!usernameValidation.valid) {
    throw new Error('Invalid username');
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    throw new Error('Invalid password');
  }

  const mfa = code ? `&code=${code}` : '';

  let headers = new Headers()
  headers.append('Authorization', 'Basic ' + base64.encode(usernameValidation.value + ":" + passwordValidation.value));
  const url = createAPIUrl(server, '/account/apps', null, {
    appName,
    appVersion,
    platform,
    deviceToken,
    pushType
  });
  let login = await fetchWithTimeout(`${url}${mfa}`, { method: 'POST', body: JSON.stringify(notifications), headers: headers })
  checkResponse(login)
  return await login.json()
}
