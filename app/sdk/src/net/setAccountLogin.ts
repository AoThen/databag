import { checkResponse, fetchWithTimeout } from './fetchUtil';
import { encode } from './base64';

export async function setAccountLogin(node: string, secure: boolean, token: string, username: string, password: string) {
  const endpoint = `http${secure ? 's' : ''}://${node}/account/login?agent=${token}`;
  const auth = encode(`${username}:${password}`);
  const headers = new Headers();
  // 使用标准的 Authorization 头传输基本认证信息，以便后端统一处理
  headers.append('Authorization', `Basic ${auth}`);
  const { status } = await fetchWithTimeout(endpoint, {
    method: 'PUT',
    headers,
  });
  checkResponse(status);
}
