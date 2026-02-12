import { Alert } from 'react-native';
import { ErrorHandler, ErrorSeverity, ErrorCategory, AppError } from './ErrorHandler';

const SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'key',
  'credential',
  'authorization',
  'cookie',
  'privateKey',
  'aesKey',
  'sealPassword',
];

function extractComponentName(filePath: string): string {
  const match = filePath.match(/src\/(\w+)\//);
  if (match) {
    return match[1];
  }
  return 'Unknown';
}

export class AppErrorHandler {
  private static instance: AppErrorHandler | null = null;
  private errorHandler: ErrorHandler;

  private constructor() {
    this.errorHandler = ErrorHandler.getInstance();
  }

  static getInstance(): AppErrorHandler {
    if (AppErrorHandler.instance === null) {
      AppErrorHandler.instance = new AppErrorHandler();
    }
    return AppErrorHandler.instance;
  }

  private sanitizeData(data: unknown): unknown {
    if (typeof data !== 'object' || data === null) {
      return data;
    }
    const sanitized = { ...data as object };
    for (const field of SENSITIVE_FIELDS) {
      if (field in sanitized) {
        sanitized[field] = '***REDACTED***';
      }
    }
    return sanitized;
  }

  handle(err: unknown, context: { component?: string; action?: string }): AppError {
    const sanitizedContext = this.sanitizeData(context);
    const appError = this.errorHandler.handle(err, sanitizedContext as { component?: string; action?: string });
    return appError;
  }

  handleWithAlert(
    err: unknown,
    context: { component?: string; action?: string },
    alertTitle?: string,
    alertMessage?: string
  ): void {
    const appError = this.handle(err, context);
    if (appError.severity === ErrorSeverity.ERROR || appError.severity === ErrorSeverity.WARNING) {
      Alert.alert(alertTitle || 'Error', alertMessage || this.getUserFriendlyMessage(appError));
    }
  }

  private getUserFriendlyMessage(error: AppError): string {
    const messages: Record<ErrorCategory, string> = {
      [ErrorCategory.NETWORK]: 'Network connection failed. Please check your internet connection.',
      [ErrorCategory.AUTH]: 'Authentication failed. Please check your credentials.',
      [ErrorCategory.PERMISSION]: 'Permission denied. Please check app permissions.',
      [ErrorCategory.SERVER]: 'Server error. Please try again later.',
      [ErrorCategory.UNKNOWN]: 'An unexpected error occurred. Please try again.',
    };
    return messages[error.category] || messages[ErrorCategory.UNKNOWN];
  }

  static async shutdown(): Promise<void> {
    AppErrorHandler.instance = null;
  }
}

export function handleAppError(err: unknown, action?: string): AppError {
  const context = action ? { action } : {};
  return AppErrorHandler.getInstance().handle(err, context);
}

export function handleAppErrorWithAlert(err: unknown, action?: string, title?: string, message?: string): void {
  const context = action ? { action } : {};
  AppErrorHandler.getInstance().handleWithAlert(err, context, title, message);
}
