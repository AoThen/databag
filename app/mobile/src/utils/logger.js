import { __DEV__ } from 'react-native';

const SENSITIVE_PATTERNS = [
  /token[:\s]*[\w-]+/i,
  /password[:\s]*[\w@#$%^&*]+/i,
  /authorization[:\s]*(basic|bearer)[\s\S]{1,50}/i,
  /mfa[:\s]*[\d]{6}/i,
  /guid[:\s]*[\w-]+/i,
  /private[:\s]*key[:\s]*[\w-]+/i,
];

function redactSensitiveData(message) {
  if (typeof message !== 'string') {
    message = JSON.stringify(message);
  }
  let redacted = message;
  for (const pattern of SENSITIVE_PATTERNS) {
    redacted = redacted.replace(pattern, '[REDACTED]');
  }
  return redacted;
}

function createLogFunction(method) {
  return (...args) => {
    if (!__DEV__) {
      return;
    }
    const redactedArgs = args.map(arg => redactSensitiveData(arg));
    console[method](...redactedArgs);
  };
}

export const Logger = {
  log: createLogFunction('log'),
  info: createLogFunction('info'),
  warn: createLogFunction('warn'),
  error: createLogFunction('error'),
  debug: createLogFunction('debug'),
  secure: (...args) => {
    if (__DEV__) {
      console.log('[SECURE]', ...args.map(arg => redactSensitiveData(arg)));
    }
  },
};
