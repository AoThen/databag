export class ErrorCounter {
  private static instance: ErrorCounter
  private counts: Map<string, { count: number; lastError: number; windowStart: number }> = new Map()
  private defaultWindow: number
  private defaultThreshold: number
  private retrySchedule: Map<string, { nextRetry: number; attempts: number }> = new Map()

  private constructor(defaultThreshold: number = 5, defaultWindow: number = 60000) {
    this.defaultThreshold = defaultThreshold
    this.defaultWindow = defaultWindow
  }

  static getInstance(defaultThreshold: number = 5, defaultWindow: number = 60000): ErrorCounter {
    if (!ErrorCounter.instance) {
      ErrorCounter.instance = new ErrorCounter(defaultThreshold, defaultWindow)
    }
    return ErrorCounter.instance
  }

  record(errorType: string, threshold?: number, window?: number): boolean {
    const actualThreshold = threshold ?? this.defaultThreshold
    const actualWindow = window ?? this.defaultWindow
    const now = Date.now()

    const record = this.counts.get(errorType)

    if (!record) {
      this.counts.set(errorType, { count: 1, lastError: now, windowStart: now })
      return false
    }

    if (now - record.windowStart > actualWindow) {
      record.count = 1
      record.windowStart = now
      record.lastError = now
      return false
    }

    record.count++
    record.lastError = now

    return record.count >= actualThreshold
  }

  shouldRetry(errorType: string, topicId: string): boolean {
    const schedule = this.retrySchedule.get(`${errorType}:${topicId}`)
    const now = Date.now()

    if (!schedule) {
      this.retrySchedule.set(`${errorType}:${topicId}`, {
        nextRetry: now + 5000,
        attempts: 1
      })
      return true
    }

    if (now < schedule.nextRetry) {
      return false
    }

    const backoffTime = Math.min(5000 * Math.pow(2, schedule.attempts), 300000)
    schedule.nextRetry = now + backoffTime
    schedule.attempts++

    this.retrySchedule.set(`${errorType}:${topicId}`, schedule)
    return true
  }

  getNextRetryTime(errorType: string, topicId: string): number | null {
    const schedule = this.retrySchedule.get(`${errorType}:${topicId}`)
    return schedule ? schedule.nextRetry : null
  }

  clearRetrySchedule(errorType?: string, topicId?: string): void {
    if (errorType && topicId) {
      this.retrySchedule.delete(`${errorType}:${topicId}`)
    } else if (!errorType && !topicId) {
      this.retrySchedule.clear()
    }
  }

  getCount(errorType: string, window?: number): number {
    const actualWindow = window ?? this.defaultWindow
    const now = Date.now()
    const record = this.counts.get(errorType)

    if (!record || now - record.windowStart > actualWindow) {
      return 0
    }

    return record.count
  }

  shouldAlert(threshold?: number, window?: number): boolean {
    const actualThreshold = threshold ?? this.defaultThreshold
    const actualWindow = window ?? this.defaultWindow
    const now = Date.now()

    const recentCount = Array.from(this.counts.values()).reduce((sum, record) => {
      if (now - record.windowStart <= actualWindow) {
        return sum + record.count
      }
      return sum
    }, 0)

    return recentCount >= actualThreshold
  }

  getCategoryCount(category: string, window?: number): number {
    const actualWindow = window ?? this.defaultWindow
    const now = Date.now()

    return Array.from(this.counts.entries()).reduce((sum, [type, record]) => {
      if (type.startsWith(category) && now - record.windowStart <= actualWindow) {
        return sum + record.count
      }
      return sum
    }, 0)
  }

  clear(errorType?: string): void {
    if (errorType) {
      this.counts.delete(errorType)
    } else {
      this.counts.clear()
    }
  }

  getAllCounts(): Record<string, { count: number; lastError: number; secondsSinceWindow: number }> {
    const now = Date.now()
    const result: Record<string, { count: number; lastError: number; secondsSinceWindow: number }> = {}

    this.counts.forEach((record, errorType) => {
      const secondsSinceWindow = (now - record.windowStart) / 1000
      result[errorType] = {
        count: record.count,
        lastError: record.lastError,
        secondsSinceWindow: Math.round(secondsSinceWindow),
      }
    })

    return result
  }
}
