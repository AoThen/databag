import React, { useState, useEffect } from 'react'
import { MediaAsset } from '../../conversation/Conversation'
import { useVideoAsset } from './useVideoAsset.hook'
import { Progress, ActionIcon, Image } from '@mantine/core'
import classes from './VideoAsset.module.css'
import { TbPlayerPlay, TbX } from "react-icons/tb";
import { useResizeDetector } from 'react-resize-detector'
import { useVideoPreload } from '../../hooks/useVideoPreload';
import { useAssetLoader } from '../../hooks/useAssetLoader';

export function VideoAsset({ topicId, asset }: { topicId: string; asset: MediaAsset }) {
  const { state: assetState, actions: assetActions } = useVideoAsset(topicId, asset)
  const [showModal, setShowModal] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const { width, height, ref } = useResizeDetector()
  
  // 使用统一的资源加载器
  const [loaderState, loaderActions] = useAssetLoader(async (onProgress) => {
    return await assetActions.loadVideo(onProgress);
  });
  
  // 视频预加载：当有dataUrl时预加载元数据
  useVideoPreload(
    [assetState.dataUrl].filter(Boolean),
    !!assetState.dataUrl && !showModal
  );
  
  const show = () => {
    setShowModal(true)
  }
  
  const hide = () => {
    setShowModal(false)
    loaderActions.cancel(); // 取消加载
  }
  
  useEffect(() => {
    if (showModal) {
      setShowVideo(true)
      // 如果还没有加载，则加载
      if (!assetState.dataUrl && !loaderState.loading) {
        loaderActions.load();
      }
    } else {
      setShowVideo(false)
      loaderActions.cancel()
    }
  }, [showModal])
  
  // 同步加载状态到组件状态
  useEffect(() => {
    if (loaderState.loading !== assetState.loading) {
      console.log('[VideoAsset] Syncing loader state:', loaderState.loading);
    }
  }, [loaderState.loading, assetState.loading]);
  
  return (
    <div>
      {assetState.thumbUrl && (
        <div className={classes.asset} onClick={show}>
          <Image radius="sm" className={classes.thumb} src={assetState.thumbUrl} />
          <TbPlayerPlay className={classes.play} size={32} />
        </div>
      )}
      
      {showModal && (
        <div className={classes.modal} style={showVideo ? { opacity: 1 } : { opacity: 0 }}>
          <div className={classes.frame} style={assetState.dataUrl ? { opacity: 0 } : { opacity: 1 }}>
            <Image ref={ref} className={classes.image} fit="contain" src={assetState.thumbUrl} />
          </div>
          {assetState.dataUrl && (
            <div className={classes.video} style={{ width, height }}>
              <video 
                className={classes.image} 
                controls 
                preload="auto"
                width={width} 
                height={height} 
                src={assetState.dataUrl} 
                playsInline={true} 
                autoPlay={true}
                onPlay={() => console.log('[VideoAsset] Video playing')}
                onWaiting={() => console.log('[VideoAsset] Video buffering')}
                onCanPlay={() => console.log('[VideoAsset] Video ready to play')}
                onError={(e) => console.log('[VideoAsset] Video error:', e)}
              />
            </div>
          )}
          {(assetState.loading || loaderState.loading) && (assetState.loadPercent > 0 || loaderState.loadPercent > 0) && (
            <Progress className={classes.progress} value={Math.max(assetState.loadPercent, loaderState.loadPercent)} />
          )}
          <ActionIcon className={classes.close} variant="filled" size="lg" onClick={hide}>
            <TbX size="lg" />
          </ActionIcon>
        </div>
      )}
    </div>
  )
}

  const hide = () => {
    setShowModal(false)
  }

  useEffect(() => {
    if (showModal) {
      setShowVideo(true)
      actions.loadVideo()
    } else {
      setShowVideo(false)
      actions.cancelLoad()
    }
  }, [showModal])

  return (
    <div>
      {state.thumbUrl && (
        <div className={classes.asset} onClick={show}>
          <Image radius="sm" className={classes.thumb} src={state.thumbUrl} />
          <TbPlayerPlay className={classes.play} size={32} />
        </div>
      )}

      {showModal && (
        <div className={classes.modal} style={showVideo ? { opacity: 1 } : { opacity: 0 }}>
          <div className={classes.frame} style={state.dataUrl ? { opacity: 0 } : { opacity: 1 }}>
            <Image ref={ref} className={classes.image} fit="contain" src={state.thumbUrl} />
          </div>
          {state.dataUrl && (
            <div className={classes.video} style={{ width, height }}>
              <video className={classes.image} controls width={width} height={height} src={state.dataUrl} playsInline={true} autoPlay={true} />
            </div>
          )}
          {state.loading && state.loadPercent > 0 && <Progress className={classes.progress} value={state.loadPercent} />}
          <ActionIcon className={classes.close} variant="filled" size="lg" onClick={hide}>
            <TbX size="lg" />
          </ActionIcon>
        </div>
      )}
    </div>
  )
}
