export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN', 
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  tag: string;
  message: string;
  context?: any;
  stack?: string;
}

export type LogFilter = never; // 不需要过滤功能

export interface LogContextType {
  entries: LogEntry[];
  actions: {
    clearLogs: () => void;
    getFormattedText: () => string;
  };
}