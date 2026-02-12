import React, { createContext, useState, useEffect } from 'react';
import { LogContextType, LogEntry } from '../types/LogTypes';
import { LogCollector } from '../utils/LogCollector';
import { Logger } from '../utils/Logger';

// 创建日志收集器实例
const collector = new LogCollector();
Logger.initialize(collector);

export const LogContext = createContext<LogContextType>({
  entries: [],
  actions: {
    clearLogs: () => {},
    getFormattedText: () => ''
  }
});

export function LogContextProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  
  useEffect(() => {
    // 监听日志变化
    collector.addListener(setEntries);
    
    return () => {
      collector.removeListener(setEntries);
    };
  }, []);
  
  const value: LogContextType = {
    entries,
    actions: {
      clearLogs: () => {
        collector.clear();
      },
      getFormattedText: () => {
        return collector.getFormattedText();
      }
    }
  };
  
  return <LogContext.Provider value={value}>{children}</LogContext.Provider>;
}