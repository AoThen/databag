import CryptoJS from 'crypto-js';

let keyCache = new Map();

function getKey(contentKey) {
  if (keyCache.has(contentKey)) {
    return keyCache.get(contentKey);
  }
  const key = CryptoJS.enc.Hex.parse(contentKey);
  keyCache.set(contentKey, key);
  return key;
}

function limitCacheSize() {
  if (keyCache.size > 100) {
    const firstKey = keyCache.keys().next().value;
    keyCache.delete(firstKey);
  }
}

function decryptBlock(blockEncrypted, blockIv, contentKey) {
  const iv = CryptoJS.enc.Hex.parse(blockIv);
  const key = getKey(contentKey);
  const enc = CryptoJS.enc.Base64.parse(blockEncrypted);
  const cipher = CryptoJS.lib.CipherParams.create({ ciphertext: enc, iv: iv });
  const dec = CryptoJS.AES.decrypt(cipher, key, { iv: iv });
  const result = dec.toString(CryptoJS.enc.Utf8);
  limitCacheSize();
  return result;
}

self.onmessage = async function(e) {
  const { type, taskId, data, iv, contentKey, chunkIndex } = e.data;

  if (type === 'decrypt') {
    try {
      const startTime = performance.now();
      const result = decryptBlock(data, iv, contentKey);
      const duration = performance.now() - startTime;

      self.postMessage({
        taskId,
        chunkIndex,
        result,
        duration,
        success: true
      });
    } catch (error) {
      self.postMessage({
        taskId,
        chunkIndex,
        error: error.message,
        success: false
      });
    }
  } else if (type === 'batch') {
    const { blocks } = e.data;
    const results = [];
    const startTime = performance.now();

    for (let i = 0; i < blocks.length; i++) {
      try {
        const result = decryptBlock(blocks[i].data, blocks[i].iv, contentKey);
        results.push({ success: true, result, index: i });
      } catch (error) {
        results.push({ success: false, error: error.message, index: i });
      }

      if ((i + 1) % 5 === 0) {
        self.postMessage({
          type: 'progress',
          current: i + 1,
          total: blocks.length
        });
      }
    }

    const duration = performance.now() - startTime;

    self.postMessage({
      type: 'batchComplete',
      taskId,
      results,
      duration,
      success: true
    });
  } else if (type === 'clearCache') {
    keyCache.clear();
    self.postMessage({ type: 'cacheCleared' });
  } else if (type === 'terminate') {
    keyCache.clear();
    self.postMessage({ type: 'terminated' });
    self.close();
  }
};
