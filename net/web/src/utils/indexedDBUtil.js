class IndexedDBCache {
  constructor(options = {}) {
    this.dbName = options.dbName || 'DatabagMediaCache';
    this.storeName = options.storeName || 'media';
    this.version = options.version || 1;
    this.db = null;
    this.maxSize = options.maxSize || 200 * 1024 * 1024;
    this.defaultTTL = options.ttl || 7 * 24 * 60 * 60 * 1000;

    this.initPromise = this.initDB();
  }

  async initDB() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error('IndexedDB not supported'));
        return;
      }

      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('IndexedDB init error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.setupCleanup();
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('accessTime', 'accessTime', { unique: false });
          store.createIndex('size', 'size', { unique: false });
        }
      };
    });
  }

  async ensureDB() {
    if (!this.db) {
      await this.initPromise;
    }
    return this.db;
  }

  async cacheItem(id, data, metadata = {}) {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const item = {
        id,
        data,
        metadata,
        size: this.getDataSize(data),
        timestamp: Date.now(),
        accessTime: Date.now(),
        expires: Date.now() + (metadata.ttl || this.defaultTTL)
      };

      const request = store.put(item);

      request.onsuccess = () => {
        this.checkSizeLimit();
        resolve(item);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getItem(id, checkExpiry = true) {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('accessTime');

      const request = index.get(id);

      request.onsuccess = () => {
        const item = request.result;

        if (!item) {
          resolve(null);
          return;
        }

        if (checkExpiry && item.expires < Date.now()) {
          this.removeItem(id);
          resolve(null);
          return;
        }

        if (!checkExpiry || item.expires >= Date.now()) {
          this.updateAccessTime(id);
          resolve(item);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  async updateAccessTime(id) {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          item.accessTime = Date.now();
          store.put(item);
        }
        resolve();
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async removeItem(id) {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear() {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllItems() {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);

      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getStats() {
    const items = await this.getAllItems();

    let totalSize = 0;
    let expiredCount = 0;
    const now = Date.now();

    items.forEach(item => {
      totalSize += item.size || this.getDataSize(item.data);
      if (item.expires < now) {
        expiredCount++;
      }
    });

    return {
      itemCount: items.length,
      totalSize,
      maxSize: this.maxSize,
      usagePercent: ((totalSize / this.maxSize) * 100).toFixed(2),
      expiredCount
    };
  }

  async cleanupExpired() {
    const db = await this.ensureDB();
    const now = Date.now();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('timestamp');

      const request = index.openCursor();

      let removedCount = 0;

      request.onsuccess = (event) => {
        const cursor = event.target.result;

        if (cursor) {
          if (cursor.value.expires < now) {
            cursor.delete();
            removedCount++;
          }
          cursor.continue();
        } else {
          resolve(removedCount);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  async checkSizeLimit() {
    const stats = await this.getStats();

    if (stats.totalSize > this.maxSize * 0.9) {
      await this.evictLRU(stats.totalSize - this.maxSize * 0.7);
    }
  }

  async evictLRU(neededSpace) {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('accessTime');

      const request = index.openCursor();

      let freedSpace = 0;
      let removedCount = 0;

      request.onsuccess = (event) => {
        const cursor = event.target.result;

        if (cursor) {
          if (freedSpace < neededSpace) {
            const item = cursor.value;
            const itemSize = item.size || this.getDataSize(item.data);

            cursor.delete();
            freedSpace += itemSize;
            removedCount++;
            cursor.continue();
          } else {
            resolve({ freedSpace, removedCount });
          }
        } else {
          resolve({ freedSpace, removedCount });
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  getDataSize(data) {
    if (data instanceof Blob) {
      return data.size;
    }
    if (data instanceof ArrayBuffer) {
      return data.byteLength;
    }
    if (typeof data === 'string') {
      return new Blob([data]).size;
    }
    return JSON.stringify(data).length;
  }

  setupCleanup() {
    setInterval(async () => {
      const removedCount = await this.cleanupExpired();
      if (removedCount > 0) {
        console.log(`IndexedDBCache: Cleaned ${removedCount} expired items`);
      }
    }, 60 * 60 * 1000);
  }

  async isCached(id) {
    const item = await this.getItem(id);
    return item !== null;
  }

  async getCachedSize(id) {
    const item = await this.getItem(id);
    return item ? (item.size || this.getDataSize(item.data)) : 0;
  }
}

export const mediaCache = new IndexedDBCache();
export default mediaCache;
