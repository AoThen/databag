import CryptoJS from 'crypto-js';
import { getUniqueId, getApplicationName } from 'react-native-device-info';
import { Logger } from './logger';

const SESSION_ENCRYPTION_KEY = 'databag_session_v1';

function getEncryptionKey() {
  const deviceId = getUniqueId();
  const appName = getApplicationName() || 'databag';
  const combinedKey = `${SESSION_ENCRYPTION_KEY}_${deviceId}_${appName}`;
  return CryptoJS.SHA256(combinedKey).toString();
}

export function encryptSession(data) {
  if (!data) return null;
  try {
    const key = getEncryptionKey();
    const jsonStr = JSON.stringify(data);
    const iv = CryptoJS.lib.WordArray.random(128 / 8);
    const encrypted = CryptoJS.AES.encrypt(jsonStr, CryptoJS.enc.Hex.parse(key), {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return JSON.stringify({
      iv: iv.toString(CryptoJS.enc.Base64),
      ciphertext: encrypted.ciphertext.toString(CryptoJS.enc.Base64)
    });
  } catch (err) {
    Logger.error('Session encryption failed');
    return null;
  }
}

export function decryptSession(encryptedData) {
  if (!encryptedData) return null;
  try {
    const key = getEncryptionKey();
    const parsed = JSON.parse(encryptedData);
    const iv = CryptoJS.enc.Base64.parse(parsed.iv);
    const ciphertext = CryptoJS.enc.Base64.parse(parsed.ciphertext);
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: ciphertext,
      iv: iv
    });
    const decrypted = CryptoJS.AES.decrypt(cipherParams, CryptoJS.enc.Hex.parse(key), {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    const jsonStr = decrypted.toString(CryptoJS.enc.Utf8);
    return JSON.parse(jsonStr);
  } catch (err) {
    Logger.error('Session decryption failed');
    return null;
  }
}
