import { useState, useRef, useEffect, useCallback } from 'react';
import streamingAsset from 'utils/streamingAsset';
import { decryptBlock } from 'context/sealUtil';

export function useAudioAsset(asset, contentKey) {
  const audioRef = useRef(null);
  const revoke = useRef();
  const index = useRef(0);
  const streamInfo = useRef(null);

  const [state, setState] = useState({
    active: false,
    loading: false,
    error: false,
    ready: false,
    url: null,
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
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    clearResources();
  }, [clearResources]);

  useEffect(() => {
    return () => {
      cleanupMedia();
    };
  }, [cleanupMedia]);

  const actions = {
    setActive: async () => {
      if (asset.encrypted) {
        try {
          const view = index.current;
          updateState({ active: true, ready: false, error: false, loading: true, url: null, streaming: false });
          
          if (asset.getStreamingMedia && streamingAsset.featureSupport.mse) {
            const mediaElement = audioRef.current;
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
              type: 'audio',
              label: asset.label
            });
            revoke.current = url;
            updateState({ loading: false, url });
          }
        } catch (err) {
          console.log(err);
          updateState({ error: true, loading: false });
        }
      } else {
        updateState({ active: true, loading: false, url: asset.full });
      }
    },
    clearActive: () => {
      index.current += 1;
      updateState({ active: false, url: null, ready: false });
      cleanupMedia();
    },
    ready: () => {
      updateState({ ready: true });
    },
    setRef: (ref) => {
      audioRef.current = ref;
    }
  };

  return { state, actions };
}
