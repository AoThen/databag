import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchWithTimeout } from 'api/fetchUtil';
import { decryptBlock } from 'context/sealUtil';
import streamingAsset from 'utils/streamingAsset';

export function useTopicItem(topic, contentKey, strings, menuStyle) {

  const [state, setState] = useState({
    editing: false,
    message: null,
    assets: [],
  });

  const updateState = (value) => {
    setState((s) => ({ ...s, ...value }));
  }

  const base64ToUint8Array = (base64) => {
    var binaryString = atob(base64);
    var bytes = new Uint8Array(binaryString.length);
    for (var i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  const getAssetUrl = useCallback((partId) => {
    return topic.assetUrl(partId, topic.id);
  }, [topic]);

  useEffect(() => {
    const assets = [];
    if (topic.assets?.length) {
      topic.assets.forEach(asset => {
        if (asset.encrypted) {
          const encrypted = true;
          const { type, thumb, label, extension, parts } = asset.encrypted;

          const getDecryptedBlob = async (abort, progress) => {
            const enrichedParts = parts.map(part => ({
              ...part,
              assetUrl: getAssetUrl(part.partId)
            }));

            const blob = await streamingAsset.getStreamedBlob(
              enrichedParts,
              decryptBlock,
              contentKey,
              abort,
              progress
            );
            return blob;
          };

          const getStreamingMedia = async (mediaElement, abort, progress) => {
            if (type !== 'video' && type !== 'audio') {
              throw new Error('Streaming only supported for video and audio');
            }

            const enrichedParts = parts.map(part => ({
              ...part,
              assetUrl: getAssetUrl(part.partId),
              mimeType: extension ? `video/${extension}` : undefined
            }));

            return await streamingAsset.getStreamingMedia(
              enrichedParts,
              decryptBlock,
              contentKey,
              mediaElement,
              abort,
              progress
            );
          };

          assets.push({
            type,
            thumb,
            label,
            extension,
            encrypted,
            getDecryptedBlob,
            getStreamingMedia,
            parts: parts.map(part => ({ ...part, assetUrl: getAssetUrl(part.partId) }))
          });
        }
        else {
          const encrypted = false
          if (asset.image) {
            const type = 'image';
            const thumb = topic.assetUrl(asset.image.thumb, topic.id);
            const full = topic.assetUrl(asset.image.full, topic.id);
            assets.push({ type, thumb, encrypted, full });
          }
          else if (asset.video) {
            const type = 'video';
            const thumb = topic.assetUrl(asset.video.thumb, topic.id);
            const lq = topic.assetUrl(asset.video.lq, topic.id);
            const hd = topic.assetUrl(asset.video.hd, topic.id);
            assets.push({ type, thumb, encrypted, lq, hd });
          }
          else if (asset.audio) {
            const type = 'audio';
            const label = asset.audio.label;
            const full = topic.assetUrl(asset.audio.full, topic.id);
            assets.push({ type, label, encrypted, full });
          }
          else if (asset.binary) {
            const type = 'binary';
            const label = asset.binary.label;
            const extension = asset.binary.extension;
            const data = topic.assetUrl(asset.binary.data, topic.id);
            assets.push({ type, label, extension, encrypted, data });
          }
        }
      });
      updateState({ assets });
    }
    // eslint-disable-next-line
  }, [topic.assets]);

  const actions = {
    setEditing: (message) => {
      updateState({ editing: true, message });
    },
    clearEditing: () => {
      updateState({ editing: false });
    },
    setMessage: (message) => {
      updateState({ message });
    },
  };

  return { state, actions };
}

