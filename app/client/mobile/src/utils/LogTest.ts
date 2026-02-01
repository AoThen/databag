// 测试日志系统
import { Logger } from '../utils/Logger';

// 测试各种日志级别
export function testLogger() {
  Logger.info('TEST', 'Logger system initialized');
  Logger.warn('TEST', 'This is a warning message');
  Logger.error('TEST', 'This is an error message', { 
    userId: '123',
    action: 'test'
  });
  
  // 测试错误堆栈
  try {
    throw new Error('Test error with stack trace');
  } catch (err) {
    Logger.error('TEST', 'Caught test error', err);
  }
  
  Logger.debug('TEST', 'Debug message (only in development)');
}

export function testLogSystem() {
  // 延迟执行，确保LogContext已经初始化
  setTimeout(() => {
    testLogger();
  }, 1000);
}