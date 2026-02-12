import { useState, useRef, useEffect, useCallback } from 'react';
import streamingAsset from 'utils/streamingAsset';
import { decryptBlock } from 'context/sealUtil';

export function useVideoAsset(asset, contentKey) {
  const videoRef = useRef(null);
  const revoke = useRef();
  const index = useRef(0);
  const streamInfo = useRef(null);

  const [state, setState] = useState({
    width: 0,
    height: 0,
    active: false,
    dimension: { width: 0, height: 0 },
    loading: false,
    error: false,
    url: null,
    loaded: false,
    block: 0,
    total: 0,
    streaming: false
  });

  const updateState = (value) => {
    setState((s) => ({ ...s, ...value }));
  }

  const clearResources = useCallback(() => {
    if (streamInfo.current) {
      if (streamInfo.current.objectUrl) {
        streamingAsset.cleanup(streamInfo.current.objectUrl);
      }
      streamInfo.current = null;
    }
    if (revoke.current) {
      streamingAsset.cleanup(revoke.current);
      revoke.current = null;
    }
  }, []);

  const cleanupMedia = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = '';
    }
    clearResources();
  }, [clearResources]);

  useEffect(() => {
    return () => {
      cleanupMedia();
    };
  }, [cleanupMedia]);

  const actions = {
    setActive: async (width, height) => {
      if (asset.encrypted) {
        try {
          const view = index.current;
          updateState({ active: true, width, height, error: false, loaded: false, loading: true, url: null, streaming: false });
          
          if (asset.getStreamingMedia && streamingAsset.featureSupport.mse) {
            const mediaElement = videoRef.current;
            if (mediaElement) {
              cleanupMedia();
              streamInfo.current = await asset.getStreamingMedia(
                mediaElement,
                () => view !== index.current,
                (block, total) => updateState({ block, total })
              );
              streamingAsset.retain(streamInfo.current.objectUrl);
              updateState({ streaming: true, loading: false });
            }
          } else {
            const blob = await asset.getDecryptedBlob(
              () => view !== index.current,
              (block, total) => updateState({ block, total })
            );
            const url = await streamingAsset.registerBlobUrl(blob, {
              type: 'video',
              extension: asset.extension
            });
            revoke.current = url;
            updateState({ url, loading: false });
          }
        } catch (err) {
          console.log(err);
          updateState({ error: true, loading: false });
        }
      } else {
        updateState({ active: true, width, height, loading: false, url: asset.hd });
      }
    },
    clearActive: () => {
      index.current += 1;
      updateState({ active: false, loaded: false });
      cleanupMedia();
    },
    setDimension: (dimension) => {
      updateState({ dimension });
    },
    setLoaded: () => {
      updateState({ loaded: true });
    },
    setRef: (ref) => {
      videoRef.current = ref;
    }
  };

  return { state, actions };
}
