export const VALIDATION = {
  USERNAME: {
    minLength: 3,
    maxLength: 32,
    pattern: /^[a-zA-Z0-9_]+$/,
    message: 'Username must be 3-32 characters and contain only letters, numbers, and underscores'
  },
  PASSWORD: {
    minLength: 8,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    message: 'Password must be 8-128 characters with uppercase, lowercase, number, and special character'
  },
  SERVER: {
    maxLength: 253,
    pattern: /^(?=.{1,253}$)((?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,63}$|^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:){1,7}:$|^([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}$|^([0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}$|^([0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}$|^([0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}$|^[0-9a-fA-F]{1,4}:(?::[0-9a-fA-F]{1,4}){1,6}$|^:(?::[0-9a-fA-F]{1,4}){1,7}$|^::$/,
    message: 'Invalid server address format'
  },
  MFA_CODE: {
    pattern: /^[0-9]{6}$/,
    message: 'MFA code must be 6 digits'
  }
};

export function validateInput(value, type) {
  if (value == null || value === undefined) {
    return { valid: false, message: 'Input is required' };
  }

  const strValue = String(value).trim();
  const config = VALIDATION[type];

  if (!config) {
    return { valid: true, value: strValue };
  }

  if (config.minLength && strValue.length < config.minLength) {
    return { valid: false, message: `Must be at least ${config.minLength} characters` };
  }

  if (config.maxLength && strValue.length > config.maxLength) {
    return { valid: false, message: `Must be at most ${config.maxLength} characters` };
  }

  if (config.pattern && !config.pattern.test(strValue)) {
    return { valid: false, message: config.message };
  }

  return { valid: true, value: strValue };
}

export function validateUsername(username) {
  return validateInput(username, 'USERNAME');
}

export function validatePassword(password) {
  return validateInput(password, 'PASSWORD');
}

export function validateServer(server) {
  return validateInput(server, 'SERVER');
}

export function validateMFACode(code) {
  return validateInput(code, 'MFA_CODE');
}

export function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return input;
  }
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}
