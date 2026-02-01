import { useEffect, useRef } from 'react';

/**
 * 图片预加载Hook
 * 在组件挂载时预加载图片URL，提升用户体验
 */
export function useImagePreload(urls: string[], enabled: boolean = true) {
  const loadedUrls = useRef(new Set<string>());

  useEffect(() => {
    if (!enabled || urls.length === 0) return;

    console.log('[useImagePreload] Preloading', urls.length, 'images');

    urls.forEach(url => {
      // 跳过已加载的URL
      if (loadedUrls.current.has(url)) {
        console.log('[useImagePreload] Already loaded:', url);
        return;
      }

      try {
        const img = new Image();
        img.onload = () => {
          loadedUrls.current.add(url);
          console.log('[useImagePreload] Preloaded:', url);
        };
        img.onerror = (e) => {
          console.error('[useImagePreload] Failed to preload:', url, e);
        };
        img.src = url;
      } catch (err) {
        console.error('[useImagePreload] Error preloading:', url, err);
      }
    });

    // 清理函数
    return () => {
      console.log('[useImagePreload] Cleanup');
      // 清空已加载URL集合
      loadedUrls.current.clear();
      // 注意：Image对象由浏览器自动管理，不需要手动清理
    };
  }, [urls, enabled]);
  
  return {
    isLoaded: (url: string) => loadedUrls.current.has(url),
  };
}