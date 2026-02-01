import { LogCollector } from './LogCollector';
import { LogEntry, LogLevel } from '../types/LogTypes';

export class Logger {
  private static collector: LogCollector | null = null;
  
  static initialize(collector: LogCollector): void {
    this.collector = collector;
    
    // 应用启动时清空日志
    collector.clear();
    
    // 拦截全局错误
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      this.error('GLOBAL_ERROR', 'Uncaught error', { 
        error: error.message, 
        stack: error.stack,
        isFatal 
      });
    });
    
    // 拦截console方法
    this.interceptConsole();
  }
  
  static error(tag: string, message: string, context?: any): void {
    if (!this.collector) return;
    
    const entry: LogEntry = {
      id: this.generateId(),
      timestamp: Date.now(),
      level: LogLevel.ERROR,
      tag,
      message,
      context,
      stack: context?.stack || (context instanceof Error ? context.stack : undefined)
    };
    this.collector.add(entry);
  }
  
  static warn(tag: string, message: string, context?: any): void {
    if (!this.collector) return;
    
    this.collector.add({
      id: this.generateId(),
      timestamp: Date.now(),
      level: LogLevel.WARN,
      tag,
      message,
      context
    });
  }
  
  static info(tag: string, message: string, context?: any): void {
    if (!this.collector) return;
    
    this.collector.add({
      id: this.generateId(),
      timestamp: Date.now(),
      level: LogLevel.INFO,
      tag,
      message,
      context
    });
  }
  
  static debug(tag: string, message: string, context?: any): void {
    if (!this.collector) return;
    
    // 开发环境才记录DEBUG
    if (__DEV__) {
      this.collector.add({
        id: this.generateId(),
        timestamp: Date.now(),
        level: LogLevel.DEBUG,
        tag,
        message,
        context
      });
    }
  }
  
  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private static interceptConsole(): void {
    // 保存原始console方法
    const original = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info
    };
    
    // 拦截console.log
    console.log = (...args) => {
      original.log(...args);
      this.debug('CONSOLE', args.join(' '));
    };
    
    // 拦截console.error
    console.error = (...args) => {
      original.error(...args);
      this.error('CONSOLE', args.join(' '));
    };
    
    // 拦截console.warn
    console.warn = (...args) => {
      original.warn(...args);
      this.warn('CONSOLE', args.join(' '));
    };
    
    // 拦截console.info
    console.info = (...args) => {
      original.info(...args);
      this.info('CONSOLE', args.join(' '));
    };
  }
}