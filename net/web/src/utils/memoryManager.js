class MemoryManager {
  constructor(options = {}) {
    this.maxMemoryMB = options.maxMemoryMB || 100;
    this.maxMemory = this.maxMemoryMB * 1024 * 1024;
    this.cleanupThreshold = options.cleanupThreshold || 0.8;
    this.monitorInterval = options.monitorInterval || 5000;

    this.blobUrls = new Map();
    this.usedMemory = 0;
    this.observers = [];

    if ('performance' in window && 'memory' in performance) {
      this.startMemoryMonitoring();
    }

    this.initStorageEstimate();
  }

  initStorageEstimate() {
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then(estimate => {
        this.storageQuota = estimate.quota;
        this.storageUsage = estimate.usage;
      });
    }
  }

  startMemoryMonitoring() {
    setInterval(() => {
      this.checkMemoryPressure();
    }, this.monitorInterval);
  }

  checkMemoryPressure() {
    if (!performance.memory) return;

    const usedHeap = performance.memory.usedJSHeapSize;
    const limit = performance.memory.jsHeapSizeLimit;
    const usageRatio = usedHeap / limit;

    if (usageRatio > this.cleanupThreshold) {
      this.notifyObservers('pressure', {
        usedHeap,
        limit,
        usageRatio
      });

      this.performCleanup(Math.floor(this.usedMemory * (usageRatio - this.cleanupThreshold + 0.1)));
    }
  }

  register(url, size, metadata = {}) {
    if (this.usedMemory + size > this.maxMemory) {
      this.performCleanup(this.usedMemory + size - this.maxMemory * 0.7);
    }

    this.blobUrls.set(url, {
      size,
      metadata,
      timestamp: Date.now(),
      lastAccess: Date.now(),
      refCount: 1
    });

    this.usedMemory += size;
    return url;
  }

  retain(url) {
    const item = this.blobUrls.get(url);
    if (item) {
      item.refCount++;
      item.lastAccess = Date.now();
    }
  }

  release(url) {
    const item = this.blobUrls.get(url);
    if (item) {
      item.refCount = Math.max(0, item.refCount - 1);
    }
  }

  cleanup(url) {
    const item = this.blobUrls.get(url);
    if (item) {
      URL.revokeObjectURL(url);
      this.usedMemory -= item.size;
      this.blobUrls.delete(url);
    }
  }

  async performCleanup(neededSpace = null) {
    const targetSpace = neededSpace || Math.floor(this.usedMemory * 0.3);
    let freedSpace = 0;

    const entries = Array.from(this.blobUrls.entries())
      .sort((a, b) => a[1].lastAccess - b[1].lastAccess);

    for (const [url, item] of entries) {
      if (freedSpace >= targetSpace) break;

      if (item.refCount <= 0) {
        URL.revokeObjectURL(url);
        this.usedMemory -= item.size;
        this.blobUrls.delete(url);
        freedSpace += item.size;
      }
    }

    if (freedSpace < targetSpace * 0.5) {
      this.notifyObservers('critical', {
        neededSpace: targetSpace,
        freedSpace,
        usedMemory: this.usedMemory
      });
    }

    return freedSpace;
  }

  cleanupAll() {
    for (const url of this.blobUrls.keys()) {
      URL.revokeObjectURL(url);
    }
    this.blobUrls.clear();
    this.usedMemory = 0;
  }

  getStats() {
    const memoryStats = performance.memory ? {
      usedHeap: performance.memory.usedJSHeapSize,
      totalHeap: performance.memory.jsHeapSizeLimit,
      usagePercent: ((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100).toFixed(2)
    } : null;

    return {
      blobMemory: this.usedMemory,
      blobCount: this.blobUrls.size,
      maxBlobMemory: this.maxMemory,
      blobUsagePercent: ((this.usedMemory / this.maxMemory) * 100).toFixed(2),
      memory: memoryStats,
      storage: this.storageQuota ? {
        quota: this.storageQuota,
        usage: this.storageUsage,
        usagePercent: ((this.storageUsage / this.storageQuota) * 100).toFixed(2)
      } : null,
      lruEntries: this.getLRUEntries(5)
    };
  }

  getLRUEntries(count = 5) {
    return Array.from(this.blobUrls.entries())
      .sort((a, b) => a[1].lastAccess - b[1].lastAccess)
      .slice(0, count)
      .map(([url, item]) => ({
        url: url.substring(0, 50) + '...',
        size: this.formatSize(item.size),
        lastAccess: new Date(item.lastAccess).toLocaleTimeString(),
        refCount: item.refCount
      }));
  }

  formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  addObserver(observer) {
    this.observers.push(observer);
  }

  removeObserver(observer) {
    this.observers = this.observers.filter(o => o !== observer);
  }

  notifyObservers(event, data) {
    this.observers.forEach(observer => {
      if (typeof observer === 'function') {
        observer(event, data);
      } else if (observer.onMemoryEvent) {
        observer.onMemoryEvent(event, data);
      }
    });
  }
}

export const memoryManager = new MemoryManager();
export default memoryManager;
