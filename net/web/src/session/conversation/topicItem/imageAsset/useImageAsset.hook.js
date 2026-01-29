import { useState, useRef, useEffect, useCallback } from 'react';
import streamingAsset from 'utils/streamingAsset';
import { decryptBlock } from 'context/sealUtil';

export function useImageAsset(asset, contentKey) {
  const imgRef = useRef(null);
  const revoke = useRef();
  const index = useRef(0);
  const loadedUrl = useRef(null);

  const [state, setState] = useState({
    popout: false,
    width: 0,
    height: 0,
    loading: false,
    error: false,
    url: null,
    block: 0,
    total: 0,
    progressive: false,
    progressiveUrl: null
  });

  const updateState = (value) => {
    setState((s) => ({ ...s, ...value }));
  }

  const clearResources = useCallback(() => {
    if (loadedUrl.current) {
      streamingAsset.release(loadedUrl.current);
      loadedUrl.current = null;
    }
    if (revoke.current) {
      streamingAsset.cleanup(revoke.current);
      revoke.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearResources();
    };
  }, [clearResources]);

  const actions = {
    setPopout: async (width, height) => {
      if (asset.encrypted) {
        try {
          const view = index.current;
          updateState({ popout: true, width, height, error: false, loading: true, url: null });
          
          if (asset.parts && asset.parts.length > 1) {
            const firstPart = asset.parts[0];
            const initialBlob = await streamingAsset.getStreamedBlob(
              [firstPart],
              decryptBlock,
              contentKey,
              () => view !== index.current,
              (block, total) => updateState({ block, total, progressive: true })
            );

            const blobUrl = URL.createObjectURL(initialBlob);
            revoke.current = blobUrl;
            updateState({ progressiveUrl: blobUrl, progressive: true });
          }
          
          const blob = await asset.getDecryptedBlob(
            () => view !== index.current,
            (block, total) => updateState({ block, total })
          );
          
          const url = await streamingAsset.registerBlobUrl(blob, {
            type: 'image',
            extension: asset.extension
          });
          
          streamingAsset.retain(url);
          loadedUrl.current = url;
          updateState({ loading: false, url, progressive: false });
          
          if (revoke.current) {
            URL.revokeObjectURL(revoke.current);
            revoke.current = null;
          }
          revoke.current = null;
          
        } catch (err) {
          console.log(err);
          updateState({ error: true, loading: false, progressive: false });
        }
      } else {
        updateState({ popout: true, width, height, loading: false, url: asset.full });
      }
    },
    clearPopout: () => {
      index.current += 1;
      updateState({ popout: false, progressive: false });
      clearResources();
    },
    setRef: (ref) => {
      imgRef.current = ref;
    }
  };

  return { state, actions, imgRef };
}
