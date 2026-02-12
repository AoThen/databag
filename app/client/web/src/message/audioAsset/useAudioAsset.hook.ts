import { useState, useContext, useRef, useEffect } from 'react'
import { AppContext } from '../../context/AppContext'
import { ContextType } from '../../context/ContextType'
import { MediaAsset } from '../../conversation/Conversation'
import { useAssetLoader } from '../../hooks/useAssetLoader'

export function useAudioAsset(topicId: string, asset: MediaAsset) {
  const app = useContext(AppContext) as ContextType
  const [state, setState] = useState({
    dataUrl: null as string | null,
    loading: false,
    loadPercent: 0,
  })

  const updateState = (value: any) => {
    setState((s) => ({ ...s, ...value }))
  }

  // 使用统一的资源加载器
  const [loaderState, loaderActions] = useAssetLoader(async (onProgress) => {
    const { focus } = app.state;
    const assetId = asset.audio ? asset.audio.full : asset.encrypted ? asset.encrypted.parts : null;
    
    if (!focus || assetId == null) {
      throw new Error('No focus or assetId');
    }
    
    return await focus.getTopicAssetUrl(topicId, assetId, onProgress);
  }, [topicId, asset.audio, asset.encrypted]); // 使用具体属性而非整个asset对象

  // 同步loader状态到state
  useEffect(() => {
    if (loaderState.data) {
      updateState({ dataUrl: loaderState.data, loaded: true });
    } else if (loaderState.error) {
      updateState({ loaded: false, loadPercent: 0 });
    } else if (loaderState.loading !== state.loading) {
      updateState({ loading: loaderState.loading });
    } else if (loaderState.loadPercent !== state.loadPercent) {
      updateState({ loadPercent: loaderState.loadPercent });
    }
  }, [loaderState.data, loaderState.loading, loaderState.loadPercent, loaderState.error]);

  const actions = {
    loadAudio: async () => {
      await loaderActions.load();
    },
    cancelLoad: () => {
      loaderActions.cancel();
    },
  }

  return { state, actions }
}