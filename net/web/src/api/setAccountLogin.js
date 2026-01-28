import { checkResponse, fetchWithTimeout } from './fetchUtil';
var base64 = require('base-64');

export async function setAccountLogin(token, username, password) {
  let headers = new Headers()
  // 使用标准的 Authorization 头传输基本认证信息
  headers.append('Authorization', 'Basic ' + base64.encode(username + ":" + password));
  let res = await fetchWithTimeout(`/account/login?agent=${token}`, { method: 'PUT', headers })
  checkResponse(res);
}
