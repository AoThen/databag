import { useContext } from 'react';
import { LogContext } from '../context/LogContext';
import { LogContextType } from '../types/LogTypes';

export function useLogContext(): LogContextType {
  const context = useContext(LogContext);
  if (!context) {
    throw new Error('useLogContext must be used within a LogContextProvider');
  }
  return context;
}