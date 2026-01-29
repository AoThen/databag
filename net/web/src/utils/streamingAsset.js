import { getDecryptWorkerPool } from 'workers/decryptWorkerPool';

class StreamingAsset {
  constructor() {
    this.maxMemoryMB = 100;
    this.maxMemory = this.maxMemoryMB * 1024 * 1024;
    this.usedMemory = 0;
    this.blobUrls = new Map();
    this.featureSupport = this.detectFeatures();
    this.workerPool = null;
    this.initWorkerPool();
  }

  detectFeatures() {
    return {
      mse: !!window.MediaSource || !!window.WebKitMediaSource,
      stream: !!window.ReadableStream,
      indexedDB: !!window.indexedDB,
      worker: !!window.Worker
    };
  }

  initWorkerPool() {
    try {
      if (this.featureSupport.worker) {
        this.workerPool = getDecryptWorkerPool();
        if (this.workerPool) {
          const initialized = this.workerPool.init();
          if (initialized) {
            console.log('StreamingAsset: Worker pool initialized');
          } else {
            this.workerPool = null;
          }
        }
      }
    } catch (error) {
      console.warn('Failed to initialize worker pool:', error);
      this.workerPool = null;
    }
  }

  base64ToUint8Array(base64) {
    var binaryString = atob(base64);
    var bytes = new Uint8Array(binaryString.length);
    for (var i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  async getStreamedBlob(parts, decryptBlock, contentKey, abort, progress) {
    const strategy = this.getOptimalStrategy(parts);

    if (strategy === 'streaming' && this.featureSupport.mse) {
      return await this.streamingStrategy(parts, decryptBlock, contentKey, abort, progress);
    } else if (strategy === 'chunked') {
      return await this.chunkedStrategy(parts, decryptBlock, contentKey, abort, progress);
    } else {
      return await this.legacyStrategy(parts, decryptBlock, contentKey, abort, progress);
    }
  }

  getOptimalStrategy(parts) {
    const estimatedSize = parts.reduce((sum, part) => sum + (part.blockIv?.length || 0) * 1.5, 0);
    if (estimatedSize > 50 * 1024 * 1024 && this.featureSupport.mse) {
      return 'streaming';
    } else if (estimatedSize > 5 * 1024 * 1024) {
      return 'chunked';
    }
    return 'legacy';
  }

  async streamingStrategy(parts, decryptBlock, contentKey, abort, progress) {
    const useWorker = this.workerPool && parts.length > 4;

    if (useWorker) {
      return await this.workerStreamingStrategy(parts, contentKey, abort, progress);
    }
    return await this.mainThreadStreamingStrategy(parts, decryptBlock, contentKey, abort, progress);
  }

  async workerStreamingStrategy(parts, contentKey, abort, progress) {
    const chunks = [];
    const batchSize = 4;
    let processed = 0;

    while (processed < parts.length) {
      if (abort()) {
        throw new Error("asset stream aborted");
      }

      const batchEnd = Math.min(processed + batchSize, parts.length);
      const batch = parts.slice(processed, batchEnd);

      const downloadStart = performance.now();
      const downloadPromises = batch.map(async (part, idx) => {
        const url = part.assetUrl || (() => { throw new Error('assetUrl required'); })();
        const response = await fetch(url);
        const block = await response.text();
        return { block, iv: part.blockIv, index: processed + idx };
      });

      const downloaded = await Promise.all(downloadPromises);
      const downloadTime = performance.now() - downloadStart;

      const blocks = downloaded.map(d => ({
        data: d.block,
        iv: d.iv
      }));

      let decryptStartTime = performance.now();
      const decrypted = await this.workerPool.decrypt(blocks, contentKey, (current, total) => {
        progress(processed + current, parts.length);
      });
      const decryptTime = performance.now() - decryptStartTime;

      for (let i = 0; i < decrypted.results.length; i++) {
        if (decrypted.results[i]) {
          const chunk = this.base64ToUint8Array(decrypted.results[i]);
          chunks.push(chunk);

          if (this.usedMemory + chunk.byteLength > this.maxMemory) {
            const blob = new Blob(chunks);
            await this.registerBlobUrl(blob, { size: blob.size, useWorker: true });
            return blob;
          }
        }
      }

      processed = batchEnd;
    }

    progress(parts.length, parts.length);
    const blob = new Blob(chunks);
    await this.registerBlobUrl(blob, { size: blob.size, useWorker: true });
    return blob;
  }

  async mainThreadStreamingStrategy(parts, decryptBlock, contentKey, abort, progress) {
    const chunks = [];

    for (let i = 0; i < parts.length; i++) {
      if (abort()) {
        throw new Error("asset stream aborted");
      }

      progress(i, parts.length);
      const part = parts[i];
      const url = part.assetUrl || (() => { throw new Error('assetUrl required'); })();
      const response = await fetch(url);
      const block = await response.text();
      const decrypted = decryptBlock(block, part.blockIv, contentKey);
      const chunk = this.base64ToUint8Array(decrypted);

      chunks.push(chunk);

      if (this.usedMemory + chunk.byteLength > this.maxMemory) {
        const blob = new Blob(chunks);
        await this.registerBlobUrl(blob, { size: blob.size });
        return blob;
      }
    }

    progress(parts.length, parts.length);
    const blob = new Blob(chunks);
    await this.registerBlobUrl(blob, { size: blob.size });
    return blob;
  }

  async chunkedStrategy(parts, decryptBlock, contentKey, abort, progress) {
    const useWorker = this.workerPool && parts.length > 4;

    if (useWorker) {
      return await this.workerChunkedStrategy(parts, contentKey, abort, progress);
    }
    return await this.mainThreadChunkedStrategy(parts, decryptBlock, contentKey, abort, progress);
  }

  async workerChunkedStrategy(parts, contentKey, abort, progress) {
    const slices = [];
    const batchSize = 4;
    let processed = 0;
    let pos = 0;
    let len = 0;

    while (processed < parts.length) {
      if (abort()) {
        throw new Error("asset chunked download aborted");
      }

      const batchEnd = Math.min(processed + batchSize, parts.length);
      const batch = parts.slice(processed, batchEnd);

      const downloadPromises = batch.map(async (part) => {
        const url = part.assetUrl || (() => { throw new Error('assetUrl required'); })();
        const response = await fetch(url);
        const block = await response.text();
        return { block, iv: part.blockIv };
      });

      const downloaded = await Promise.all(downloadPromises);

      const blocks = downloaded.map(d => ({
        data: d.block,
        iv: d.iv
      }));

      const decrypted = await this.workerPool.decrypt(blocks, contentKey);

      for (const result of decrypted.results) {
        if (result) {
          const slice = this.base64ToUint8Array(result);
          slices.push(slice);
          len += slice.byteLength;

          if (this.usedMemory + len > this.maxMemory * 0.7) {
            break;
          }
        }
      }

      progress(batchEnd, parts.length);

      if (this.usedMemory + len > this.maxMemory * 0.7) {
        break;
      }

      processed = batchEnd;
    }

    const data = new Uint8Array(len);
    for (let i = 0; i < slices.length; i++) {
      data.set(slices[i], pos);
      pos += slices[i].byteLength;
    }

    const blob = new Blob([data]);
    await this.registerBlobUrl(blob, { size: blob.size, useWorker: true });
    return blob;
  }

  async mainThreadChunkedStrategy(parts, decryptBlock, contentKey, abort, progress) {
    const slices = [];
    let pos = 0;
    let len = 0;

    for (let i = 0; i < parts.length; i++) {
      if (abort()) {
        throw new Error("asset chunked download aborted");
      }

      progress(i, parts.length);
      const part = parts[i];
      const url = part.assetUrl || (() => { throw new Error('assetUrl required'); })();
      const response = await fetch(url);
      const block = await response.text();
      const decrypted = decryptBlock(block, part.blockIv, contentKey);
      const slice = this.base64ToUint8Array(decrypted);

      slices.push(slice);
      len += slice.byteLength;

      if (this.usedMemory + len > this.maxMemory * 0.7) {
        break;
      }
    }

    progress(parts.length, parts.length);

    const data = new Uint8Array(len);
    for (let i = 0; i < slices.length; i++) {
      data.set(slices[i], pos);
      pos += slices[i].byteLength;
    }

    const blob = new Blob([data]);
    await this.registerBlobUrl(blob, { size: blob.size });
    return blob;
  }

  async legacyStrategy(parts, decryptBlock, contentKey, abort, progress) {
    const useWorker = this.workerPool && parts.length > 4;

    if (useWorker) {
      return await this.workerLegacyStrategy(parts, contentKey, abort, progress);
    }
    return await this.mainThreadLegacyStrategy(parts, decryptBlock, contentKey, abort, progress);
  }

  async workerLegacyStrategy(parts, contentKey, abort, progress) {
    const slices = [];
    let pos = 0;
    let len = 0;
    const batchSize = 4;

    for (let i = 0; i < parts.length; i += batchSize) {
      if (abort()) {
        throw new Error("asset unseal aborted");
      }

      const batchEnd = Math.min(i + batchSize, parts.length);
      const batch = parts.slice(i, batchEnd);

      const downloadPromises = batch.map(async (part) => {
        const url = part.assetUrl || (() => { throw new Error('assetUrl required'); })();
        const response = await fetch(url);
        const block = await response.text();
        return { block, iv: part.blockIv };
      });

      const downloaded = await Promise.all(downloadPromises);

      const blocks = downloaded.map(d => ({
        data: d.block,
        iv: d.iv
      }));

      const decrypted = await this.workerPool.decrypt(blocks, contentKey);

      for (const result of decrypted.results) {
        if (result) {
          const slice = this.base64ToUint8Array(result);
          slices.push(slice);
          len += slice.byteLength;
        }
      }

      progress(Math.min(i + batchSize, parts.length), parts.length);
    }

    progress(parts.length, parts.length);

    const data = new Uint8Array(len);
    for (let i = 0; i < slices.length; i++) {
      data.set(slices[i], pos);
      pos += slices[i].byteLength;
    }

    const blob = new Blob([data]);
    await this.registerBlobUrl(blob, { size: blob.size, useWorker: true });
    return blob;
  }

  async mainThreadLegacyStrategy(parts, decryptBlock, contentKey, abort, progress) {
    const slices = [];
    let pos = 0;
    let len = 0;

    for (let i = 0; i < parts.length; i++) {
      if (abort()) {
        throw new Error("asset unseal aborted");
      }

      progress(i, parts.length);
      const part = parts[i];
      const url = part.assetUrl || (() => { throw new Error('assetUrl required'); })();
      const response = await fetch(url);
      const block = await response.text();
      const decrypted = decryptBlock(block, part.blockIv, contentKey);
      const slice = this.base64ToUint8Array(decrypted);

      slices.push(slice);
      len += slice.byteLength;
    }

    progress(parts.length, parts.length);

    const data = new Uint8Array(len);
    for (let i = 0; i < slices.length; i++) {
      data.set(slices[i], pos);
      pos += slices[i].byteLength;
    }

    const blob = new Blob([data]);
    await this.registerBlobUrl(blob, { size: blob.size });
    return blob;
  }

  async getStreamingMedia(parts, decryptBlock, contentKey, mediaElement, abort, progress) {
    if (!this.featureSupport.mse) {
      throw new Error("Media Source Extensions not supported");
    }

    return new Promise(async (resolve, reject) => {
      try {
        const mediaSource = new MediaSource();
        const objectUrl = URL.createObjectURL(mediaSource);
        mediaElement.src = objectUrl;

        await new Promise(resolve => {
          mediaSource.addEventListener('sourceopen', () => resolve());
          mediaSource.addEventListener('error', (e) => reject(e));
        });

        const mimeType = this.getMimeType(parts);
        const sourceBuffer = mediaSource.addSourceBuffer(mimeType);
        sourceBuffer.mode = 'segments';

        let chunks = [];
        let totalReceived = 0;

        for (let i = 0; i < parts.length; i++) {
          if (abort()) {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("media streaming aborted"));
            return;
          }

          progress(i, parts.length);

          const part = parts[i];
          const url = part.assetUrl || (() => { throw new Error('assetUrl required'); })();
          const response = await fetch(url);
          const block = await response.text();
          const decrypted = decryptBlock(block, part.blockIv, contentKey);
          const chunk = this.base64ToUint8Array(decrypted);

          if (sourceBuffer.updating) {
            await new Promise(r => sourceBuffer.addEventListener('updateend', r));
          }

          sourceBuffer.appendBuffer(chunk);
          chunks.push(chunk);
          totalReceived += chunk.byteLength;

          if (totalReceived > this.maxMemory) {
            sourceBuffer.remove(0, sourceBuffer.buffered.end(0) - 2);
            chunks = chunks.slice(-10);
          }
        }

        mediaSource.endOfStream();
        resolve({ objectUrl, chunks });
      } catch (error) {
        reject(error);
      }
    });
  }

  getMimeType(parts) {
    if (parts[0]?.mimeType) {
      return parts[0].mimeType;
    }
    return 'video/mp4; codecs="avc1.42E01E"';
  }

  async registerBlobUrl(blob, metadata) {
    const url = URL.createObjectURL(blob);
    const size = blob.size;

    if (this.usedMemory + size > this.maxMemory) {
      await this.performCleanup(this.usedMemory + size - this.maxMemory * 0.7);
    }

    this.blobUrls.set(url, {
      size,
      metadata,
      timestamp: Date.now(),
      refCount: 0
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
      item.refCount--;
    }
  }

  async performCleanup(neededSpace) {
    const entries = Array.from(this.blobUrls.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);

    let freedSpace = 0;
    for (const [url, item] of entries) {
      if (freedSpace >= neededSpace) break;

      if (item.refCount <= 0) {
        URL.revokeObjectURL(url);
        this.blobUrls.delete(url);
        freedSpace += item.size;
        this.usedMemory -= item.size;
      }
    }
  }

  cleanup(url) {
    if (this.blobUrls.has(url)) {
      URL.revokeObjectURL(url);
      this.usedMemory -= this.blobUrls.get(url).size;
      this.blobUrls.delete(url);
    }
  }

  cleanupAll() {
    for (const url of this.blobUrls.keys()) {
      URL.revokeObjectURL(url);
    }
    this.blobUrls.clear();
    this.usedMemory = 0;
  }

  getMemoryStats() {
    return {
      usedMemory: this.usedMemory,
      maxMemory: this.maxMemory,
      blobCount: this.blobUrls.size,
      usagePercent: ((this.usedMemory / this.maxMemory) * 100).toFixed(2),
      workerStats: this.workerPool ? this.workerPool.getStats() : null
    };
  }
}

export const streamingAsset = new StreamingAsset();
export default streamingAsset;
