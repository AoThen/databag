import { LogEntry, LogLevel } from '../types/LogTypes';

export class LogCollector {
  private buffer: LogEntry[] = [];
  private readonly MAX_ENTRIES = 1000; // 严格限制1000条
  private listeners: Set<(entries: LogEntry[]) => void> = new Set();
  
  add(entry: LogEntry): void {
    // 添加到开头，最新的在前
    this.buffer.unshift(entry);
    
    // 超过1000条则删除最旧的
    if (this.buffer.length > this.MAX_ENTRIES) {
      this.buffer = this.buffer.slice(0, this.MAX_ENTRIES);
    }
    
    // 通知监听器
    this.notifyListeners();
  }
  
  clear(): void {
    this.buffer = [];
    this.notifyListeners();
  }
  
  getAll(): LogEntry[] {
    return [...this.buffer];
  }
  
  getFormattedText(): string {
    return this.buffer
      .map(entry => {
        const date = new Date(entry.timestamp).toLocaleString();
        const stack = entry.stack ? `\n${entry.stack}` : '';
        return `[${date}] ${entry.level} [${entry.tag}] ${entry.message}${stack}`;
      })
      .join('\n\n');
  }
  
  addListener(listener: (entries: LogEntry[]) => void): void {
    this.listeners.add(listener);
  }
  
  removeListener(listener: (entries: LogEntry[]) => void): void {
    this.listeners.delete(listener);
  }
  
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.getAll());
      } catch (err) {
        console.error('Log listener error:', err);
      }
    });
  }
}