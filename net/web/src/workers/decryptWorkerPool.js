class DecryptWorkerPool {
  constructor() {
    this.workers = [];
    this.idleWorkers = [];
    this.queue = new Map();
    this.maxWorkers = 0;
    this.initialized = false;
    this.batchInProgress = new Map();
  }

  init() {
    if (typeof window === 'undefined') return false;

    try {
      if (!window.Worker) {
        console.warn('Web Workers not supported');
        return false;
      }

      this.maxWorkers = Math.min(
        navigator.hardwareConcurrency || 4,
        navigator.hardwareConcurrency ? Math.max(2, navigator.hardwareConcurrency - 1) : 4,
        8
      );

      const workerCount = Math.max(2, this.maxWorkers);

      for (let i = 0; i < workerCount; i++) {
        this.createWorker(i);
      }

      this.initialized = true;
      console.log(`DecryptWorkerPool initialized with ${workerCount} workers`);
      return true;
    } catch (error) {
      console.warn('Failed to initialize decrypt worker pool:', error);
      return false;
    }
  }

  createWorker(index) {
    try {
      const workerScript = `
        import CryptoJS from 'crypto-js';
        let keyCache = new Map();
        function limitCacheSize() {
          if (keyCache.size > 100) {
            const firstKey = keyCache.keys().next().value;
            keyCache.delete(firstKey);
          }
        }
        function getKey(contentKey) {
          if (keyCache.has(contentKey)) {
            return keyCache.get(contentKey);
          }
          const key = CryptoJS.enc.Hex.parse(contentKey);
          keyCache.set(contentKey, key);
          return key;
        }
        function decryptBlock(blockEncrypted, blockIv, contentKey) {
          const iv = CryptoJS.enc.Hex.parse(blockIv);
          const key = getKey(contentKey);
          const enc = CryptoJS.enc.Base64.parse(blockEncrypted);
          const cipher = CryptoJS.lib.CipherParams.create({ ciphertext: enc, iv: iv });
          const dec = CryptoJS.AES.decrypt(cipher, key, { iv: iv });
          limitCacheSize();
          return dec.toString(CryptoJS.enc.Utf8);
        }
        self.onmessage = function(e) {
          const { type, taskId, data, iv, contentKey, chunkIndex } = e.data;
          if (type === 'decrypt') {
            try {
              const result = decryptBlock(data, iv, contentKey);
              self.postMessage({ taskId, chunkIndex, result, success: true });
            } catch (error) {
              self.postMessage({ taskId, chunkIndex, error: error.message, success: false });
            }
          } else if (type === 'clearCache') {
            keyCache.clear();
            self.postMessage({ type: 'cacheCleared' });
          } else if (type === 'terminate') {
            keyCache.clear();
            self.postMessage({ type: 'terminated' });
            self.close();
          }
        };
      `;

      const blob = new Blob([workerScript], { type: 'application/javascript' });
      const worker = new Worker(URL.createObjectURL(blob));

      const workerInfo = {
        worker,
        busy: false,
        id: index,
        createdAt: Date.now()
      };

      worker.onmessage = (e) => this.handleMessage(workerInfo, e.data);
      worker.onerror = (e) => this.handleError(workerInfo, e);

      this.workers.push(workerInfo);
      this.idleWorkers.push(workerInfo);

      return workerInfo;
    } catch (error) {
      console.error(`Failed to create worker ${index}:`, error);
      return null;
    }
  }

  handleMessage(workerInfo, message) {
    const { taskId, chunkIndex, result, error, success, type, current, total } = message;

    if (type === 'progress') {
      return;
    }

    const task = this.queue.get(taskId);

    if (task) {
      if (success) {
        task.results[chunkIndex] = result;
        task.completed++;

        if (task.progressCallback) {
          task.progressCallback(task.completed, task.total);
        }

        if (task.completed === task.total) {
          const duration = performance.now() - task.startTime;
          task.resolve({
            results: task.results,
            duration,
            totalSize: task.total
          });
          this.queue.delete(taskId);
        }
      } else {
        task.reject(new Error(error || 'Decryption failed'));
        this.queue.delete(taskId);
      }
    }

    workerInfo.busy = false;
    this.idleWorkers.push(workerInfo);

    if (this.queue.size > 0) {
      this.processQueue();
    }
  }

  handleError(workerInfo, error) {
    console.error(`Worker ${workerInfo.id} error:`, error);
    workerInfo.busy = false;
    this.idleWorkers.push(workerInfo);
    this.processQueue();
  }

  processQueue() {
    while (this.idleWorkers.length > 0 && this.queue.size > 0) {
      const worker = this.idleWorkers.shift();
      const taskId = this.queue.keys().next().value;

      if (!taskId) continue;

      const task = this.queue.get(taskId);
      if (!task) continue;

      const chunkIndex = task.currentIndex++;
      worker.busy = true;

      worker.worker.postMessage({
        type: 'decrypt',
        taskId,
        data: task.blocks[chunkIndex].data,
        iv: task.blocks[chunkIndex].iv,
        contentKey: task.contentKey,
        chunkIndex
      });
    }
  }

  async decrypt(blocks, contentKey, progressCallback = null) {
    if (!this.initialized || blocks.length === 0) {
      return null;
    }

    if (blocks.length <= 4 || this.idleWorkers.length === 0) {
      return this.decryptSequential(blocks, contentKey);
    }

    return new Promise((resolve, reject) => {
      const taskId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const task = {
        blocks,
        contentKey,
        results: new Array(blocks.length),
        completed: 0,
        total: blocks.length,
        currentIndex: 0,
        resolve,
        reject,
        progressCallback,
        startTime: performance.now()
      };

      this.queue.set(taskId, task);
      this.processQueue();

      setTimeout(() => {
        if (this.queue.has(taskId)) {
          this.queue.delete(taskId);
          reject(new Error('Decryption timeout'));
        }
      }, 120000);
    });
  }

  async decryptSequential(blocks, contentKey, progressCallback = null) {
    const results = [];
    const startTime = performance.now();

    for (let i = 0; i < blocks.length; i++) {
      try {
        const iv = CryptoJS.enc.Hex.parse(blocks[i].iv);
        const key = CryptoJS.enc.Hex.parse(contentKey);
        const enc = CryptoJS.enc.Base64.parse(blocks[i].data);
        const cipher = CryptoJS.lib.CipherParams.create({ ciphertext: enc, iv: iv });
        const dec = CryptoJS.AES.decrypt(cipher, key, { iv: iv });
        results.push(dec.toString(CryptoJS.enc.Utf8));

        if (progressCallback) {
          progressCallback(i + 1, blocks.length);
        }
      } catch (error) {
        console.error(`Sequential decrypt failed at index ${i}:`, error);
        results.push(null);
      }
    }

    const duration = performance.now() - startTime;
    return { results, duration, totalSize: blocks.length };
  }

  getStats() {
    return {
      totalWorkers: this.workers.length,
      idleWorkers: this.idleWorkers.length,
      busyWorkers: this.workers.length - this.idleWorkers.length,
      queuedTasks: this.queue.size,
      initialized: this.initialized
    };
  }

  clearCache() {
    for (const { worker } of this.workers) {
      worker.postMessage({ type: 'clearCache' });
    }
  }

  terminate() {
    for (const { worker } of this.workers) {
      worker.postMessage({ type: 'terminate' });
      worker.terminate();
    }
    this.workers = [];
    this.idleWorkers = [];
    this.queue.clear();
    this.initialized = false;
  }
}

let decryptWorkerPoolInstance = null;

export function getDecryptWorkerPool() {
  if (!decryptWorkerPoolInstance) {
    decryptWorkerPoolInstance = new DecryptWorkerPool();
  }
  return decryptWorkerPoolInstance;
}

export default getDecryptWorkerPool;
