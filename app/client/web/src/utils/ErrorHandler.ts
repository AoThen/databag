export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
}

export enum ErrorCategory {
  NETWORK = 'network',
  AUTH = 'auth',
  PERMISSION = 'permission',
  SERVER = 'server',
  UNKNOWN = 'unknown',
}

export interface AppError {
  message: string
  category: ErrorCategory
  severity: ErrorSeverity
  context?: {
    component?: string
    action?: string
    topicId?: string
    [key: string]: unknown
  }
  timestamp: number
}

export class ErrorHandler {
  private static instance: ErrorHandler
  private errors: AppError[] = []
  private maxErrors: number = 100
  private isDevelopment: boolean

  private constructor() {
    this.errors = []
    this.isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development'
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  handle(err: unknown, context: AppError['context'] = {}): AppError {
    const error = this.classifyError(err, context)

    this.errors.push(error)

    if (this.errors.length > this.maxErrors) {
      this.errors.shift()
    }

    this.logError(error)

    return error
  }

  private classifyError(err: unknown, context: AppError['context']): AppError {
    const message = this.extractMessage(err)
    const category = this.determineCategory(message)
    const severity = this.determineSeverity(category, message)

    return {
      message,
      category,
      severity,
      context,
      timestamp: Date.now(),
    }
  }

  private extractMessage(err: unknown): string {
    if (typeof err === 'string') return err
    if (err instanceof Error) return err.message
    if (err && typeof err === 'object') {
      const obj = err as { message?: string; error?: string }
      return obj.message || obj.error || String(err)
    }
    return 'Unknown error'
  }

  private determineCategory(message: string): ErrorCategory {
    const lowerMessage = message.toLowerCase()

    if (message === '401' || message === '403') {
      return ErrorCategory.AUTH
    }

    if (lowerMessage.includes('disconnected') ||
        lowerMessage.includes('timeout') ||
        lowerMessage.includes('failed')) {
      return ErrorCategory.NETWORK
    }

    if (['500', '502', '503', '504'].some(code => message.includes(code))) {
      return ErrorCategory.SERVER
    }

    return ErrorCategory.UNKNOWN
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private determineSeverity(category: ErrorCategory, _message: string): ErrorSeverity {
    if (category === ErrorCategory.NETWORK || category === ErrorCategory.AUTH) {
      return ErrorSeverity.WARNING
    }

    if (category === ErrorCategory.SERVER) {
      return ErrorSeverity.ERROR
    }

    return ErrorSeverity.INFO
  }

  private logError(error: AppError): void {
    const prefix = `[${error.category.toUpperCase()}]`
    const context = error.context ? ` (${error.context.component || error.context.action || 'unknown'})` : ''
    const time = new Date(error.timestamp).toISOString()

    const logMessage = `${prefix}${context} [${time}] ${error.message}`

    if (error.severity === ErrorSeverity.ERROR) {
      console.error(logMessage)
    } else if (error.severity === ErrorSeverity.WARNING) {
      console.warn(logMessage)
    } else {
      console.log(logMessage)
    }

    if (this.isDevelopment && error.severity !== ErrorSeverity.INFO) {
      console.debug('Error context:', error.context)
    }
  }

  getRecentErrors(count: number = 10): AppError[] {
    return this.errors.slice(-count)
  }

  getErrorStats(): { total: number; byCategory: Record<string, number>; bySeverity: Record<string, number> } {
    const byCategory: Record<string, number> = {}
    const bySeverity: Record<string, number> = {}

    this.errors.forEach(err => {
      byCategory[err.category] = (byCategory[err.category] || 0) + 1
      bySeverity[err.severity] = (bySeverity[err.severity] || 0) + 1
    })

    return {
      total: this.errors.length,
      byCategory,
      bySeverity,
    }
  }

  shouldAlert(category?: ErrorCategory, threshold: number = 5, window: number = 60000): boolean {
    const now = Date.now()
    const recentErrors = this.errors.filter(err => 
      err.timestamp > now - window && (!category || err.category === category)
    )
    return recentErrors.length >= threshold
  }

  clear(): void {
    this.errors = []
  }
}
