import { Logging } from '../logging'

const DEFAULT_POLL_INTERVAL = 1000
const MIN_POLL_INTERVAL = 100
const MAX_POLL_INTERVAL = 10000
const ADAPTIVE_BACKOFF = 1.5
const ADAPTIVE_ADVANCE = 0.8

type SyncTask = () => Promise<void>

interface SyncTaskEntry {
  id: string
  task: SyncTask
  priority: number
  lastRun: number
  interval: number
  isRunning: boolean
  consecutiveErrors: number
}

export class SyncScheduler {
  private log: Logging
  private tasks: Map<string, SyncTaskEntry> = new Map()
  private timer: NodeJS.Timeout | null = null
  private isRunning: boolean = false
  private networkStatus: 'online' | 'offline' | 'unknown' = 'unknown'
  private pollInterval: number = DEFAULT_POLL_INTERVAL

  constructor(log: Logging) {
    this.log = log
    this.startScheduler()
  }

  public registerTask(
    id: string,
    task: SyncTask,
    priority: number = 5,
    interval: number = DEFAULT_POLL_INTERVAL
  ): void {
    this.log.info(`[SyncScheduler] Registering task: ${id}`)
    this.tasks.set(id, {
      id,
      task,
      priority,
      lastRun: 0,
      interval,
      isRunning: false,
      consecutiveErrors: 0,
    })
  }

  public unregisterTask(id: string): void {
    this.log.info(`[SyncScheduler] Unregistering task: ${id}`)
    this.tasks.delete(id)
  }

  public triggerTask(id: string): void {
    const entry = this.tasks.get(id)
    if (entry) {
      this.log.info(`[SyncScheduler] Manually triggering task: ${id}`)
      entry.lastRun = 0
      this.runTask(entry)
    }
  }

  public setNetworkStatus(status: 'online' | 'offline' | 'unknown'): void {
    if (this.networkStatus !== status) {
      this.log.info(`[SyncScheduler] Network status changed: ${this.networkStatus} -> ${status}`)
      this.networkStatus = status
      this.adjustPollInterval()
    }
  }

  private startScheduler(): void {
    if (this.timer) {
      clearInterval(this.timer)
    }
    this.timer = setInterval(() => {
      this.runTasks()
    }, this.pollInterval)
    this.log.info(`[SyncScheduler] Scheduler started with interval: ${this.pollInterval}ms`)
  }

  private async runTasks(): Promise<void> {
    if (this.isRunning || this.networkStatus === 'offline') {
      return
    }

    this.isRunning = true

    const now = Date.now()
    const tasksToRun: SyncTaskEntry[] = []

    this.tasks.forEach((entry) => {
      if (!entry.isRunning && now - entry.lastRun >= entry.interval) {
        tasksToRun.push(entry)
      }
    })

    if (tasksToRun.length === 0) {
      this.isRunning = false
      return
    }

    tasksToRun.sort((a, b) => a.priority - b.priority)

    this.log.debug(`[SyncScheduler] Running ${tasksToRun.length} tasks`)

    for (const entry of tasksToRun) {
      if (this.networkStatus === 'offline') {
        break
      }
      await this.runTask(entry)
    }

    this.isRunning = false
  }

  private async runTask(entry: SyncTaskEntry): Promise<void> {
    entry.isRunning = true

    try {
      await entry.task()
      entry.lastRun = Date.now()
      entry.consecutiveErrors = 0

      this.log.debug(`[SyncScheduler] Task completed: ${entry.id}`)
    } catch (err) {
      entry.consecutiveErrors++
      this.log.error(`[SyncScheduler] Task error: ${entry.id} (${entry.consecutiveErrors} consecutive)`, err)

      if (entry.consecutiveErrors >= 3) {
        this.adjustPollInterval('backoff')
      }
    } finally {
      entry.isRunning = false
    }
  }

  private adjustPollInterval(direction?: 'backoff' | 'advance'): void {
    const oldInterval = this.pollInterval

    if (direction === 'backoff') {
      this.pollInterval = Math.min(
        this.pollInterval * ADAPTIVE_BACKOFF,
        MAX_POLL_INTERVAL
      )
      this.log.warn(
        `[SyncScheduler] Backoff: ${oldInterval}ms -> ${this.pollInterval}ms`
      )
    } else if (direction === 'advance') {
      this.pollInterval = Math.max(
        this.pollInterval * ADAPTIVE_ADVANCE,
        MIN_POLL_INTERVAL
      )
      this.log.info(
        `[SyncScheduler] Advance: ${oldInterval}ms -> ${this.pollInterval}ms`
      )
    } else if (this.networkStatus === 'offline') {
      this.pollInterval = MAX_POLL_INTERVAL
      this.log.warn(`[SyncScheduler] Network offline, interval: ${this.pollInterval}ms`)
    } else if (this.networkStatus === 'online') {
      this.pollInterval = DEFAULT_POLL_INTERVAL
      this.log.info(`[SyncScheduler] Network online, interval: ${this.pollInterval}ms`)
    }

    this.restartScheduler()
  }

  private restartScheduler(): void {
    this.startScheduler()
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
      this.log.info('[SyncScheduler] Scheduler stopped')
    }
    this.tasks.clear()
  }

  public getTaskStatus(id: string): { running: boolean; lastRun: number; interval: number } | null {
    const entry = this.tasks.get(id)
    if (!entry) {
      return null
    }
    return {
      running: entry.isRunning,
      lastRun: entry.lastRun,
      interval: entry.interval,
    }
  }

  public getAllTasksStatus(): { id: string; running: boolean; lastRun: number; interval: number }[] {
    const tasks: { id: string; running: boolean; lastRun: number; interval: number }[] = []
    this.tasks.forEach((entry) => {
      tasks.push({
        id: entry.id,
        running: entry.isRunning,
        lastRun: entry.lastRun,
        interval: entry.interval,
      })
    })
    return tasks
  }
}
