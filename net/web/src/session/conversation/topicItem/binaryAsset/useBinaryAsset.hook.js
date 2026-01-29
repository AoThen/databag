import { useState, useRef, useEffect, useCallback } from 'react';
import streamingAsset from 'utils/streamingAsset';
import mediaCache from 'utils/indexedDBUtil';
import { decryptBlock } from 'context/sealUtil';

export function useBinaryAsset(asset, contentKey) {
  const index = useRef(0);
  const updated = useRef(false);
  const downloadUrl = useRef(null);

  const [state, setState] = useState({
    error: false,
    unsealing: false,
    block: 0,
    total: 0,
    cached: false,
    cacheProgress: 0
  });

  const updateState = (value) => {
    setState((s) => ({ ...s, ...value }));
  }

  const getCacheId = useCallback(() => {
    return `binary_${asset.label}_${asset.extension}`;
  }, [asset.label, asset.extension]);

  useEffect(() => {
    const checkCache = async () => {
      if (asset.encrypted) {
        const cacheId = getCacheId();
        const isCached = await mediaCache.isCached(cacheId);
        if (isCached) {
          updateState({ cached: true });
        }
      }
    };
    checkCache();
  }, [asset, getCacheId]);

  const actions = {
    download: async () => {
      if (asset.encrypted) {
        if (!state.unsealing) {
          try {
            const cacheId = getCacheId();
            updateState({ error: false, unsealing: true });
            const view = index.current;

            const cachedItem = await mediaCache.getItem(cacheId);
            if (cachedItem) {
              const url = await streamingAsset.registerBlobUrl(cachedItem.data, {
                type: 'binary',
                label: asset.label,
                extension: asset.extension
              });
              
              const link = document.createElement("a");
              link.download = `${asset.label}.${asset.extension.toLowerCase()}`;
              link.href = url;
              link.click();
              
              setTimeout(() => {
                streamingAsset.cleanup(url);
              }, 1000);
              
              updateState({ unsealing: false, cached: true });
              return;
            }

            updateState({ active: true, ready: false, error: false, loading: true, url: null });

            const blob = await asset.getDecryptedBlob(
              () => view !== index.current,
              (block, total) => {
                if (!updated.current || block === total) {
                  updated.current = true;
                  setTimeout(() => {
                    updated.current = false;
                  }, 1000);
                  const progress = Math.round((block / total) * 100);
                  updateState({ block, total, cacheProgress: progress });
                }
              }
            );

            await mediaCache.cacheItem(cacheId, blob, {
              label: asset.label,
              extension: asset.extension,
              timestamp: Date.now()
            });

            const url = await streamingAsset.registerBlobUrl(blob, {
              type: 'binary',
              label: asset.label,
              extension: asset.extension
            });
            downloadUrl.current = url;

            const link = document.createElement("a");
            link.download = `${asset.label}.${asset.extension.toLowerCase()}`;
            link.href = url;
            link.click();

            setTimeout(() => {
              streamingAsset.cleanup(url);
              downloadUrl.current = null;
            }, 1000);

            updateState({ unsealing: false, cached: true, cacheProgress: 100 });
          } catch (err) {
            console.log(err);
            updateState({ error: true, unsealing: false });
          }
        }
      } else {
        const link = document.createElement("a");
        link.download = `${asset.label}.${asset.extension.toLowerCase()}`;
        link.href = asset.data;
        link.click();
      }
    },
    clear: () => {
      if (downloadUrl.current) {
        streamingAsset.cleanup(downloadUrl.current);
        downloadUrl.current = null;
      }
    }
  };

  return { state, actions };
}
