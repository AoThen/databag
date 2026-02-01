import { useEffect, useRef } from 'react';

/**
 * 视频预加载Hook
 * 预加载视频元数据，提升播放体验
 */
export function useVideoPreload(urls: string[], enabled: boolean = true) {
  const loadedUrls = useRef(new Map<string, boolean>());
  const videoElements = useRef(new Map<string, HTMLVideoElement>());

  useEffect(() => {
    if (!enabled || urls.length === 0) return;

    console.log('[useVideoPreload] Preloading', urls.length, 'videos');

    urls.forEach(url => {
      // 跳过已加载的URL
      if (loadedUrls.current.has(url)) {
        console.log('[useVideoPreload] Already preloaded:', url);
        return;
      }

      try {
        const video = document.createElement('video');
        
        // 加载元数据
        video.preload = 'metadata';
        video.style.display = 'none';
        
        video.addEventListener('loadedmetadata', () => {
          loadedUrls.current.set(url, true);
          console.log('[useVideoPreload] Metadata loaded:', url, {
            duration: video.duration,
            width: video.videoWidth,
            height: video.videoHeight,
          });
        });

        video.addEventListener('canplay', () => {
          console.log('[useVideoPreload] Can play:', url);
        });

        video.addEventListener('error', (e) => {
          console.error('[useVideoPreload] Failed to preload:', url, e);
          loadedUrls.current.set(url, false);
        });

        video.src = url;
        document.body.appendChild(video); // 添加到DOM以触发加载
        videoElements.current.set(url, video);
      } catch (err) {
        console.error('[useVideoPreload] Error preloading:', url, err);
        loadedUrls.current.set(url, false);
      }
    });

    // 清理函数
    return () => {
      console.log('[useVideoPreload] Cleanup');
      // 清理所有视频元素
      videoElements.current.forEach((video, url) => {
        try {
          video.pause();
          video.src = '';
          if (video.parentNode) {
            video.parentNode.removeChild(video);
          }
        } catch (err) {
          console.error('[useVideoPreload] Error cleaning up video:', url, err);
        }
      });
      videoElements.current.clear();
      // 清空已加载URL映射
      loadedUrls.current.clear();
    };
  }, [urls, enabled]);
  
  return {
    isLoaded: (url: string) => loadedUrls.current.get(url) === true,
  };
}