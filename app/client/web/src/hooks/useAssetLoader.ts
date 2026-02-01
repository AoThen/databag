import { useState, useCallback, useRef } from 'react';

export interface AssetLoaderState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  loadPercent: number;
}

export interface AssetLoaderActions<T> {
  load: () => Promise<void>;
  cancel: () => void;
}

/**
 * 统一的资源加载Hook
 * 避免在4个文件中重复实现相同的加载逻辑
 */
export function useAssetLoader<T>(
  loadFn: (onProgress?: (percent: number) => boolean) => Promise<T>,
  dependencies: any[] = []
): [AssetLoaderState<T>, AssetLoaderActions<T>] {
  const [state, setState] = useState<AssetLoaderState<T>>({
    data: null,
    loading: false,
    error: null,
    loadPercent: 0,
  });
  
  const cancelled = useRef(false);
  const isLoading = useRef(false);

  const load = useCallback(async () => {
    // 防止重复加载
    if (isLoading.current || state.data || cancelled.current) {
      console.log('[useAssetLoader] Load skipped:', {
        isLoading: isLoading.current,
        hasData: !!state.data,
        cancelled: cancelled.current,
      });
      return;
    }

    isLoading.current = true;
    cancelled.current = false;
    setState(prev => ({ ...prev, loading: true, error: null, loadPercent: 0 }));

    try {
      console.log('[useAssetLoader] Loading asset...');
      const data = await loadFn((percent: number) => {
        // 进度回调，如果已取消则返回false停止加载
        if (cancelled.current) {
          console.log('[useAssetLoader] Load cancelled at', percent + '%');
          return false;
        }
        setState(prev => ({ ...prev, loadPercent: percent }));
        return true;
      });

      // 只有在未被取消的情况下才设置数据
      if (!cancelled.current) {
        setState({ data, loading: false, error: null, loadPercent: 100 });
        console.log('[useAssetLoader] Asset loaded successfully');
      } else {
        console.log('[useAssetLoader] Asset cancelled after load');
        setState(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      // 只有在未被取消的情况下才设置错误
      if (!cancelled.current) {
        const err = error instanceof Error ? error : new Error(String(error));
        setState({ 
          data: null, 
          loading: false, 
          error: err, 
          loadPercent: 0 
        });
        console.log('[useAssetLoader] Asset load error:', err);
        throw err; // 重新抛出错误
      } else {
        console.log('[useAssetLoader] Error ignored due to cancellation');
        setState(prev => ({ ...prev, loading: false }));
        return; // 取消时不抛出错误
      }
    } finally {
      isLoading.current = false;
    }
  }, [loadFn, state.data, ...dependencies]);

  const cancel = useCallback(() => {
    if (isLoading.current) {
      console.log('[useAssetLoader] Cancelling load...');
      cancelled.current = true;
    }
  }, []);

  return [
    state,
    { load, cancel }
  ];
}