export interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

export class RequestCache {
  private cache = new Map<string, CacheEntry<any>>();
  private pending = new Map<string, AbortController>();
  private readonly DEFAULT_TTL = 30000; // 30秒缓存

  /**
   * 获取缓存或发起新请求
   * @param key 缓存键
   * @param fetcher 请求函数
   * @param ttl 缓存过期时间（毫秒），默认30秒
   * @returns Promise<T>
   */
  async get<T>(key: string, fetcher: (signal?: AbortSignal) => Promise<T>, ttl: number = this.DEFAULT_TTL): Promise<T> {
    // 1. 检查缓存
    if (this.cache.has(key)) {
      const cached = this.cache.get(key)!;
      if (Date.now() - cached.timestamp < ttl) {
        console.log('[RequestCache] Cache hit:', key);
        return cached.value;
      } else {
        // 缓存过期，删除
        this.cache.delete(key);
      }
    }

    // 2. 取消之前的pending请求
    if (this.pending.has(key)) {
      const controller = this.pending.get(key);
      if (controller) {
        controller.abort();
        console.log('[RequestCache] Aborted previous request:', key);
      }
    }

    // 3. 创建新请求
    const controller = new AbortController();
    this.pending.set(key, controller);

    try {
      console.log('[RequestCache] Fetching:', key);
      const result = await fetcher(controller.signal);
      
      // 4. 存入缓存
      this.cache.set(key, { value: result, timestamp: Date.now() });
      console.log('[RequestCache] Cached:', key);
      
      return result;
    } catch (error) {
      // 确保错误被正确抛出
      console.error('[RequestCache] Request failed:', key, error);
      throw error;
    } finally {
      // 5. 清理pending状态
      this.pending.delete(key);
    }
  }

  /**
   * 清除指定键的缓存
   */
  clearKey(key: string): void {
    this.cache.delete(key);
    this.pending.get(key)?.abort();
    this.pending.delete(key);
  }

  /**
   * 清除所有缓存
   */
  clear(): void {
    this.cache.clear();
    this.pending.forEach(controller => controller.abort());
    this.pending.clear();
    console.log('[RequestCache] Cleared all cache and pending requests');
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pending.size,
    };
  }
}

// 导出单例实例
export const requestCache = new RequestCache();