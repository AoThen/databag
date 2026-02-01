import React, { useState, useEffect } from 'react'
import { MediaAsset } from '../../conversation/Conversation'
import { useImageAsset } from './useImageAsset.hook'
import { Progress, ActionIcon, Image } from '@mantine/core'
import classes from './ImageAsset.module.css'
import { TbX } from "react-icons/tb";
import { useImagePreload } from '../../hooks/useImagePreload';
import { useAssetLoader } from '../../hooks/useAssetLoader';

export function ImageAsset({ topicId, asset }: { topicId: string; asset: MediaAsset }) {
  const { state: assetState, actions: assetActions } = useImageAsset(topicId, asset)
  const [showModal, setShowModal] = useState(false)
  const [showImage, setShowImage] = useState(false)
  
  // 使用统一的资源加载器
  const [loaderState, loaderActions] = useAssetLoader(async (onProgress) => {
    return await assetActions.loadImage(onProgress);
  });
  
  // 图片预加载：当有dataUrl时预加载
  useImagePreload(
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
      setShowImage(true)
      // 如果还没有加载，则加载
      if (!assetState.dataUrl && !loaderState.loading) {
        loaderActions.load();
      }
    } else {
      setShowImage(false)
      loaderActions.cancel()
    }
  }, [showModal])
  
  // 同步加载状态到组件状态
  useEffect(() => {
    if (loaderState.loading !== assetState.loading) {
      console.log('[ImageAsset] Syncing loader state:', loaderState.loading);
    }
  }, [loaderState.loading, assetState.loading]);
  
  return (
    <div>
      {assetState.thumbUrl && (
        <div className={classes.asset} onClick={show}>
          <Image radius="sm" className={classes.thumb} src={assetState.thumbUrl} />
        </div>
      )}
      
      {showModal && (
        <div className={classes.modal} style={showImage ? { opacity: 1 } : { opacity: 0 }}>
          <div className={classes.frame}>
            <Image className={classes.image} fit="contain" src={assetState.thumbUrl} />
          </div>
          {assetState.dataUrl && (
            <div className={classes.frame} style={assetState.loaded || loaderState.data ? { opacity: 1 } : { opacity: 0 }}>
              <Image 
                className={classes.image} 
                fit="contain" 
                src={assetState.dataUrl} 
                onLoad={assetActions.setLoaded} 
                onError={(e) => console.log('[ImageAsset] Image load error:', e)}
              />
            </div>
          )}
          {(assetState.loading || loaderState.loading) && (assetState.loadPercent > 0 || loaderState.loadPercent > 0) && (
            <Progress className={classes.progress} value={Math.max(assetState.loadPercent, loaderState.loadPercent)} />
          )}
          <ActionIcon className={classes.close} variant="filled" size="lg" onClick={hide}>
            <TbX size="lg} />
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
      setShowImage(true)
      actions.loadImage()
    } else {
      setShowImage(false)
      actions.cancelLoad()
    }
  }, [showModal])

  return (
    <div>
      {state.thumbUrl && (
        <div className={classes.asset} onClick={show}>
          <Image radius="sm" className={classes.thumb} src={state.thumbUrl} />
        </div>
      )}

      {showModal && (
        <div className={classes.modal} style={showImage ? { opacity: 1 } : { opacity: 0 }}>
          <div className={classes.frame}>
            <Image className={classes.image} fit="contain" src={state.thumbUrl} />
          </div>
          {state.dataUrl && (
            <div className={classes.frame} style={state.loaded ? { opacity: 1 } : { opacity: 0 }}>
              <Image className={classes.image} fit="contain" src={state.dataUrl} onLoad={actions.setLoaded} />
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
