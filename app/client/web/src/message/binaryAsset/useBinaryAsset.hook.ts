import { useState, useContext, useEffect } from 'react'
import { AppContext, AppState } from '../../context/AppContext'
import { MediaAsset } from '../../conversation/Conversation'
import { useAssetLoader } from '../../hooks/useAssetLoader'

interface BinaryAssetState {
  dataUrl: string
  loading: boolean
  loadPercent: number
  loaded?: boolean
}

export function useBinaryAsset(topicId: string, asset: MediaAsset) {
  const app = useContext(AppContext) as { state: AppState }
  const [state, setState] = useState<BinaryAssetState>({
    dataUrl: '',
    loading: false,
    loadPercent: 0,
  })

  const updateState = (value: Partial<BinaryAssetState>) => {
    setState((s) => ({ ...s, ...value }))
  }

  // 使用统一的资源加载器
  const [loaderState, loaderActions] = useAssetLoader(async (onProgress) => {
    const { focus } = app.state;
    const assetId = asset.binary ? asset.binary.data : asset.encrypted ? asset.encrypted.parts?.[0]?.partId : null;
    
    if (!focus || !assetId) {
      throw new Error('No focus or assetId');
    }
    
    return await focus.getTopicAssetUrl(topicId, assetId, onProgress);
  }, [topicId, asset.binary, asset.encrypted]); // 使用具体属性而非整个asset对象

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
    loadBinary: async () => {
      await loaderActions.load();
    },
    cancelLoad: () => {
      loaderActions.cancel();
    },
  }

  return { state, actions }
}